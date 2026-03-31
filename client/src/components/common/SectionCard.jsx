/**
 * Module: Shared UI Component
 * File: SectionCard.jsx
 * Purpose: Renders a reusable card wrapper for grouped page sections.
 */

/**
 * Displays a titled content panel used across pages.
 */
function SectionCard({ title, actions, children, className = "" }) {
  return (
    <section className={`section-card ${className}`.trim()}>
      {(title || actions) && (
        <div className="section-card__header">
          {title ? <h2>{title}</h2> : <span />}
          {actions ? <div className="section-card__actions">{actions}</div> : null}
        </div>
      )}
      <div className="section-card__body">{children}</div>
    </section>
  );
}

export default SectionCard;