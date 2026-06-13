"use client";

import { useState } from "react";

export default function PostCarPage() {
  const [submitted, setSubmitted] = useState(false);

  if (submitted) {
    return (
      <main className="page">
        <div className="successBox">
          <a href="/" className="logo">Kerb</a>
          <div className="successIcon">✅</div>
          <h1>Listing request received</h1>
          <p>
            Thanks. Your car details have been received. Once Kerb is fully live,
            this will become a proper seller listing flow with photos, pricing
            and account management.
          </p>
          <a href="/" className="primaryBtn">Back to homepage</a>
        </div>

        <style>{styles}</style>
      </main>
    );
  }

  return (
    <main className="page">
      <header className="navbar">
        <a href="/" className="logo">Kerb</a>
        <a href="/" className="backLink">← Back home</a>
      </header>

      <section className="hero">
        <div>
          <div className="pill">Seller early access</div>
          <h1>Post your car on Kerb</h1>
          <p>
            Add your car details and join the first sellers on Kerb. This is the
            starting version of the seller page — later we’ll connect it to a
            database and image upload.
          </p>
        </div>

        <div className="heroCard">
          <h3>What happens next?</h3>
          <ul>
            <li>Submit your car details</li>
            <li>Kerb stores seller interest</li>
            <li>Listings go live once the marketplace launches</li>
          </ul>
        </div>
      </section>

      <section className="formSection">
        <form
          className="formCard"
          onSubmit={(e) => {
            e.preventDefault();
            setSubmitted(true);
          }}
        >
          <h2>Car details</h2>

          <div className="grid">
            <label>
              Make
              <input placeholder="BMW, Audi, Mercedes..." required />
            </label>

            <label>
              Model
              <input placeholder="3 Series, A4, Golf..." required />
            </label>

            <label>
              Year
              <input placeholder="2020" required />
            </label>

            <label>
              Mileage
              <input placeholder="45,000 miles" required />
            </label>

            <label>
              Fuel type
              <select required>
                <option value="">Select fuel type</option>
                <option>Petrol</option>
                <option>Diesel</option>
                <option>Hybrid</option>
                <option>Electric</option>
              </select>
            </label>

            <label>
              Gearbox
              <select required>
                <option value="">Select gearbox</option>
                <option>Manual</option>
                <option>Automatic</option>
              </select>
            </label>

            <label>
              Asking price
              <input placeholder="£12,995" required />
            </label>

            <label>
              Location
              <input placeholder="Leicester" required />
            </label>
          </div>

          <label>
            Short description
            <textarea placeholder="Tell buyers about condition, service history, features, MOT, etc." />
          </label>

          <h2>Seller details</h2>

          <div className="grid">
            <label>
              Full name
              <input placeholder="Your name" required />
            </label>

            <label>
              Email address
              <input type="email" placeholder="you@example.com" required />
            </label>

            <label>
              Phone number
              <input placeholder="07..." required />
            </label>

            <label>
              Seller type
              <select required>
                <option value="">Select seller type</option>
                <option>Private seller</option>
                <option>Dealer</option>
              </select>
            </label>
          </div>

          <button className="primaryBtn" type="submit">
            Submit listing request
          </button>
        </form>
      </section>

      <style>{styles}</style>
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

  .page {
    min-height: 100vh;
    padding: 24px 36px 50px;
  }

  .navbar {
    height: 58px;
    display: flex;
    align-items: center;
    justify-content: space-between;
    margin-bottom: 22px;
  }

  .logo {
    font-size: 36px;
    font-weight: 900;
    color: #0048ff;
    letter-spacing: -1.8px;
    text-decoration: none;
  }

  .backLink {
    color: #172033;
    text-decoration: none;
    font-weight: 800;
  }

  .hero {
    display: grid;
    grid-template-columns: 1.3fr 0.7fr;
    gap: 24px;
    align-items: stretch;
    background:
      linear-gradient(90deg, rgba(246,249,255,0.98), rgba(235,242,255,0.92)),
      radial-gradient(circle at 80% 40%, rgba(0,72,255,0.15), transparent 35%);
    border: 1px solid #e4eaf5;
    border-radius: 30px;
    padding: 42px;
    box-shadow: 0 16px 50px rgba(20, 35, 70, 0.08);
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
    font-size: 56px;
    line-height: 0.98;
    margin: 0 0 18px;
    letter-spacing: -2.6px;
  }

  p {
    color: #59657a;
    font-size: 16px;
    line-height: 1.6;
    margin: 0;
  }

  .heroCard {
    background: white;
    border: 1px solid #e5eaf4;
    border-radius: 22px;
    padding: 24px;
  }

  .heroCard h3 {
    margin: 0 0 14px;
    font-size: 22px;
    letter-spacing: -0.5px;
  }

  .heroCard ul {
    margin: 0;
    padding-left: 20px;
    color: #4d596f;
    line-height: 1.9;
    font-weight: 700;
  }

  .formSection {
    margin-top: 24px;
  }

  .formCard {
    background: white;
    border: 1px solid #e5eaf4;
    border-radius: 26px;
    padding: 32px;
    box-shadow: 0 12px 30px rgba(10, 20, 40, 0.05);
  }

  .formCard h2 {
    margin: 0 0 18px;
    font-size: 24px;
    letter-spacing: -0.7px;
  }

  .grid {
    display: grid;
    grid-template-columns: repeat(2, 1fr);
    gap: 18px;
    margin-bottom: 24px;
  }

  label {
    display: grid;
    gap: 8px;
    font-weight: 800;
    font-size: 14px;
    color: #172033;
  }

  input,
  select,
  textarea {
    width: 100%;
    border: 1px solid #dfe6f1;
    border-radius: 14px;
    padding: 15px 16px;
    font-size: 15px;
    outline: none;
    background: #fbfcff;
    font-family: inherit;
  }

  textarea {
    min-height: 130px;
    resize: vertical;
    margin-bottom: 24px;
  }

  input:focus,
  select:focus,
  textarea:focus {
    border-color: #0048ff;
    box-shadow: 0 0 0 4px rgba(0, 72, 255, 0.08);
  }

  .primaryBtn {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    background: #0048ff;
    color: white;
    border: none;
    border-radius: 14px;
    padding: 15px 26px;
    font-weight: 900;
    font-size: 15px;
    text-decoration: none;
    cursor: pointer;
    box-shadow: 0 10px 25px rgba(0, 72, 255, 0.22);
  }

  .successBox {
    max-width: 620px;
    margin: 120px auto 0;
    text-align: center;
    background: white;
    border: 1px solid #e5eaf4;
    border-radius: 28px;
    padding: 44px;
    box-shadow: 0 16px 50px rgba(20, 35, 70, 0.08);
  }

  .successIcon {
    width: 76px;
    height: 76px;
    margin: 28px auto 18px;
    border-radius: 24px;
    background: #edf3ff;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 34px;
  }

  .successBox h1 {
    font-size: 42px;
  }

  .successBox p {
    margin-bottom: 24px;
  }

  @media (max-width: 800px) {
    .page {
      padding: 18px;
    }

    .hero {
      grid-template-columns: 1fr;
      padding: 28px;
    }

    h1 {
      font-size: 42px;
    }

    .grid {
      grid-template-columns: 1fr;
    }

    .formCard {
      padding: 24px;
    }
  }
`;
