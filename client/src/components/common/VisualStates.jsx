function LoadingPulse({ label = "Loading" }) {
  return (
    <span className="loading-pulse" aria-hidden="true">
      <span />
      <span />
      <span />
      <span className="sr-only">{label}</span>
    </span>
  );
}

function AppLoadingScreen({ message = "Preparing workspace..." }) {
  return (
    <main className="app-loader" aria-live="polite" aria-busy="true">
      <section className="app-loader__card">
        <div className="brand-badge app-loader__badge">PWP</div>
        <div className="app-loader__copy">
          <strong>Prepaid Wallet POS System</strong>
          <span>{message}</span>
        </div>
        <div className="app-loader__bar" aria-hidden="true">
          <span />
        </div>
      </section>
    </main>
  );
}

function LoadingState({ message = "Loading records..." }) {
  return (
    <div className="visual-state visual-state--loading" role="status" aria-live="polite">
      <LoadingPulse label={message} />
      <span>{message}</span>
    </div>
  );
}

function EmptyState({ title = "No records found", message = "Try changing the filters or create a new record." }) {
  return (
    <div className="visual-state visual-state--empty">
      <span className="visual-state__icon" aria-hidden="true">
        <span />
      </span>
      <strong>{title}</strong>
      <p>{message}</p>
    </div>
  );
}

function TableEmptyState({ colSpan, title, message }) {
  return (
    <tr>
      <td colSpan={String(colSpan)}>
        <EmptyState title={title} message={message} />
      </td>
    </tr>
  );
}

export { AppLoadingScreen, EmptyState, LoadingState, LoadingPulse, TableEmptyState };
