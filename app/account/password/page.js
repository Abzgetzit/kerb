"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import SiteMenu from "../../components/SiteMenu";

export default function AccountPasswordPage() {
  const [currentUser, setCurrentUser] = useState(null);
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [isSaving, setIsSaving] = useState(false);
  const [message, setMessage] = useState("");
  const [errorMessage, setErrorMessage] = useState("");

  useEffect(() => {
    const token = localStorage.getItem("kerbSessionToken");
    const savedUser = localStorage.getItem("kerbUser");
    const savedEmail = localStorage.getItem("kerbAccountEmail");

    if (!token) {
      window.location.href = "/login?next=/account/password";
      return;
    }

    if (savedUser) {
      try {
        setCurrentUser(JSON.parse(savedUser));
        return;
      } catch {
        localStorage.removeItem("kerbUser");
      }
    }

    if (savedEmail) {
      setCurrentUser({ email: savedEmail });
    }
  }, []);

  async function updatePassword(event) {
    event.preventDefault();

    const token = localStorage.getItem("kerbSessionToken");

    if (!token) {
      window.location.href = "/login?next=/account/password";
      return;
    }

    setIsSaving(true);
    setMessage("");
    setErrorMessage("");

    try {
      const response = await fetch("/api/account/password", {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          "x-kerb-session-token": token,
        },
        body: JSON.stringify({
          current_password: currentPassword,
          new_password: newPassword,
          confirm_password: confirmPassword,
        }),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || "Could not update password.");
      }

      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
      setMessage("Password updated.");
    } catch (error) {
      setErrorMessage(error.message || "Something went wrong.");
    } finally {
      setIsSaving(false);
    }
  }

  return (
    <main className="page">
      <header className="navbar">
        <Link href="/" className="logo">Kerb</Link>
        <nav>
          <Link href="/account">My account</Link>
          <Link href="/account?tab=settings">Settings</Link>
          <Link href="/saved">Saved cars</Link>
        </nav>
        <SiteMenu currentUser={currentUser} />
      </header>

      <section className="hero">
        <span>Account settings</span>
        <h1>Change password</h1>
        <p>
          Update the password for your Kerb account. If you have forgotten it,
          sign out and use “Reset by email code” on the login page.
        </p>
      </section>

      <section className="card">
        <form onSubmit={updatePassword}>
          <label>
            Current password
            <input
              type="password"
              value={currentPassword}
              onChange={(event) => setCurrentPassword(event.target.value)}
              placeholder="Your current password"
            />
          </label>

          <label>
            New password
            <input
              type="password"
              value={newPassword}
              onChange={(event) => setNewPassword(event.target.value)}
              placeholder="At least 8 characters"
              required
            />
          </label>

          <label>
            Confirm new password
            <input
              type="password"
              value={confirmPassword}
              onChange={(event) => setConfirmPassword(event.target.value)}
              placeholder="Confirm new password"
              required
            />
          </label>

          {message && <div className="successBox">{message}</div>}
          {errorMessage && <div className="errorBox">{errorMessage}</div>}

          <button type="submit" disabled={isSaving}>
            {isSaving ? "Updating password..." : "Update password"}
          </button>
        </form>
      </section>

      <style jsx>{styles}</style>
    </main>
  );
}

const styles = `
  * { box-sizing: border-box; }
  .page { min-height: 100vh; padding: 22px 40px 50px; background: radial-gradient(circle at top left, rgba(0,72,255,.08), transparent 32%), #f7f9fd; color: #071126; font-family: Inter, Arial, sans-serif; }
  .navbar { display: flex; align-items: center; justify-content: space-between; gap: 18px; margin-bottom: 24px; }
  .logo { color: #0048ff; font-size: 38px; font-weight: 950; letter-spacing: -2px; text-decoration: none; }
  nav { display: flex; gap: 18px; font-weight: 900; }
  nav a { color: #071126; text-decoration: none; }
  .hero, .card { border: 1px solid #dfe8f7; border-radius: 32px; background: linear-gradient(135deg, #fff, #eef5ff); padding: clamp(26px, 4vw, 42px); box-shadow: 0 22px 56px rgba(14,30,70,.08); }
  .hero span { display: inline-flex; background: #eaf1ff; color: #0048ff; border-radius: 999px; padding: 10px 16px; font-weight: 950; margin-bottom: 18px; }
  h1 { margin: 0 0 12px; font-size: clamp(44px, 7vw, 76px); line-height: .92; letter-spacing: -3px; }
  .hero p { color: #53617a; font-weight: 750; line-height: 1.65; max-width: 760px; }
  .card { margin-top: 24px; background: white; max-width: 720px; }
  form { display: grid; gap: 16px; }
  label { display: grid; gap: 8px; font-weight: 900; }
  input { width: 100%; border: 1px solid #dce5f3; border-radius: 14px; padding: 15px 16px; font: inherit; background: #fbfdff; }
  input:focus { outline: none; border-color: #0048ff; box-shadow: 0 0 0 4px rgba(0,72,255,.08); }
  button { min-height: 54px; width: fit-content; border: none; border-radius: 16px; background: #0048ff; color: white; padding: 0 22px; font-weight: 950; cursor: pointer; box-shadow: 0 14px 30px rgba(0,72,255,.2); }
  button:disabled { opacity: .65; cursor: not-allowed; }
  .successBox, .errorBox { border-radius: 14px; padding: 14px 16px; font-weight: 850; }
  .successBox { background: #eafaf0; color: #137333; border: 1px solid #bce8ca; }
  .errorBox { background: #fff1f1; color: #b42318; border: 1px solid #ffd1d1; }
  @media (max-width: 760px) { .page { padding: 16px; } nav { display: none; } h1 { letter-spacing: -2px; } button { width: 100%; } }
`;
