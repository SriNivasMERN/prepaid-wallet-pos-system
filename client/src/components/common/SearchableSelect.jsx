import { useEffect, useMemo, useRef, useState } from "react";

function SearchableSelect({
  value,
  onChange,
  loadOptions,
  getOptionValue,
  getOptionLabel,
  getOptionMeta,
  placeholder = "Search and select",
  disabled = false,
  minSearchLength = 0,
  emptyText = "No matching records found.",
  loadingText = "Searching..."
}) {
  const [searchText, setSearchText] = useState("");
  const [options, setOptions] = useState([]);
  const [isOpen, setIsOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const blurTimerRef = useRef(null);
  const requestSequenceRef = useRef(0);

  const selectedOption = useMemo(
    () => options.find((option) => getOptionValue(option) === value) || null,
    [getOptionValue, options, value]
  );

  useEffect(() => {
    requestSequenceRef.current += 1;
    const trimmedSearch = searchText.trim();

    if (disabled || trimmedSearch.length < minSearchLength) {
      setOptions([]);
      setIsLoading(false);
      return undefined;
    }

    const requestId = requestSequenceRef.current;
    const requestController = new AbortController();

    const loadTimer = window.setTimeout(async () => {
      setIsLoading(true);

      try {
        const nextOptions = await loadOptions(trimmedSearch, {
          signal: requestController.signal
        });
        if (requestSequenceRef.current === requestId) {
          setOptions(Array.isArray(nextOptions) ? nextOptions : []);
        }
      } catch {
        if (requestSequenceRef.current === requestId) {
          setOptions([]);
        }
      } finally {
        if (requestSequenceRef.current === requestId) {
          setIsLoading(false);
        }
      }
    }, 250);

    return () => {
      requestSequenceRef.current += 1;
      requestController.abort();
      window.clearTimeout(loadTimer);
    };
  }, [disabled, loadOptions, minSearchLength, searchText]);

  useEffect(
    () => () => {
      requestSequenceRef.current += 1;

      if (blurTimerRef.current) {
        window.clearTimeout(blurTimerRef.current);
      }
    },
    []
  );

  useEffect(() => {
    if (!value) {
      setSearchText("");
      return;
    }

    if (selectedOption) {
      setSearchText(getOptionLabel(selectedOption));
    }
  }, [getOptionLabel, selectedOption, value]);

  const handleSelect = (option) => {
    onChange(getOptionValue(option), option);
    setSearchText(getOptionLabel(option));
    setIsOpen(false);
  };

  const handleInputChange = (event) => {
    const nextValue = event.target.value;

    setSearchText(nextValue);
    setIsOpen(true);

    if (!nextValue.trim()) {
      onChange("", null);
    }
  };

  return (
    <div className="autocomplete-field searchable-select">
      <input
        type="text"
        value={searchText}
        onChange={handleInputChange}
        onFocus={() => {
          if (blurTimerRef.current) {
            window.clearTimeout(blurTimerRef.current);
          }

          setIsOpen(true);
        }}
        onBlur={() => {
          blurTimerRef.current = window.setTimeout(() => setIsOpen(false), 120);
        }}
        placeholder={placeholder}
        autoComplete="off"
        disabled={disabled}
      />
      {isOpen && !disabled && searchText.trim().length >= minSearchLength ? (
        <div className="autocomplete-panel" role="listbox">
          {isLoading ? (
            <div className="autocomplete-panel__empty">{loadingText}</div>
          ) : options.length > 0 ? (
            options.map((option) => (
              <button
                key={getOptionValue(option)}
                type="button"
                className="autocomplete-option"
                onMouseDown={(event) => event.preventDefault()}
                onClick={() => handleSelect(option)}
              >
                <strong>{getOptionLabel(option)}</strong>
                {getOptionMeta ? <span>{getOptionMeta(option)}</span> : null}
              </button>
            ))
          ) : (
            <div className="autocomplete-panel__empty">{emptyText}</div>
          )}
        </div>
      ) : null}
    </div>
  );
}

export default SearchableSelect;
