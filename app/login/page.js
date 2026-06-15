"use client";

import { useState } from "react";
import Link from "next/link";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [code, setCode] = useState("");
  const [step, setStep] = useState("email");
  const [isLoading, setIsLoading] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");
  const [errorMessage, setErrorMessage] = useState("");

  async function sendCode(event) {
    event.preventDefault();

    setIsLoading(true);
    setSuccessMessage("");
    setErrorMessage("");

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
    setSuccessMessage("");
    setErrorMessage("");

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

      localStorage.setItem("kerbSessionToken", result.session_token);
      localStorage.setItem("kerbAccountEmail", result.account.email);

      window.location.href = "/account";
    } catch (error) {
      setErrorMessage(error.message || "Something went wrong.");
    } finally {
      setIsLoading(false);
    }
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
          Enter your email and we’ll send you a 6-digit login code. If you do
          not have an account yet, we’ll create one automatically.
        </p>

        {step === "email" ? (
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
        ) : (
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
                  setStep("email");
                  setCode("");
                  setSuccessMessage("");
                  setErrorMessage("");
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
              {isLoading ? "Checking code..." : "Sign in"}
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
    margin: 0 0 26px;
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
  }
`;
