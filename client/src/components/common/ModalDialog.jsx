/**
 * Module: Modal Dialog
 * File: ModalDialog.jsx
 * Purpose: Provides a shared admin-style dialog shell with title, close button, and footer actions.
 */

import { useEffect, useRef } from "react";

import IconButton from "./IconButton";

/**
 * Displays a reusable modal dialog when open.
 */
function ModalDialog({
  isOpen,
  title,
  onClose,
  children,
  footer = null,
  width = "720px",
  className = ""
}) {
  const dialogRef = useRef(null);
  const editableSelector =
    'input:not([type="hidden"]):not([readonly]):not([disabled]), select:not([disabled]), textarea:not([readonly]):not([disabled])';

  useEffect(() => {
    if (!isOpen) {
      return;
    }

    const bodyEditableTarget = dialogRef.current?.querySelector(`.dialog-card__body ${editableSelector}`);
    const footerButtonTarget = dialogRef.current?.querySelector(".dialog-card__footer button:not([disabled])");
    const fallbackButtonTarget = dialogRef.current?.querySelector(".dialog-card__header button:not([disabled])");
    const focusTarget = bodyEditableTarget || footerButtonTarget || fallbackButtonTarget;

    if (focusTarget instanceof HTMLElement) {
      window.requestAnimationFrame(() => {
        focusTarget.focus();
      });
    }
  }, [isOpen]);

  if (!isOpen) {
    return null;
  }

  return (
    <div className="dialog-overlay" role="presentation" onClick={onClose}>
      <section
        ref={dialogRef}
        className={`dialog-card ${className}`.trim()}
        role="dialog"
        aria-modal="true"
        aria-label={title}
        style={{ maxWidth: width }}
        onClick={(event) => event.stopPropagation()}
      >
        <header className="dialog-card__header">
          <div>
            <h3>{title}</h3>
          </div>
          <IconButton icon="close" label="Close dialog" onClick={onClose} />
        </header>
        <div className="dialog-card__body">{children}</div>
        {footer ? <footer className="dialog-card__footer">{footer}</footer> : null}
      </section>
    </div>
  );
}

export default ModalDialog;
