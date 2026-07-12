'use client';

import { useEffect } from 'react';

export default function ConfirmDialog({
  title,
  message,
  confirmLabel = 'Delete',
  busy,
  onConfirm,
  onCancel
}) {
  useEffect(() => {
    const onKey = e => e.key === 'Escape' && onCancel();
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [onCancel]);

  return (
    <div className="confirm-overlay" onMouseDown={onCancel}>
      <div className="confirm-dialog" onMouseDown={e => e.stopPropagation()}>
        <h3 className="confirm-dialog__title">{title}</h3>
        <p className="confirm-dialog__msg">{message}</p>
        <div className="confirm-dialog__foot">
          <button className="adm-btn adm-btn--ghost" onClick={onCancel} disabled={busy}>
            Cancel
          </button>
          <button className="adm-btn adm-btn--danger" onClick={onConfirm} disabled={busy}>
            {busy ? 'Deleting…' : confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );
}
