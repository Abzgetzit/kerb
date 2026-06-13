"use client";

import { useState } from "react";

export default function LoginPage() {
  const [mode, setMode] = useState("login");

  function handleSubmit(e) {
    e.preventDefault();

    const form = new FormData(e.currentTarget);
    const name = form.get("name") || "Kerb User";
    const email = form.get("email");

    localStorage.setItem(
      "kerbUser",
      JSON.stringify({
        name,
        email,
        loggedIn: true,
      })
    );

    window.location.href = "/post-car";
  }

  return (
    <main className="page">
      <a href="/" className="logo">Kerb</a>

      <section className="authCard">
        <div className="pill">Seller account required</div>

        <h1>{mode === "login" ? "Sign in to sell your car" : "Create your Kerb account"}</h1>

        <p>
          You need an account before posting a car so buyers can contact you and
          you can manage your listing.
        </p>

        <div className="tabs">
          <button
            className={mode === "login" ? "active" : ""}
            onClick={() => setMode("login")}
            type="button"
          >
            Sign in
          </button>

          <button
            className={mode === "signup" ? "active" : ""}
            onClick={() => setMode("signup")}
            type="button"
          >
            Sign up
          </button>
        </div>

        <form onSubmit={handleSubmit}>
          {mode === "signup" && (
            <label>
              Full name
              <input name="name" placeholder="Your name" required />
            </label>
          )}

          <label>
            Email address
            <input name="email" type="email" placeholder="you@example.com" required />
          </label>

          <label>
            Password
            <input name="password" type="password" placeholder="Enter password" required />
          </label>

          <button className="primaryBtn" type="submit">
            {mode === "login" ? "Sign in" : "Create account"}
          </button>
        </form>

        <small>
          Prototype login only. Later this will be connected to proper secure authentication.
        </small>
      </section>

      <style>{`
        * {
          box-sizing: border-box;
        }

        body {
          margin: 0;
          background: #f7f9fd;
          color: #071126;
          font-family: Inter, Arial, sans-serif;
        }

        .page {
          min-height: 100vh;
          padding: 28px;
          display: grid;
          place-items: center;
        }

        .logo {
          position: fixed;
          top: 24px;
          left: 36px;
          font-size: 36px;
          font-weight: 900;
          color: #0048ff;
          letter-spacing: -1.8px;
          text-decoration: none;
        }

        .authCard {
          width: 100%;
          max-width: 520px;
          background: white;
          border: 1px solid #e5eaf4;
          border-radius: 28px;
          padding: 36px;
          box-shadow: 0 18px 60px rgba(10, 20, 40, 0.08);
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
          margin: 0 0 12px;
          font-size: 40px;
          line-height: 1;
          letter-spacing: -1.8px;
        }

        p {
          margin: 0 0 22px;
          color: #5d687c;
          line-height: 1.6;
        }

        .tabs {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 10px;
          background: #f2f5fb;
          padding: 8px;
          border-radius: 16px;
          margin-bottom: 22px;
        }

        .tabs button {
          border: none;
          border-radius: 12px;
          padding: 12px;
          background: transparent;
          font-weight: 900;
          color: #657189;
          cursor: pointer;
        }

        .tabs button.active {
          background: white;
          color: #0048ff;
          box-shadow: 0 6px 18px rgba(10, 20, 40, 0.08);
        }

        form {
          display: grid;
          gap: 16px;
        }

        label {
          display: grid;
          gap: 8px;
          font-size: 14px;
          font-weight: 900;
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

        .primaryBtn {
          margin-top: 6px;
          border: none;
          background: #0048ff;
          color: white;
          border-radius: 14px;
          padding: 15px 24px;
          font-weight: 900;
          font-size: 15px;
          cursor: pointer;
          box-shadow: 0 10px 25px rgba(0, 72, 255, 0.22);
        }

        small {
          display: block;
          color: #7b8496;
          margin-top: 18px;
          line-height: 1.5;
        }

        @media (max-width: 700px) {
          .page {
            padding: 18px;
          }

          .logo {
            position: static;
            margin-bottom: 24px;
            justify-self: start;
          }

          .authCard {
            padding: 26px;
          }

          h1 {
            font-size: 34px;
          }
        }
      `}</style>
    </main>
  );
}
