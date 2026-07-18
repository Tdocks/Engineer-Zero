"use client";

import { useEffect, useRef, useState } from "react";
import type { SupabaseClient, User } from "@supabase/supabase-js";
import { LogIn, LogOut, Mail, ShieldCheck } from "lucide-react";
import { browserSupabase } from "@/lib/browser-supabase";

/**
 * Account controls are intentionally optional for the personal pilot. When a
 * hosted Supabase project is absent, this reports the local-only boundary
 * instead of rendering a pretend sign-in or claiming cross-device sync.
 */
export function AccountControls() {
  const client = useRef<SupabaseClient | null>(null);
  const dialog = useRef<HTMLDialogElement>(null);
  const [supabase, setSupabase] = useState<SupabaseClient | null>(null);
  const [configurationChecked, setConfigurationChecked] = useState(false);
  const [user, setUser] = useState<User | null>(null);
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState("");

  useEffect(() => {
    client.current = browserSupabase();
    setSupabase(client.current);
    setConfigurationChecked(true);
    if (!client.current) return;
    client.current.auth.getUser().then(({ data }) => setUser(data.user));
    const { data: listener } = client.current.auth.onAuthStateChange((_event, session) => setUser(session?.user ?? null));
    return () => listener.subscription.unsubscribe();
  }, []);

  if (!configurationChecked || !supabase) {
    return <span className="account-pilot-status" title="Hosted accounts are not configured in this environment."><ShieldCheck size={15} aria-hidden="true" /> Local pilot</span>;
  }

  const sendMagicLink = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setStatus("");
    const { error } = await client.current!.auth.signInWithOtp({
      email,
      options: { emailRedirectTo: `${window.location.origin}/learn` },
    });
    setStatus(error ? error.message : "Check your email for a secure sign-in link.");
  };

  if (user) {
    return (
      <div className="account-signed-in">
        <span title={user.email ?? "Signed in"}>{user.email ?? "Signed in"}</span>
        <button onClick={() => client.current?.auth.signOut()} aria-label="Sign out"><LogOut size={15} aria-hidden="true" /></button>
      </div>
    );
  }

  return (
    <>
      <button className="account-sign-in" onClick={() => dialog.current?.showModal()}>
        <LogIn size={15} aria-hidden="true" /> Sign in
      </button>
      <dialog ref={dialog} className="account-dialog" aria-labelledby="account-dialog-title">
        <form method="dialog" className="dialog-close-row"><button aria-label="Close sign-in">Close</button></form>
        <div>
          <span className="account-dialog-icon"><Mail size={18} aria-hidden="true" /></span>
          <h2 id="account-dialog-title">Continue your learning</h2>
          <p>We will email a one-time sign-in link. Your verified work can then be saved separately from local study drafts.</p>
        </div>
        <form onSubmit={sendMagicLink} className="account-form">
          <label>Email address<input type="email" required value={email} onChange={(event) => setEmail(event.target.value)} placeholder="you@example.com" autoComplete="email" /></label>
          <button className="primary" type="submit">Email me a sign-in link</button>
          {status && <p className="account-form-status" role="status">{status}</p>}
        </form>
      </dialog>
    </>
  );
}
