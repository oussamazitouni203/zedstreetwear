import { useEffect } from 'react';
import { money } from '../data.js';
import { StatusPill } from './StatusPill.jsx';

const STATUSES = ['Pending', 'Shipped', 'Delivered', 'Canceled', 'Abandoned', 'Returned'];

export default function OrderModal({ order, busy, onClose, onSetStatus, onSetState, onDelete }) {
  useEffect(() => {
    const onKey = e => e.key === 'Escape' && onClose();
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [onClose]);

  if (!order) return null;

  const itemsTotal = order.items.reduce((s, i) => s + i.price * i.quantity, 0);

  return (
    <div className="order-modal-overlay" onMouseDown={onClose}>
      <div className="order-modal" onMouseDown={e => e.stopPropagation()}>
        <div className="order-modal__head">
          <div>
            <p className="order-modal__eyebrow">Order</p>
            <h2 className="order-modal__number">{order.number}</h2>
          </div>
          <button className="order-modal__close" aria-label="Close" onClick={onClose}>×</button>
        </div>

        <div className="order-modal__meta">
          <div><span className="k">Customer</span><span className="v">{order.customer}</span></div>
          {order.email && <div><span className="k">Email</span><span className="v">{order.email}</span></div>}
          <div><span className="k">Date</span><span className="v">{order.date}</span></div>
          {order.shippingRegion && <div><span className="k">Ships to</span><span className="v">{order.shippingRegion}</span></div>}
          {order.shippingMethod && (
            <div>
              <span className="k">Shipping</span>
              <span className="v">{order.shippingMethod}{order.shippingCost != null ? ` — ${order.shippingCost === 0 ? 'Free' : money(order.shippingCost)}` : ''}</span>
            </div>
          )}
          <div>
            <span className="k">Status</span>
            <span className="v"><StatusPill status={order.status} /></span>
          </div>
          <div><span className="k">Bucket</span><span className="v">{order.state[0] + order.state.slice(1).toLowerCase()}</span></div>
        </div>

        <div className="order-modal__section">
          <p className="order-modal__label">Items</p>
          <div className="order-modal__items">
            {order.items.map(i => (
              <div key={i.id} className="order-modal__item">
                <span className="name">{i.name}</span>
                <span className="qty">× {i.quantity}</span>
                <span className="price num">{money(i.price * i.quantity)}</span>
              </div>
            ))}
          </div>
          <div className="order-modal__total">
            <span>Total</span>
            <span className="num">{money(order.total || itemsTotal)}</span>
          </div>
        </div>

        <div className="order-modal__section">
          <p className="order-modal__label">Set status</p>
          <div className="order-modal__statuses">
            {STATUSES.map(s => (
              <button
                key={s}
                className={`status-choice${order.status === s ? ' active' : ''}`}
                disabled={busy || order.status === s}
                onClick={() => onSetStatus(order.id, s)}
              >
                {s}
              </button>
            ))}
          </div>
        </div>

        <div className="order-modal__foot">
          {order.status !== 'Returned' && (
            <button className="adm-btn adm-btn--ghost" disabled={busy} onClick={() => onSetStatus(order.id, 'Returned')}>
              ↩ Mark as returned
            </button>
          )}
          {order.state === 'CURRENT' && (
            <>
              <button className="adm-btn adm-btn--ghost" disabled={busy} onClick={() => onSetState(order.id, 'ARCHIVED')}>
                Archive
              </button>
              <button className="adm-btn adm-btn--ghost" disabled={busy} onClick={() => onSetState(order.id, 'TRASHED')}>
                Move to trash
              </button>
            </>
          )}
          {order.state === 'ARCHIVED' && (
            <>
              <button className="adm-btn adm-btn--ghost" disabled={busy} onClick={() => onSetState(order.id, 'CURRENT')}>
                Restore to current
              </button>
              <button className="adm-btn adm-btn--ghost" disabled={busy} onClick={() => onSetState(order.id, 'TRASHED')}>
                Move to trash
              </button>
            </>
          )}
          {order.state === 'TRASHED' && (
            <>
              <button className="adm-btn adm-btn--ghost" disabled={busy} onClick={() => onSetState(order.id, 'CURRENT')}>
                Restore
              </button>
              <button
                className="adm-btn adm-btn--danger"
                disabled={busy}
                onClick={() => onDelete(order.id)}
              >
                Delete permanently
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
