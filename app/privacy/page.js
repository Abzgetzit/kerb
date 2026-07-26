import LegalPage from "../components/LegalPage";

export const metadata = {
  title: "Privacy Policy | Kerb",
  description: "How Kerb collects and uses personal information.",
};

export default function PrivacyPage() {
  return (
    <LegalPage
      kicker="Privacy policy"
      title="How Kerb uses personal information"
      description="This policy explains what Kerb collects when you browse, create an account, list a car, save cars or message another user."
    >
      <section>
        <h2>1. Who this policy is for</h2>
        <p>
          This policy applies to visitors, account holders, buyers, sellers and
          anyone who uses Kerb. Kerb is an early-stage marketplace website and is
          not currently described as a limited company or registered company.
        </p>
        <p>
          For privacy questions or data requests, contact Kerb at <a href="mailto:hello@kerbcar.co.uk">hello@kerbcar.co.uk</a>.
        </p>
      </section>

      <section>
        <h2>2. Information Kerb collects</h2>
        <ul>
          <li><strong>Account details:</strong> name, email address, phone number, sign-in details and account activity.</li>
          <li><strong>Listing details:</strong> vehicle make, model, year, mileage, price, location, description, photos, features, seller name, seller email, phone number and seller type.</li>
          <li><strong>Messages and enquiries:</strong> buyer and seller messages, names, email addresses, phone numbers and timestamps.</li>
          <li><strong>Saved activity:</strong> saved cars, saved searches and account preferences.</li>
          <li><strong>Safety and moderation data:</strong> listing reports, moderation notes, rejection reasons and admin actions.</li>
          <li><strong>Technical data:</strong> device, browser, IP-related logs, page visits, listing views and service diagnostics.</li>
        </ul>
      </section>

      <section>
        <h2>3. How Kerb uses information</h2>
        <ul>
          <li>To create and manage accounts.</li>
          <li>To publish, review, edit and manage listings.</li>
          <li>To let buyers and sellers send enquiries and chat replies.</li>
          <li>To show saved cars, saved searches and listing analytics.</li>
          <li>To send service emails such as login codes, account confirmations, listing updates and message notifications.</li>
          <li>To prevent fraud, spam, unsafe listings and misuse of the marketplace.</li>
          <li>To maintain, secure, debug and improve the website.</li>
        </ul>
      </section>

      <section>
        <h2>4. Legal reasons for using information</h2>
        <p>
          Kerb uses personal information where it is needed to provide the
          service you ask for, where Kerb has a legitimate interest in operating
          and protecting the marketplace, where you have given consent, or where
          Kerb needs to comply with legal obligations.
        </p>
        <p>
          For example, account and listing data is needed to provide the
          marketplace. Safety reports and moderation activity help protect users.
          Marketing messages should only be sent where permitted and can be
          stopped.
        </p>
      </section>

      <section>
        <h2>5. What other users can see</h2>
        <p>
          Public listings may show vehicle details, photos, seller type, seller
          name, phone number and location, depending on the seller's display
          choices. When a buyer sends an enquiry, the seller may receive the
          buyer name, email address, phone number and message. When a seller
          replies, the buyer may receive the seller message and relevant listing
          details.
        </p>
      </section>

      <section>
        <h2>6. Service providers</h2>
        <p>
          Kerb uses trusted service providers to run the website. These may
          include hosting, database, storage, email inbox, email delivery,
          analytics or logging providers such as Vercel, Supabase, Microsoft 365
          and Resend.
        </p>
        <p>
          These providers process information so Kerb can operate the
          marketplace. Some providers may process data outside the UK or EEA. If
          this happens, Kerb should rely on appropriate safeguards where required
          by data protection law.
        </p>
      </section>

      <section>
        <h2>7. How long information is kept</h2>
        <p>
          Kerb keeps information for as long as needed to provide the service,
          protect users, resolve disputes, meet legal obligations and maintain
          accurate records. For example, active account, listing and message
          information may be kept while the account or listing is active and for
          a reasonable period afterwards.
        </p>
        <p>
          If you ask for deletion, Kerb will assess what can be deleted and what
          may need to be kept for safety, legal, fraud-prevention or record
          purposes.
        </p>
      </section>

      <section>
        <h2>8. Your rights</h2>
        <p>
          Depending on the situation, you may have rights to access, correct,
          delete, restrict or object to the use of your personal information. You
          may also have rights to data portability and to complain to the UK
          Information Commissioner's Office.
        </p>
        <p>
          To contact Kerb about privacy or personal information, email <a href="mailto:hello@kerbcar.co.uk">hello@kerbcar.co.uk</a>.
        </p>
      </section>

      <section>
        <h2>9. Security</h2>
        <p>
          Kerb uses technical and organisational steps to protect information,
          including hosted database, storage and email services. No online
          service can be guaranteed completely secure, so users should also keep
          their devices and sign-in details safe.
        </p>
      </section>

      <section>
        <h2>10. Changes to this policy</h2>
        <p>
          Kerb may update this policy as the website, features and legal setup
          develop. The latest version will be shown on this page.
        </p>
      </section>
    </LegalPage>
  );
}
