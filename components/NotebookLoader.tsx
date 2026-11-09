/** A CSS-only flipping notebook. It stays hidden for a moment so fast loads never flash it. */
export function NotebookLoader({ label = "Loading", className = "" }: { label?: string; className?: string }) {
  return (
    <div className={`notebook-loader ${className}`} role="status">
      <div className="notebook" aria-hidden="true">
        <span className="notebook-cover" />
        <span className="notebook-page notebook-page-left" />
        <span className="notebook-page notebook-page-right" />
        <span className="notebook-leaf" style={{ "--leaf": 0, "--z": "3px" } as React.CSSProperties} />
        <span className="notebook-leaf" style={{ "--leaf": 1, "--z": "2px" } as React.CSSProperties} />
        <span className="notebook-leaf" style={{ "--leaf": 2, "--z": "1px" } as React.CSSProperties} />
        <span className="notebook-rings" />
      </div>
      <span className="notebook-label">{label}</span>
    </div>
  );
}
