import LegalPage from "../components/LegalPage";
import ContactForm from "./ContactForm";
import styles from "./ContactPage.module.css";

const supportCategories = [
  {
    title: "Account help",
    text: "Sign in, account details, saved cars or dashboard access.",
  },
  {
    title: "Listing help",
    text: "Creating, editing, deleting, boosting or marking a listing as sold.",
  },
  {
    title: "Safety report",
    text: "Suspicious listings, unusual messages or concerns about marketplace safety.",
  },
  {
    title: "Buyer/seller enquiry issue",
    text: "Problems sending, receiving or replying to car enquiries.",
  },
  {
    title: "General question",
    text: "Anything else about using Kerb Car as a buyer or seller.",
  },
];

export const metadata = {
  title: "Contact Kerb Car Support | Kerb Car",
  description:
    "Contact Kerb Car about account help, listing support, enquiries, safety reports and general marketplace questions.",
};

export default function ContactPage() {
  return (
    <LegalPage
      kicker="Kerb Car support"
      title="Contact Kerb Car support"
      description="Get help with accounts, listings, enquiries, reports and safety concerns on the Kerb Car marketplace."
      lastUpdated={null}
    >
      <section className={styles.responseGrid}>
        <div className={styles.responseCard}>
          <span>Average response time</span>
          <strong>1–2 working days</strong>
          <p>
            We aim to reply within 1–2 working days. Please include enough detail
            so support can understand the issue clearly.
          </p>
        </div>

        <div className={styles.responseCard}>
          <span>Support email</span>
          <strong>
            <a href="mailto:hello@kerbcar.co.uk">hello@kerbcar.co.uk</a>
          </strong>
          <p>
            Use this email for Kerb Car account, listing, enquiry, report and
            marketplace support questions.
          </p>
        </div>
      </section>

      <section>
        <h2>How Kerb Car support can help</h2>
        <p>
          Kerb Car is a car marketplace that connects buyers and sellers. We do
          not sell, inspect, finance, warrant or deliver vehicles directly, but
          you can contact support about using the marketplace, managing your
          account, listing a car, enquiries, reports and safety concerns.
        </p>

        <div className={styles.categoryGrid}>
          {supportCategories.map((category) => (
            <div className={styles.categoryCard} key={category.title}>
              <h3>{category.title}</h3>
              <p>{category.text}</p>
            </div>
          ))}
        </div>
      </section>

      <section>
        <h2>Send a message</h2>
        <p>
          The form opens a prepared email to Kerb Car support. If your email app
          does not open, email us directly at <a href="mailto:hello@kerbcar.co.uk">hello@kerbcar.co.uk</a>.
        </p>

        <ContactForm />
      </section>

      <section className={styles.noticeCard}>
        <h2>Before you contact support</h2>
        <ul>
          <li>For listing issues, include the listing link if you have it.</li>
          <li>For account issues, include the email address on your Kerb Car account.</li>
          <li>For enquiry issues, explain whether you are the buyer or seller.</li>
          <li>For safety concerns, share what happened and any relevant listing or message details.</li>
        </ul>
      </section>
    </LegalPage>
  );
}
