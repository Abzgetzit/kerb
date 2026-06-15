"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || "";
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "";

const supabase =
  supabaseUrl && supabaseAnonKey
    ? createClient(supabaseUrl, supabaseAnonKey)
    : null;

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [redirectPath, setRedirectPath] = useState("/account/enquiries");
  const [message, setMessage] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const [isSending, setIsSending] = useState(false);
  const [session, setSession] = useState(null);
  const [isCheckingSession, setIsCheckingSession] = useState(true);

  useEffect(() => {
    async function checkSession() {
      if (!supabase) {
        setErrorMessage("Supabase environment variables are missing.");
        setIsCheckingSession(false);
        return;
      }

      const { data } = await supabase.auth.getSession();
      setSession(data.session || null);
      setIsCheckingSession(false);
    }

    checkSession();

    if (!supabase) return;

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, currentSession) => {
      setSession(currentSession || null);
    });

    return () => subscription.unsubscribe();
  }, []);

  async function handleLogin(event) {
    event.preventDefault();

    setIsSending(true);
    setMessage("");
    setErrorMessage("");

    if (!supabase) {
      setErrorMessage("Supabase environment variables are missing.");
      setIsSending(false);
      return;
    }

    const cleanEmail = email.trim().toLowerCase();

    if (!cleanEmail || !cleanEmail.includes("@")) {
      setErrorMessage("Enter a valid email address.");
      setIsSending(false);
      return;
    }

    const redirectTo = `${window.location.origin}${redirectPath}`;

    const { error } = await supabase.auth.signInWithOtp({
      email: cleanEmail,
      options: {
        emailRedirectTo: redirectTo,
      },
    });

    if (error) {
      setErrorMessage(error.message);
    } else {
      setMessage(
        `Login link sent to ${cleanEmail}. Open your email and click the link.`
      );
    }

    setIsSending(false);
  }

  async function handleLogout() {
    if (!supabase) return;

    await supabase.auth.signOut();
    setSession(null);
  }

  if (isCheckingSession) {
    return (
      <main className="loginPage">
        <section className="loginCard">
          <Link href="/" className="logo">
            Kerb
          </Link>
          <p>Checking login...</p>
        </section>

        <style jsx global>{styles}</style>
      </main>
    );
  }

  if (session) {
    return (
      <main className="loginPage">
        <section className="loginCard">
          <Link href="/" className="logo">
            Kerb
          </Link>

          <div className="pill">Signed in</div>

          <h1>You’re logged in</h1>

          <p>
            You are signed in as <strong>{session.user.email}</strong>.
          </p>

          <div className="signedInActions">
            <Link href="/account/enquiries">Buyer enquiries</Link>
            <Link href="/seller/enquiries">Seller enquiries</Link>
            <button type="button" onClick={handleLogout}>
              Log out
            </button>
          </div>
        </section>

        <style jsx global>{styles}</style>
      </main>
    );
  }

  return (
    <main className="loginPage">
      <section className="loginCard">
        <Link href="/" className="logo">
          Kerb
        </Link>

        <div className="pill">Kerb account</div>

        <h1>Sign in to Kerb</h1>

        <p>
          Enter your email and we’ll send you a secure magic link. No password
          needed.
        </p>

        <div className="accountChoice">
          <button
            type="button"
            className={redirectPath === "/account/enquiries" ? "active" : ""}
            onClick={() => setRedirectPath("/account/enquiries")}
          >
            Buyer account
            <span>View enquiries you have sent</span>
          </button>

          <button
            type="button"
            className={redirectPath === "/seller/enquiries" ? "active" : ""}
            onClick={() => setRedirectPath("/seller/enquiries")}
          >
            Seller account
            <span>View enquiries on your listings</span>
          </button>
        </div>

        <form onSubmit={handleLogin} className="loginForm">
          <label>
            Email address
            <input
              type="email"
              placeholder="you@example.com"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              required
            />
          </label>

          {message && <div className="successBox">{message}</div>}
          {errorMessage && <div className="errorBox">{errorMessage}</div>}

          <button className="primaryButton" type="submit" disabled={isSending}>
            {isSending ? "Sending login link..." : "Send login link"}
          </button>
        </form>

        <Link href="/" className="backLink">
          Back to Kerb
        </Link>
      </section>

      <style jsx global>{styles}</style>
    </main>
  );
}

const styles = `
  * {
    box-sizing: border-box;
  }

  body {
    margin: 0;
    background: #f7f9fd;
    color: #071126;
    font-family: Inter, Arial, sans-serif;
  }

  .loginPage {
    min-height: 100vh;
    display: grid;
    place-items: center;
    padding: 24px;
    background:
      radial-gradient(circle at top left, rgba(0,72,255,0.12), transparent 30%),
      #f7f9fd;
  }

  .loginCard {
    width: min(620px, 100%);
    background: white;
    border: 1px solid #e5eaf4;
    border-radius: 30px;
    padding: 42px;
    box-shadow: 0 18px 60px rgba(20, 35, 70, 0.1);
  }

  .logo {
    display: inline-flex;
    color: #0048ff;
    font-size: 44px;
    font-weight: 950;
    letter-spacing: -2px;
    text-decoration: none;
    margin-bottom: 24px;
  }

  .pill {
    display: inline-flex;
    background: #eaf1ff;
    color: #0048ff;
    border: 1px solid #d7e4ff;
    border-radius: 999px;
    padding: 9px 14px;
    font-size: 13px;
    font-weight: 900;
    margin-bottom: 18px;
  }

  h1 {
    margin: 0 0 14px;
    font-size: 46px;
    line-height: 0.98;
    letter-spacing: -2px;
  }

  p {
    color: #59657a;
    line-height: 1.6;
    margin: 0;
  }

  p strong {
    color: #071126;
  }

  .accountChoice {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 12px;
    margin: 28px 0 22px;
  }

  .accountChoice button {
    border: 1px solid #e1e8f3;
    background: #fbfcff;
    border-radius: 18px;
    padding: 18px;
    text-align: left;
    font-size: 15px;
    font-weight: 950;
    color: #071126;
    cursor: pointer;
  }

  .accountChoice button span {
    display: block;
    color: #647189;
    font-size: 13px;
    font-weight: 700;
    margin-top: 7px;
    line-height: 1.4;
  }

  .accountChoice button.active {
    border-color: #0048ff;
    background: #eef3ff;
    color: #0048ff;
  }

  .loginForm {
    display: grid;
    gap: 16px;
  }

  label {
    display: grid;
    gap: 8px;
    font-weight: 900;
    font-size: 14px;
  }

  input {
    border: 1px solid #dfe6f1;
    border-radius: 14px;
    padding: 15px 16px;
    font-size: 15px;
    outline: none;
    background: #fbfcff;
  }

  input:focus {
    border-color: #0048ff;
    box-shadow: 0 0 0 4px rgba(0, 72, 255, 0.08);
  }

  .primaryButton {
    height: 54px;
    border: none;
    border-radius: 15px;
    background: #0048ff;
    color: white;
    font-size: 15px;
    font-weight: 950;
    cursor: pointer;
    box-shadow: 0 10px 25px rgba(0, 72, 255, 0.22);
  }

  .primaryButton:disabled {
    opacity: 0.65;
    cursor: not-allowed;
  }

  .successBox {
    background: #eafaf0;
    color: #137333;
    border: 1px solid #bce8ca;
    border-radius: 14px;
    padding: 14px 16px;
    font-weight: 850;
  }

  .errorBox {
    background: #fff1f1;
    color: #b42318;
    border: 1px solid #ffd1d1;
    border-radius: 14px;
    padding: 14px 16px;
    font-weight: 850;
  }

  .signedInActions {
    display: flex;
    flex-wrap: wrap;
    gap: 12px;
    margin-top: 28px;
  }

  .signedInActions a,
  .signedInActions button {
    border: none;
    border-radius: 14px;
    padding: 14px 18px;
    font-weight: 950;
    text-decoration: none;
    cursor: pointer;
  }

  .signedInActions a {
    background: #0048ff;
    color: white;
  }

  .signedInActions button {
    background: #eef3ff;
    color: #0048ff;
  }

  .backLink {
    display: inline-flex;
    margin-top: 24px;
    color: #0048ff;
    font-weight: 900;
    text-decoration: none;
  }

  @media (max-width: 650px) {
    .loginCard {
      padding: 28px;
    }

    h1 {
      font-size: 36px;
    }

    .accountChoice {
      grid-template-columns: 1fr;
    }
  }
`;
