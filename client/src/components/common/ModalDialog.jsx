/**
 * Module: Modal Dialog
 * File: ModalDialog.jsx
 * Purpose: Provides a shared admin-style dialog shell with title, close button, and footer actions.
 */

import IconButton from "./IconButton";

/**
 * Displays a reusable modal dialog when open.
 */
function ModalDialog({ isOpen, title, onClose, children, footer = null, width = "720px" }) {
  if (!isOpen) {
    return null;
  }

  return (
    <div className="dialog-overlay" role="presentation" onClick={onClose}>
      <section
        className="dialog-card"
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
