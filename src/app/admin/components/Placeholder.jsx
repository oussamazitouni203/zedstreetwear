// Simple scaffold for admin sections that aren't built out yet.
export default function Placeholder({ title, note }) {
  return (
    <div className="adm-placeholder">
      <div className="adm-placeholder__badge">Coming soon</div>
      <h2 className="adm-placeholder__title">{title}</h2>
      <p className="adm-placeholder__note">{note}</p>
    </div>
  );
}
