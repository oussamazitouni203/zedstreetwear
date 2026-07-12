'use client';

import { useActionState } from 'react';
import { useFormStatus } from 'react-dom';
import { login } from './actions.js';

function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <button type="submit" className="login__btn" disabled={pending}>
      {pending ? 'Signing in…' : 'Sign in'}
    </button>
  );
}

export default function LoginForm({ next = '' }) {
  const [state, formAction] = useActionState(login, {});

  return (
    <form action={formAction} className="login__form">
      <input type="hidden" name="next" value={next} />
      <label className="login__label">
        Email
        <input type="email" name="email" autoComplete="email" required autoFocus />
      </label>
      <label className="login__label">
        Password
        <input type="password" name="password" autoComplete="current-password" required />
      </label>
      {state?.error && <p className="login__error">{state.error}</p>}
      <SubmitButton />
    </form>
  );
}
