import LoginForm from './LoginForm.jsx';
import './login.css';

export const metadata = { title: 'Sign in — The Bespoke' };

export default async function LoginPage({ searchParams }) {
  const sp = await searchParams;
  const next = typeof sp?.next === 'string' ? sp.next : '';

  return (
    <div className="login">
      <div className="login__card">
        <img className="login__logo" src="/image/upload/logo.jpg" alt="The Bespoke" />
        <h1 className="login__title">Sign in</h1>
        <p className="login__sub">Access your account or the admin dashboard.</p>
        <LoginForm next={next} />
      </div>
    </div>
  );
}
