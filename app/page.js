export default function HomePage() {
  const categories = [
    ["🚘", "Used cars", "Browse trusted second-hand cars"],
    ["✨", "New cars", "Explore new models and deals"],
    ["⚡", "Electric cars", "Find electric and hybrid cars"],
    ["🚙", "Family SUVs", "Practical cars for everyday life"],
    ["🏁", "Performance", "Powerful cars built for driving"],
  ];

  return (
    <main className="page">
      <header className="navbar">
        <div className="logo">Kerb</div>

        <nav className="navLinks">
          <a>🚗 Browse cars</a>
          <a>✨ New cars</a>
          <a>🔁 Sell your car</a>
          <a>⚡ Electric</a>
          <a>💷 Finance</a>
          <a>📘 Guides</a>
        </nav>

        <div className="navActions">
          <button className="ghostBtn">♡ Saved</button>
          <button className="ghostBtn">Sign in</button>
          <button className="primaryBtn">＋ Post your car</button>
        </div>
      </header>

      <section className="hero">
        <div className="heroText">
          <div className="pill">New car marketplace launching soon</div>

          <h1>Find your next car with confidence</h1>

          <p>
            Kerb helps buyers discover trusted cars from private sellers and
            dealers, with simple filters, clear pricing and a smooth buying
            experience.
          </p>

          <div className="heroStats">
            <span>✅ Private sellers</span>
            <span>✅ Dealers</span>
            <span>✅ Simple car search</span>
          </div>
        </div>

        <div className="heroVisual">
          <div className="carMockup">
            <div className="carTop"></div>
            <div className="carBody">
              <div className="window"></div>
              <div className="window small"></div>
            </div>
            <div className="wheel left"></div>
            <div className="wheel right"></div>
          </div>
        </div>

        <div className="searchBox">
          <div className="filterItem">
            <span>📍</span>
            <div>
              <small>Location</small>
              <strong>Leicester</strong>
            </div>
          </div>

          <div className="filterItem">
            <span>🚗</span>
            <div>
              <small>Make & model</small>
              <strong>Any make</strong>
            </div>
          </div>

          <div className="filterItem">
            <span>💷</span>
            <div>
              <small>Price</small>
              <strong>Any price</strong>
            </div>
          </div>

          <div className="filterItem">
            <span>⏱️</span>
            <div>
              <small>Mileage</small>
              <strong>Any miles</strong>
            </div>
          </div>

          <div className="filterItem">
            <span>🚙</span>
            <div>
              <small>Body type</small>
              <strong>Any</strong>
            </div>
          </div>

          <button className="searchBtn">Search cars</button>
        </div>
      </section>

      <section className="categories">
        {categories.map((item, index) => (
          <div className="categoryCard" key={index}>
            <div className="categoryIcon">{item[0]}</div>
            <div>
              <h3>{item[1]}</h3>
              <p>{item[2]}</p>
            </div>
            <span>›</span>
          </div>
        ))}
      </section>

      <section className="launchGrid">
        <div className="emptyListings">
          <div className="emptyIcon">🚗</div>
          <h2>Car listings are coming soon</h2>
          <p>
            Kerb is getting ready to launch. Once sellers start posting cars,
            listings will appear here with images, prices, mileage, location and
            seller details.
          </p>

          <div className="emptyActions">
            <button className="primaryBtn">Post your car</button>
            <button className="secondaryBtn">Join launch list</button>
          </div>
        </div>

        <div className="sellerBox">
          <h2>Sell your car the smart way</h2>
          <p>
            Create a clean listing, reach serious buyers and manage enquiries
            from one simple dashboard.
          </p>

          <div className="sellerSteps">
            <div>
              <strong>1</strong>
              <span>Add your car details</span>
            </div>
            <div>
              <strong>2</strong>
              <span>Upload photos</span>
            </div>
            <div>
              <strong>3</strong>
              <span>Receive buyer enquiries</span>
            </div>
          </div>

          <button className="primaryBtn fullBtn">Start selling</button>
        </div>
      </section>

      <section className="trustGrid">
        <div className="trustCard">
          <span>🛡️</span>
          <div>
            <h3>Trusted sellers</h3>
            <p>Built for verified private sellers and approved dealers.</p>
          </div>
        </div>

        <div className="trustCard">
          <span>💷</span>
          <div>
            <h3>Clear pricing</h3>
            <p>Simple prices with clean vehicle information.</p>
          </div>
        </div>

        <div className="trustCard">
          <span>♡</span>
          <div>
            <h3>Save favourites</h3>
            <p>Buyers can save cars and compare their options.</p>
          </div>
        </div>

        <div className="trustCard">
          <span>📩</span>
          <div>
            <h3>Easy enquiries</h3>
            <p>Simple contact flow between buyers and sellers.</p>
          </div>
        </div>
      </section>

      <section className="newsletter">
        <div>
          <h3>Get early access to Kerb</h3>
          <p>Be notified when the first cars go live.</p>
        </div>

        <div className="emailBox">
          <input placeholder="Enter your email address" />
          <button>Notify me</button>
        </div>
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
          padding: 22px 36px 40px;
        }

        .navbar {
          height: 58px;
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 24px;
          margin-bottom: 18px;
        }

        .logo {
          font-size: 36px;
          font-weight: 900;
          color: #0048ff;
          letter-spacing: -1.8px;
        }

        .navLinks {
          display: flex;
          align-items: center;
          gap: 28px;
          font-size: 14px;
          font-weight: 700;
          color: #12172c;
        }

        .navLinks a {
          text-decoration: none;
          cursor: pointer;
        }

        .navActions {
          display: flex;
          align-items: center;
          gap: 14px;
        }

        button {
          border: none;
          cursor: pointer;
          font-family: inherit;
        }

        .ghostBtn {
          background: transparent;
          color: #11182e;
          font-size: 14px;
          font-weight: 600;
        }

        .primaryBtn {
          background: #0048ff;
          color: white;
          border-radius: 14px;
          padding: 14px 24px;
          font-weight: 800;
          box-shadow: 0 10px 25px rgba(0, 72, 255, 0.22);
        }

        .secondaryBtn {
          background: #eef3ff;
          color: #0048ff;
          border-radius: 14px;
          padding: 14px 24px;
          font-weight: 800;
        }

        .hero {
          position: relative;
          min-height: 390px;
          border-radius: 30px;
          overflow: hidden;
          background:
            linear-gradient(90deg, rgba(246,249,255,0.98) 0%, rgba(246,249,255,0.92) 45%, rgba(231,239,252,0.8) 100%),
            radial-gradient(circle at 78% 42%, rgba(0,72,255,0.16), transparent 36%);
          border: 1px solid #e5eaf5;
          padding: 44px 52px 100px;
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

        .heroText {
          max-width: 530px;
          position: relative;
          z-index: 2;
        }

        .heroText h1 {
          font-size: 56px;
          line-height: 0.98;
          margin: 0 0 18px;
          letter-spacing: -2.6px;
        }

        .heroText p {
          color: #465269;
          font-size: 17px;
          line-height: 1.5;
          margin: 0 0 22px;
        }

        .heroStats {
          display: flex;
          gap: 16px;
          flex-wrap: wrap;
          color: #203050;
          font-size: 14px;
          font-weight: 800;
        }

        .heroVisual {
          position: absolute;
          right: 80px;
          top: 80px;
          width: 440px;
          height: 210px;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .carMockup {
          position: relative;
          width: 390px;
          height: 160px;
          filter: drop-shadow(0 30px 25px rgba(10, 20, 40, 0.18));
        }

        .carBody {
          position: absolute;
          left: 20px;
          right: 20px;
          bottom: 38px;
          height: 76px;
          background: linear-gradient(135deg, #ffffff, #dce8ff);
          border: 2px solid #c6d6f7;
          border-radius: 80px 110px 34px 34px;
        }

        .carTop {
          position: absolute;
          left: 112px;
          top: 22px;
          width: 150px;
          height: 74px;
          background: linear-gradient(135deg, #ffffff, #dbe8ff);
          border: 2px solid #c6d6f7;
          border-radius: 80px 80px 12px 12px;
        }

        .window {
          position: absolute;
          left: 114px;
          top: 14px;
          width: 66px;
          height: 32px;
          background: #b9cdf3;
          border-radius: 30px 8px 8px 8px;
        }

        .window.small {
          left: 190px;
          width: 56px;
          border-radius: 8px 30px 8px 8px;
        }

        .wheel {
          position: absolute;
          bottom: 18px;
          width: 52px;
          height: 52px;
          background: #071126;
          border: 8px solid #ffffff;
          border-radius: 50%;
          box-shadow: inset 0 0 0 5px #394762;
        }

        .wheel.left {
          left: 72px;
        }

        .wheel.right {
          right: 72px;
        }

        .searchBox {
          position: absolute;
          left: 52px;
          right: 52px;
          bottom: 26px;
          z-index: 3;
          display: grid;
          grid-template-columns: repeat(5, 1fr) 160px;
          gap: 16px;
          background: rgba(255,255,255,0.86);
          backdrop-filter: blur(20px);
          border: 1px solid #e4e9f3;
          border-radius: 22px;
          padding: 16px;
          box-shadow: 0 16px 40px rgba(12, 28, 58, 0.12);
        }

        .filterItem {
          background: white;
          border: 1px solid #e8edf5;
          border-radius: 16px;
          padding: 13px 15px;
          display: flex;
          align-items: center;
          gap: 12px;
        }

        .filterItem span {
          font-size: 22px;
        }

        .filterItem small {
          display: block;
          color: #7a8398;
          font-size: 11px;
          margin-bottom: 2px;
        }

        .filterItem strong {
          font-size: 13px;
        }

        .searchBtn {
          border-radius: 16px;
          background: #0048ff;
          color: white;
          font-weight: 900;
          font-size: 14px;
        }

        .categories {
          display: grid;
          grid-template-columns: repeat(5, 1fr);
          gap: 16px;
          margin: 20px 0;
        }

        .categoryCard {
          display: flex;
          align-items: center;
          gap: 13px;
          justify-content: space-between;
          background: white;
          border: 1px solid #e6ebf4;
          border-radius: 18px;
          padding: 16px;
          box-shadow: 0 8px 25px rgba(10, 20, 40, 0.04);
        }

        .categoryIcon {
          width: 54px;
          height: 42px;
          border-radius: 14px;
          background: #edf3ff;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 22px;
        }

        .categoryCard h3 {
          margin: 0 0 4px;
          font-size: 14px;
        }

        .categoryCard p {
          margin: 0;
          font-size: 12px;
          color: #657189;
          line-height: 1.35;
        }

        .launchGrid {
          display: grid;
          grid-template-columns: 1.4fr 0.9fr;
          gap: 20px;
          margin-top: 20px;
        }

        .emptyListings,
        .sellerBox {
          background: white;
          border: 1px solid #e6ebf4;
          border-radius: 24px;
          padding: 34px;
          box-shadow: 0 12px 30px rgba(10, 20, 40, 0.05);
        }

        .emptyListings {
          text-align: center;
        }

        .emptyIcon {
          width: 76px;
          height: 76px;
          border-radius: 24px;
          background: #edf3ff;
          color: #0048ff;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 34px;
          margin: 0 auto 18px;
        }

        .emptyListings h2,
        .sellerBox h2 {
          margin: 0 0 10px;
          font-size: 30px;
          letter-spacing: -1px;
        }

        .emptyListings p,
        .sellerBox p {
          color: #657189;
          font-size: 15px;
          line-height: 1.6;
          margin: 0;
        }

        .emptyActions {
          display: flex;
          justify-content: center;
          gap: 12px;
          margin-top: 24px;
        }

        .sellerSteps {
          display: grid;
          gap: 12px;
          margin: 24px 0;
        }

        .sellerSteps div {
          display: flex;
          align-items: center;
          gap: 12px;
          padding: 14px;
          background: #f7f9fd;
          border-radius: 14px;
          border: 1px solid #e8edf5;
        }

        .sellerSteps strong {
          width: 30px;
          height: 30px;
          border-radius: 10px;
          background: #0048ff;
          color: white;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 13px;
        }

        .sellerSteps span {
          font-weight: 800;
          color: #182238;
          font-size: 14px;
        }

        .fullBtn {
          width: 100%;
        }

        .trustGrid {
          display: grid;
          grid-template-columns: repeat(4, 1fr);
          gap: 18px;
          margin: 22px 0 14px;
        }

        .trustCard {
          display: flex;
          gap: 16px;
          align-items: center;
          background: white;
          border: 1px solid #e6ebf4;
          border-radius: 18px;
          padding: 18px;
        }

        .trustCard span {
          width: 46px;
          height: 46px;
          border-radius: 14px;
          background: #edf3ff;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 24px;
          flex-shrink: 0;
        }

        .trustCard h3 {
          margin: 0 0 4px;
          font-size: 15px;
        }

        .trustCard p {
          margin: 0;
          color: #657189;
          font-size: 12px;
          line-height: 1.45;
        }

        .newsletter {
          margin-top: 14px;
          background: white;
          border: 1px solid #e6ebf4;
          border-radius: 18px;
          padding: 18px 24px;
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 20px;
        }

        .newsletter h3 {
          margin: 0 0 4px;
        }

        .newsletter p {
          margin: 0;
          color: #657189;
          font-size: 13px;
        }

        .emailBox {
          display: flex;
          gap: 10px;
          min-width: 440px;
        }

        .emailBox input {
          flex: 1;
          border: 1px solid #e0e6f0;
          border-radius: 12px;
          padding: 14px 16px;
          font-size: 14px;
          outline: none;
        }

        .emailBox button {
          border-radius: 12px;
          background: #0048ff;
          color: white;
          padding: 0 20px;
          font-weight: 800;
        }

        @media (max-width: 1200px) {
          .navLinks {
            display: none;
          }

          .heroVisual {
            opacity: 0.25;
            right: 20px;
          }

          .searchBox {
            grid-template-columns: repeat(2, 1fr);
          }

          .searchBtn {
            min-height: 56px;
          }

          .categories {
            grid-template-columns: repeat(2, 1fr);
          }

          .launchGrid {
            grid-template-columns: 1fr;
          }

          .trustGrid {
            grid-template-columns: repeat(2, 1fr);
          }
        }

        @media (max-width: 700px) {
          .page {
            padding: 16px;
          }

          .navbar {
            height: auto;
            align-items: flex-start;
          }

          .navActions {
            display: none;
          }

          .logo {
            font-size: 34px;
          }

          .hero {
            min-height: auto;
            padding: 32px 20px 20px;
          }

          .heroText h1 {
            font-size: 42px;
          }

          .heroText p {
            font-size: 15px;
          }

          .heroVisual {
            position: relative;
            top: auto;
            right: auto;
            width: 100%;
            height: 160px;
            opacity: 1;
            margin: 10px 0;
            transform: scale(0.8);
          }

          .searchBox {
            position: relative;
            left: auto;
            right: auto;
            bottom: auto;
            margin-top: 18px;
            grid-template-columns: 1fr;
          }

          .searchBtn {
            padding: 16px;
          }

          .categories,
          .trustGrid {
            grid-template-columns: 1fr;
          }

          .emptyListings,
          .sellerBox {
            padding: 24px;
          }

          .emptyActions {
            flex-direction: column;
          }

          .newsletter {
            flex-direction: column;
            align-items: stretch;
          }

          .emailBox {
            min-width: 0;
            width: 100%;
            flex-direction: column;
          }

          .emailBox button {
            padding: 14px;
          }
        }
      `}</style>
    </main>
  );
}
