// Renders a real <img> when `src` is provided, otherwise a striped placeholder.
export default function ImageBox({ src, alt = '', label = 'Image', dark = false }) {
  return (
    <div className="img-box">
      {src ? (
        <img src={src} alt={alt} />
      ) : (
        <div className={`img-placeholder${dark ? ' img-placeholder--dark' : ''}`}>{label}</div>
      )}
    </div>
  );
}
