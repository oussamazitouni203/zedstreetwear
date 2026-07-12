// Bulk action bar shown when one or more rows are selected.
export default function BulkBar({ count, onClear, children }) {
  if (count === 0) return null;
  return (
    <div className="bulk-bar">
      <span className="bulk-bar__count">{count} selected</span>
      <div className="bulk-bar__actions">{children}</div>
      <button type="button" className="bulk-bar__clear" onClick={onClear}>Clear</button>
    </div>
  );
}
