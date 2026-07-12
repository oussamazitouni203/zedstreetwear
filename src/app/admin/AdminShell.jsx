import Sidebar from './components/Sidebar.jsx';
import { logout } from '../login/actions.js';
import './admin.css';

// Static admin chrome (sidebar + topbar) for sub-route pages such as the
// product add/edit form. The SPA dashboard renders its own chrome inside AdminApp.
export default function AdminShell({ adminName, pendingCount = 0, active, title, children }) {
  return (
    <div className="admin">
      <Sidebar view={active} pendingCount={pendingCount} adminName={adminName} />
      <main className="adm-main">
        <div className="adm-topbar">
          <h1>{title}</h1>
          <div className="adm-topbar__right">
            <a href="/" className="site-link">View site ↗</a>
            <form action={logout}>
              <button type="submit" className="adm-btn adm-btn--ghost">Log out</button>
            </form>
          </div>
        </div>
        <div className="adm-content">{children}</div>
      </main>
    </div>
  );
}
