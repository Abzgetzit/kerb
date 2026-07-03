"use client";

export default function SeoBottomContent({ content }) {
  if (!content) return null;

  return (
    <section className="seoBottomContent">
      <div className="seoIntroCard">
        {content.kicker && <span>{content.kicker}</span>}
        <h2>{content.title}</h2>
        <p>{content.description}</p>
      </div>

      {content.points?.length ? (
        <div className="seoPointGrid">
          {content.points.map((point, index) => (
            <article key={point.title}>
              <em>{String(index + 1).padStart(2, "0")}</em>
              <h3>{point.title}</h3>
              <p>{point.text}</p>
            </article>
          ))}
        </div>
      ) : null}

      {content.faqs?.length ? (
        <div className="seoFaqCard">
          <div>
            <span>Kerb Car FAQs</span>
            <h2>{content.faqTitle || "Common questions"}</h2>
          </div>

          <div className="seoFaqGrid">
            {content.faqs.map((faq) => (
              <article key={faq.question}>
                <h3>{faq.question}</h3>
                <p>{faq.answer}</p>
              </article>
            ))}
          </div>
        </div>
      ) : null}

      <style jsx>{`
        .seoBottomContent {
          padding: 0 40px 54px;
          margin-top: -22px;
          background: #f7f9fd;
          color: #071126;
          font-family: Inter, Arial, sans-serif;
          display: grid;
          gap: 18px;
        }
        .seoIntroCard,
        .seoFaqCard,
        .seoPointGrid article,
        .seoFaqGrid article {
          border: 1px solid #dfe8f7;
          background: #fff;
          box-shadow: 0 16px 42px rgba(14, 30, 70, 0.06);
        }
        .seoIntroCard,
        .seoFaqCard {
          border-radius: 28px;
          padding: 28px;
        }
        .seoIntroCard span,
        .seoFaqCard > div:first-child span {
          display: inline-flex;
          color: #0048ff;
          background: #eaf1ff;
          border-radius: 999px;
          padding: 9px 13px;
          font-weight: 950;
          margin-bottom: 12px;
        }
        .seoIntroCard h2,
        .seoFaqCard h2 {
          margin: 0 0 10px;
          font-size: clamp(30px, 4vw, 48px);
          letter-spacing: -1.8px;
          line-height: 1;
        }
        .seoIntroCard p,
        .seoPointGrid p,
        .seoFaqGrid p {
          color: #53617a;
          line-height: 1.65;
          font-weight: 750;
          margin: 0;
        }
        .seoPointGrid,
        .seoFaqGrid {
          display: grid;
          grid-template-columns: repeat(3, minmax(0, 1fr));
          gap: 14px;
        }
        .seoPointGrid article,
        .seoFaqGrid article {
          border-radius: 24px;
          padding: 22px;
        }
        .seoPointGrid article {
          background: linear-gradient(145deg, #ffffff, #f4f8ff);
        }
        .seoPointGrid em {
          display: inline-flex;
          width: 38px;
          height: 38px;
          align-items: center;
          justify-content: center;
          border-radius: 14px;
          background: #0048ff;
          color: #fff;
          font-style: normal;
          font-weight: 950;
          margin-bottom: 14px;
        }
        .seoPointGrid h3,
        .seoFaqGrid h3 {
          margin: 0 0 8px;
          font-size: 20px;
          letter-spacing: -0.2px;
        }
        .seoFaqCard {
          display: grid;
          gap: 18px;
        }
        @media (max-width: 900px) {
          .seoBottomContent {
            padding: 0 16px 42px;
          }
          .seoPointGrid,
          .seoFaqGrid {
            grid-template-columns: 1fr 1fr;
          }
        }
        @media (max-width: 620px) {
          .seoPointGrid,
          .seoFaqGrid {
            grid-template-columns: 1fr;
          }
          .seoIntroCard,
          .seoFaqCard {
            padding: 22px;
          }
        }
      `}</style>
    </section>
  );
}
