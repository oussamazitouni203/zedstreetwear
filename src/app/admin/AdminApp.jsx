'use client';

import { useState, useEffect, useRef } from 'react';
import './admin.css';
import * as actions from './actions.js';
import { logout } from '../login/actions.js';
import Sidebar from './components/Sidebar.jsx';
import Dashboard from './components/Dashboard.jsx';
import Products from './components/Products.jsx';
import Orders from './components/Orders.jsx';
import Bundles from './components/Bundles.jsx';
import Users from './components/Users.jsx';
import Categories from './components/Categories.jsx';
import OrderModal from './components/OrderModal.jsx';
import ConfirmDialog from './components/ConfirmDialog.jsx';

const TITLES = {
  dashboard: 'Dashboard',
  products: 'Products',
  categories: 'Categories',
  orders: 'Orders',
  bundles: 'Bundles & discounts',
  users: 'Users'
};

const NOTICES = {
  'product-added': 'Product has been added.',
  'product-updated': 'Product has been updated.',
  'category-added': 'Category has been added.',
  'category-updated': 'Category has been updated.',
  'bundle-added': 'Bundle has been added.',
  'bundle-updated': 'Bundle has been updated.',
  'user-added': 'User has been added.',
  'user-updated': 'User has been updated.'
};

export default function AdminApp({ initial, adminName, adminId, initialView = 'dashboard', notice = null }) {
  const [view, setView] = useState(initialView);
  const [search, setSearch] = useState('');
  const [toast, setToast] = useState(null);
  const toastTimer = useRef(null);

  const showToast = (message, type = 'success') => {
    setToast({ message, type });
    clearTimeout(toastTimer.current);
    toastTimer.current = setTimeout(() => setToast(null), 3200);
  };

  // Show a toast when we arrive with a ?notice=… (after saving on a form page),
  // then strip the param so a refresh doesn't replay it.
  useEffect(() => {
    if (!notice || !NOTICES[notice]) return;
    showToast(NOTICES[notice], 'success');
    const url = new URL(window.location.href);
    url.searchParams.delete('notice');
    window.history.replaceState({}, '', url);
  }, [notice]);

  const [products, setProducts] = useState(initial.products);
  const [orders, setOrders] = useState(initial.orders);
  const [bundles, setBundles] = useState(initial.bundles);
  const [users, setUsers] = useState(initial.users);
  const [categories, setCategories] = useState(initial.categories);

  const [busy, setBusy] = useState(false);
  const [activeOrderId, setActiveOrderId] = useState(null);
  const [confirming, setConfirming] = useState(null); // { title, message, confirmLabel, run }

  const navigate = key => {
    setView(key);
    setSearch('');
    // Keep the URL in sync with the current tab so a refresh stays put
    // (instead of reverting to the ?tab= left over from the last edit).
    const url = key === 'dashboard' ? '/admin' : `/admin?tab=${key}`;
    window.history.replaceState(null, '', url);
  };

  const withBusy = async fn => {
    setBusy(true);
    try {
      return await fn();
    } catch (e) {
      alert(e?.message || 'Something went wrong.');
    } finally {
      setBusy(false);
    }
  };

  const deleteProduct = id =>
    withBusy(async () => {
      await actions.deleteProduct(id);
      setProducts(ps => ps.filter(p => p.id !== id));
      showToast('Product deleted.');
    });

  const deleteCategory = id =>
    withBusy(async () => {
      await actions.deleteCategory(id);
      setCategories(cs => cs.filter(c => c.id !== id));
      showToast('Category deleted.');
    });

  const setOrderStatus = (id, status) =>
    withBusy(async () => {
      setOrders(await actions.setOrderStatus(id, status));
    });

  const setOrderState = (id, state) =>
    withBusy(async () => {
      setOrders(await actions.setOrderState(id, state));
    });

  const deleteOrderForever = id =>
    withBusy(async () => {
      setOrders(await actions.deleteOrderForever(id));
      setActiveOrderId(null);
    });

  const toggleBundle = id =>
    withBusy(async () => {
      const updated = await actions.toggleBundle(id);
      setBundles(bs => bs.map(b => (b.id === id ? updated : b)));
    });

  const changeDiscount = (id, delta) =>
    withBusy(async () => {
      const updated = await actions.changeBundleDiscount(id, delta);
      setBundles(bs => bs.map(b => (b.id === id ? updated : b)));
    });

  const deleteBundle = id =>
    withBusy(async () => {
      await actions.deleteBundle(id);
      setBundles(bs => bs.filter(b => b.id !== id));
      showToast('Bundle deleted.');
    });

  const deleteUser = id =>
    withBusy(async () => {
      await actions.deleteUser(id);
      setUsers(us => us.filter(u => u.id !== id));
      showToast('User deleted.');
    });

  // Deletes are routed through a confirmation dialog before running.
  const askDeleteProduct = id => {
    const p = products.find(x => x.id === id);
    setConfirming({
      title: 'Delete product',
      message: `Delete “${p?.name ?? 'this product'}”? This can’t be undone.`,
      confirmLabel: 'Delete',
      run: () => deleteProduct(id)
    });
  };

  const askDeleteCategory = id => {
    const c = categories.find(x => x.id === id);
    setConfirming({
      title: 'Delete category',
      message: `Delete “${c?.name ?? 'this category'}”? Products keep existing but lose this category; any subcategories become top-level.`,
      confirmLabel: 'Delete',
      run: () => deleteCategory(id)
    });
  };

  const askDeleteBundle = id => {
    const b = bundles.find(x => x.id === id);
    setConfirming({
      title: 'Delete bundle',
      message: `Delete “${b?.name ?? 'this bundle'}”? This can’t be undone.`,
      confirmLabel: 'Delete',
      run: () => deleteBundle(id)
    });
  };

  const askDeleteOrder = id => {
    const o = orders.find(x => x.id === id);
    setConfirming({
      title: 'Delete order permanently',
      message: `Permanently delete order ${o?.number ?? ''}? Later orders will be renumbered. This can’t be undone.`,
      confirmLabel: 'Delete permanently',
      run: () => deleteOrderForever(id)
    });
  };

  const askDeleteUser = id => {
    const u = users.find(x => x.id === id);
    setConfirming({
      title: 'Delete user',
      message: `Delete admin account “${u?.name ?? ''}” (${u?.email ?? ''})? They will lose access immediately.`,
      confirmLabel: 'Delete',
      run: () => deleteUser(id)
    });
  };

  // ---- Bulk actions ----
  const plural = (n, word) => `${n} ${word}${n === 1 ? '' : 's'}`;

  const bulkDeleteProducts = ids => {
    if (ids.length === 0) return;
    setConfirming({
      title: 'Delete products',
      message: `Delete ${plural(ids.length, 'selected product')}? This can’t be undone.`,
      confirmLabel: 'Delete',
      run: () =>
        withBusy(async () => {
          await actions.deleteProducts(ids);
          const gone = new Set(ids);
          setProducts(ps => ps.filter(p => !gone.has(p.id)));
          showToast(`${plural(ids.length, 'product')} deleted.`);
        })
    });
  };

  const bulkDeleteCategories = ids => {
    if (ids.length === 0) return;
    setConfirming({
      title: 'Delete categories',
      message: `Delete ${plural(ids.length, 'selected category')}? Products keep existing; subcategories become top-level.`,
      confirmLabel: 'Delete',
      run: () =>
        withBusy(async () => {
          await actions.deleteCategories(ids);
          const gone = new Set(ids);
          setCategories(cs => cs.filter(c => !gone.has(c.id)));
          showToast(`${plural(ids.length, 'category')} deleted.`);
        })
    });
  };

  const bulkDeleteBundles = ids => {
    if (ids.length === 0) return;
    setConfirming({
      title: 'Delete bundles',
      message: `Delete ${plural(ids.length, 'selected bundle')}? This can’t be undone.`,
      confirmLabel: 'Delete',
      run: () =>
        withBusy(async () => {
          await actions.deleteBundles(ids);
          const gone = new Set(ids);
          setBundles(bs => bs.filter(b => !gone.has(b.id)));
          showToast(`${plural(ids.length, 'bundle')} deleted.`);
        })
    });
  };

  const bulkActiveBundles = (ids, active) =>
    withBusy(async () => {
      await actions.setBundlesActive(ids, active);
      const set = new Set(ids);
      setBundles(bs => bs.map(b => (set.has(b.id) ? { ...b, active } : b)));
      showToast(`${plural(ids.length, 'bundle')} ${active ? 'activated' : 'deactivated'}.`);
    });

  const bulkDeleteUsers = ids => {
    if (ids.length === 0) return;
    setConfirming({
      title: 'Delete users',
      message: `Delete ${plural(ids.length, 'selected admin account')}? They will lose access immediately.`,
      confirmLabel: 'Delete',
      run: () =>
        withBusy(async () => {
          const res = await actions.deleteUsers(ids);
          const gone = new Set(res.ids);
          setUsers(us => us.filter(u => !gone.has(u.id)));
          showToast(`${plural(res.ids.length, 'user')} deleted.`);
        })
    });
  };

  const bulkOrdersState = (ids, state) =>
    withBusy(async () => {
      setOrders(await actions.setOrdersState(ids, state));
      const verb = state === 'ARCHIVED' ? 'archived' : state === 'TRASHED' ? 'moved to trash' : 'restored';
      showToast(`${plural(ids.length, 'order')} ${verb}.`);
    });

  const bulkDeleteOrders = ids => {
    if (ids.length === 0) return;
    setConfirming({
      title: 'Delete orders permanently',
      message: `Permanently delete ${plural(ids.length, 'order')}? Remaining orders will be renumbered. This can’t be undone.`,
      confirmLabel: 'Delete permanently',
      run: () =>
        withBusy(async () => {
          setOrders(await actions.deleteOrdersForever(ids));
          showToast(`${plural(ids.length, 'order')} deleted.`);
        })
    });
  };

  const pendingCount = orders.filter(o => o.state === 'CURRENT' && o.status === 'Pending').length;
  const activeOrder = activeOrderId ? orders.find(o => o.id === activeOrderId) : null;

  return (
    <div className={`admin${busy ? ' admin--busy' : ''}`}>
      {toast && (
        <div className={`adm-toast adm-toast--${toast.type}`} role="status">
          {toast.message}
        </div>
      )}
      <Sidebar view={view} onNavigate={navigate} pendingCount={pendingCount} adminName={adminName} />
      <main className="adm-main">
        <div className="adm-topbar">
          <h1>{TITLES[view]}</h1>
          <div className="adm-topbar__right">
            <input
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="Search…"
            />
            <a href="/" className="site-link">View site ↗</a>
            <form action={logout}>
              <button type="submit" className="adm-btn adm-btn--ghost">Log out</button>
            </form>
          </div>
        </div>
        <div className="adm-content">
          {view === 'dashboard' && (
            <Dashboard
              orders={orders.filter(o => o.state !== 'TRASHED')}
              onViewOrders={() => navigate('orders')}
            />
          )}
          {view === 'products' && (
            <Products
              products={products}
              search={search}
              onDelete={askDeleteProduct}
              onBulkDelete={bulkDeleteProducts}
            />
          )}
          {view === 'categories' && (
            <Categories
              categories={categories}
              search={search}
              onDelete={askDeleteCategory}
              onBulkDelete={bulkDeleteCategories}
            />
          )}
          {view === 'orders' && (
            <Orders
              orders={orders}
              search={search}
              onOpen={o => setActiveOrderId(o.id)}
              onBulkState={bulkOrdersState}
              onBulkDelete={bulkDeleteOrders}
            />
          )}
          {view === 'bundles' && (
            <Bundles
              bundles={bundles}
              onToggle={toggleBundle}
              onDiscount={changeDiscount}
              onDelete={askDeleteBundle}
              onBulkDelete={bulkDeleteBundles}
              onBulkActive={bulkActiveBundles}
            />
          )}
          {view === 'users' && (
            <Users
              users={users}
              search={search}
              currentUserId={adminId}
              onDelete={askDeleteUser}
              onBulkDelete={bulkDeleteUsers}
            />
          )}
        </div>
      </main>
      {activeOrder && (
        <OrderModal
          order={activeOrder}
          busy={busy}
          onClose={() => setActiveOrderId(null)}
          onSetStatus={setOrderStatus}
          onSetState={setOrderState}
          onDelete={askDeleteOrder}
        />
      )}
      {confirming && (
        <ConfirmDialog
          title={confirming.title}
          message={confirming.message}
          confirmLabel={confirming.confirmLabel}
          busy={busy}
          onCancel={() => setConfirming(null)}
          onConfirm={async () => {
            await confirming.run();
            setConfirming(null);
          }}
        />
      )}
    </div>
  );
}
