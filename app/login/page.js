"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

const TERMS_VERSION = "2026-06-terms";

export default function LoginPage() {
  const [mode, setMode] = useState("login");
  const [step, setStep] = useState("form");

  const [fullName, setFullName] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [termsAccepted, setTermsAccepted] = useState(false);

  const [code, setCode] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");
  const [errorMessage, setErrorMessage] = useState("");

  useEffect(() => {
    const token = localStorage.getItem("kerbSessionToken");

    if (token) {
      window.location.href = "/account";
    }
  }, []);

  function resetMessages() {
    setSuccessMessage("");
    setErrorMessage("");
  }

  function saveLogin(result) {
    localStorage.setItem("kerbSessionToken", result.session_token);
    localStorage.setItem("kerbAccountEmail", result.account.email);
    window.location.href = "/account";
  }

  async function createAccount(event) {
    event.preventDefault();

    setIsLoading(true);
    resetMessages();

    try {
      const cleanEmail = email.trim().toLowerCase();

      const response = await fetch("/api/auth/register", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          full_name: fullName.trim(),
          phone: phone.trim(),
          email: cleanEmail,
          password,
          confirm_password: confirmPassword,
          terms_accepted: termsAccepted,
          terms_version: TERMS_VERSION,
        }),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || "Could not create account.");
      }

      saveLogin(result);
    } catch (error) {
      setErrorMessage(error.message || "Something went wrong.");
    } finally {
      setIsLoading(false);
    }
  }

  async function loginWithPassword(event) {
    event.preventDefault();

    setIsLoading(true);
    resetMessages();

    try {
      const cleanEmail = email.trim().toLowerCase();

      const response = await fetch("/api/auth/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email: cleanEmail,
          password,
        }),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || "Could not sign in.");
      }

      saveLogin(result);
    } catch (error) {
      setErrorMessage(error.message || "Something went wrong.");
    } finally {
      setIsLoading(false);
    }
  }

  async function sendCode(event) {
    if (event) {
      event.preventDefault();
    }

    setIsLoading(true);
    resetMessages();

    const cleanEmail = email.trim().toLowerCase();

    if (!cleanEmail || !cleanEmail.includes("@")) {
      setErrorMessage("Enter a valid email address.");
      setIsLoading(false);
      return;
    }

    try {
      const response = await fetch("/api/auth/send-code", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email: cleanEmail,
        }),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || "Could not send login code.");
      }

      setEmail(cleanEmail);
      setStep("code");
      setSuccessMessage(`Login code sent to ${cleanEmail}.`);
    } catch (error) {
      setErrorMessage(error.message || "Something went wrong.");
    } finally {
      setIsLoading(false);
    }
  }

  async function verifyCode(event) {
    event.preventDefault();

    setIsLoading(true);
    resetMessages();

    try {
      const response = await fetch("/api/auth/verify-code", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email: email.trim().toLowerCase(),
          code: code.trim(),
        }),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || "Invalid login code.");
      }

      saveLogin(result);
    } catch (error) {
      setErrorMessage(error.message || "Something went wrong.");
    } finally {
      setIsLoading(false);
    }
  }

  function switchMode(nextMode) {
    setMode(nextMode);
    setStep("form");
    setPassword("");
    setConfirmPassword("");
    setTermsAccepted(false);
    setCode("");
    resetMessages();
  }

  return (
    <main className="loginPage">
      <section className="loginCard">
        <Link href="/" className="logo">
          Kerb
        </Link>

        <div className="pill">Kerb account</div>

        <h1>
          {mode === "register"
            ? "Create your account"
            : mode === "code"
            ? "Sign in with code"
            : "Sign in to Kerb"}
        </h1>

        <p>
          {mode === "register"
            ? "Create one Kerb account to manage your listings, saved cars and enquiries."
            : mode === "code"
            ? "Forgot your password? Enter your email and we’ll send a 6-digit login code."
            : "Use your email and password to access your Kerb account."}
        </p>

        <div className="modeTabs">
          <button
            type="button"
            className={mode === "login" ? "active" : ""}
            onClick={() => switchMode("login")}
          >
            Sign in
          </button>

          <button
            type="button"
            className={mode === "register" ? "active" : ""}
            onClick={() => switchMode("register")}
          >
            Create account
          </button>

          <button
            type="button"
            className={mode === "code" ? "active" : ""}
            onClick={() => switchMode("code")}
          >
            Email code
          </button>
        </div>

        {mode === "register" && (
          <form onSubmit={createAccount} className="loginForm">
            <label>
              Full name
              <input
                type="text"
                placeholder="Your full name"
                value={fullName}
                onChange={(event) => setFullName(event.target.value)}
                required
              />
            </label>

            <label>
              Phone number
              <input
                type="tel"
                placeholder="07..."
                value={phone}
                onChange={(event) => setPhone(event.target.value)}
                required
              />
            </label>

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

            <label>
              Password
              <input
                type="password"
                placeholder="Create a password"
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                required
              />
            </label>

            <label>
              Confirm password
              <input
                type="password"
                placeholder="Confirm your password"
                value={confirmPassword}
                onChange={(event) => setConfirmPassword(event.target.value)}
                required
              />
            </label>

            <label className="termsConsent">
              <input
                type="checkbox"
                checked={termsAccepted}
                onChange={(event) => setTermsAccepted(event.target.checked)}
                required
              />
              <span>
                I understand and agree to Kerb’s {" "}
                <Link href="/terms" target="_blank" rel="noreferrer">
                  Terms and Conditions
                </Link>
                , {" "}
                <Link href="/privacy" target="_blank" rel="noreferrer">
                  Privacy Policy
                </Link>{" "}
                and marketplace rules.
              </span>
            </label>

            {successMessage && (
              <div className="successBox">{successMessage}</div>
            )}

            {errorMessage && <div className="errorBox">{errorMessage}</div>}

            <button className="primaryButton" type="submit" disabled={isLoading}>
              {isLoading ? "Creating account..." : "Create account"}
            </button>
          </form>
        )}

        {mode === "login" && (
          <form onSubmit={loginWithPassword} className="loginForm">
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

            <label>
              Password
              <input
                type="password"
                placeholder="Your password"
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                required
              />
            </label>

            {successMessage && (
              <div className="successBox">{successMessage}</div>
            )}

            {errorMessage && <div className="errorBox">{errorMessage}</div>}

            <button className="primaryButton" type="submit" disabled={isLoading}>
              {isLoading ? "Signing in..." : "Sign in"}
            </button>

            <button
              className="textButton"
              type="button"
              onClick={() => switchMode("code")}
            >
              Forgot password? Use email code
            </button>
          </form>
        )}

        {mode === "code" && step === "form" && (
          <form onSubmit={sendCode} className="loginForm">
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

            {successMessage && (
              <div className="successBox">{successMessage}</div>
            )}

            {errorMessage && <div className="errorBox">{errorMessage}</div>}

            <button className="primaryButton" type="submit" disabled={isLoading}>
              {isLoading ? "Sending code..." : "Send login code"}
            </button>
          </form>
        )}

        {mode === "code" && step === "code" && (
          <form onSubmit={verifyCode} className="loginForm">
            <label>
              Enter 6-digit code
              <input
                inputMode="numeric"
                maxLength={6}
                placeholder="123456"
                value={code}
                onChange={(event) => setCode(event.target.value)}
                required
              />
            </label>

            <div className="emailRow">
              Code sent to <strong>{email}</strong>
              <button
                type="button"
                onClick={() => {
                  setStep("form");
                  setCode("");
                  resetMessages();
                }}
              >
                Change email
              </button>
            </div>

            {successMessage && (
              <div className="successBox">{successMessage}</div>
            )}

            {errorMessage && <div className="errorBox">{errorMessage}</div>}

            <button className="primaryButton" type="submit" disabled={isLoading}>
              {isLoading ? "Checking code..." : "Sign in with code"}
            </button>

            <button
              className="secondaryButton"
              type="button"
              disabled={isLoading}
              onClick={sendCode}
            >
              Resend code
            </button>
          </form>
        )}

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
    width: min(660px, 100%);
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
    margin: 0 0 24px;
  }

  .modeTabs {
    display: grid;
    grid-template-columns: repeat(3, 1fr);
    gap: 10px;
    background: #f4f7fc;
    border: 1px solid #e5eaf4;
    border-radius: 18px;
    padding: 8px;
    margin-bottom: 22px;
  }

  .modeTabs button {
    border: none;
    border-radius: 13px;
    background: transparent;
    color: #5d687d;
    font-weight: 950;
    padding: 13px 10px;
    cursor: pointer;
  }

  .modeTabs button.active {
    background: #0048ff;
    color: white;
    box-shadow: 0 8px 20px rgba(0, 72, 255, 0.18);
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

  .primaryButton,
  .secondaryButton {
    height: 54px;
    border: none;
    border-radius: 15px;
    font-size: 15px;
    font-weight: 950;
    cursor: pointer;
  }

  .primaryButton {
    background: #0048ff;
    color: white;
    box-shadow: 0 10px 25px rgba(0, 72, 255, 0.22);
  }

  .secondaryButton {
    background: #eef3ff;
    color: #0048ff;
  }

  .primaryButton:disabled,
  .secondaryButton:disabled {
    opacity: 0.65;
    cursor: not-allowed;
  }

  .termsConsent {
    display: flex;
    align-items: flex-start;
    gap: 12px;
    background: #f7f9fd;
    border: 1px solid #e5eaf4;
    border-radius: 16px;
    padding: 15px 16px;
    color: #59657a;
    font-size: 13px;
    font-weight: 800;
    line-height: 1.5;
  }

  .termsConsent input {
    width: 18px;
    height: 18px;
    min-width: 18px;
    margin: 2px 0 0;
    padding: 0;
    accent-color: #0048ff;
    box-shadow: none;
  }

  .termsConsent a {
    color: #0048ff;
    font-weight: 950;
    text-decoration: none;
  }

  .termsConsent a:hover {
    text-decoration: underline;
  }

  .textButton {
    border: none;
    background: transparent;
    color: #0048ff;
    font-weight: 950;
    cursor: pointer;
    width: fit-content;
    padding: 4px 0;
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

  .emailRow {
    background: #f7f9fd;
    border: 1px solid #e5eaf4;
    border-radius: 14px;
    padding: 14px 16px;
    color: #59657a;
    font-size: 14px;
    line-height: 1.5;
  }

  .emailRow strong {
    color: #071126;
  }

  .emailRow button {
    display: inline-flex;
    margin-left: 8px;
    border: none;
    background: transparent;
    color: #0048ff;
    font-weight: 900;
    cursor: pointer;
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

    .modeTabs {
      grid-template-columns: 1fr;
    }
  }
`;
