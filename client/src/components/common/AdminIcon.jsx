/**
 * Module: Admin Icon
 * File: AdminIcon.jsx
 * Purpose: Renders lightweight admin-dashboard action icons without adding a new icon dependency.
 */

const iconPaths = {
  add: "M12 5v14M5 12h14",
  edit: "M4 20h4l10.5-10.5-4-4L4 16v4ZM13.5 6.5l4 4",
  delete: "M5 7h14M9 7V5h6v2M8 7l1 12h6l1-12M10 11v5M14 11v5",
  close: "M6 6l12 12M18 6 6 18",
  refresh: "M20 11a8 8 0 1 0 2 5M20 4v7h-7",
  search: "m21 21-4.35-4.35M10.5 18a7.5 7.5 0 1 1 0-15 7.5 7.5 0 0 1 0 15Z",
  view: "M2 12s3.6-6 10-6 10 6 10 6-3.6 6-10 6-10-6-10-6Zm10 3a3 3 0 1 0 0-6 3 3 0 0 0 0 6Z",
  details: "M7 7h10M7 12h10M7 17h7",
  save: "M6 4h10l4 4v12H4V4h2Zm2 0v5h8V4M8 20v-6h8v6",
  key: "M14 7a4 4 0 1 1-7.75 1.4L2 12.65V16h3v2h2v-2h2.35l1.52-1.52A4 4 0 0 1 14 7Z",
  alert: "M12 8v5M12 17h.01M10.3 3.9 2.9 17.2a1.4 1.4 0 0 0 1.2 2.1h15.8a1.4 1.4 0 0 0 1.2-2.1L13.7 3.9a1.4 1.4 0 0 0-2.4 0Z"
};

/**
 * Displays one action icon.
 */
function AdminIcon({ name, size = 18, strokeWidth = 1.8 }) {
  const path = iconPaths[name] || iconPaths.details;

  return (
    <svg
      aria-hidden="true"
      className="admin-icon"
      viewBox="0 0 24 24"
      width={size}
      height={size}
      fill="none"
      stroke="currentColor"
      strokeWidth={strokeWidth}
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d={path} />
    </svg>
  );
}

export default AdminIcon;
