import LegalPage from "../components/LegalPage";

export const metadata = {
  title: "Contact Kerb | Kerb",
  description: "Contact Kerb for marketplace, account, listing and safety support.",
};

export default function ContactPage() {
  return (
    <LegalPage
      kicker="Contact Kerb"
      title="Need help with Kerb?"
      description="Use this page for account, listing, enquiry, safety and general marketplace questions."
    >
      <section>
        <h2>Email</h2>
        <p>
          Contact Kerb at <a href="mailto:hello@kerbcar.co.uk">hello@kerbcar.co.uk</a>.
        </p>
      </section>

      <section>
        <h2>Listings and enquiries</h2>
        <p>
          For listing issues, buyer enquiries or account problems, include the
          listing link, your account email and a short explanation so Kerb can
          look into it faster.
        </p>
      </section>

      <section>
        <h2>Safety reports</h2>
        <p>
          If a listing looks suspicious, use the report option on the listing
          page where possible. For urgent safety concerns, email
          <a href="mailto:hello@kerbcar.co.uk"> hello@kerbcar.co.uk</a>.
        </p>
      </section>
    </LegalPage>
  );
}
