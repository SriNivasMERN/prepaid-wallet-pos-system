/**
 * Module: Icon Button
 * File: IconButton.jsx
 * Purpose: Renders subtle icon-first admin action buttons with accessible labels.
 */

import AdminIcon from "./AdminIcon";

/**
 * Displays an icon button with an optional text label.
 */
function IconButton({
  icon,
  label,
  title,
  variant = "neutral",
  onClick,
  type = "button",
  disabled = false,
  text = ""
}) {
  return (
    <button
      type={type}
      className={`icon-button icon-button--${variant}${text ? " icon-button--with-text" : ""}`}
      onClick={onClick}
      title={title || label}
      aria-label={label}
      disabled={disabled}
    >
      <AdminIcon name={icon} />
      {text ? <span>{text}</span> : null}
    </button>
  );
}

export default IconButton;
