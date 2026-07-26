import LegalPage from "../components/LegalPage";

export const metadata = {
  title: "Safety Advice | Kerb",
  description: "Buyer and seller safety guidance for Kerb users.",
};

export default function SafetyPage() {
  return (
    <LegalPage
      kicker="Marketplace safety"
      title="Buying and selling safely"
      description="Kerb helps buyers and sellers connect, but every user should carry out their own checks before agreeing a vehicle sale."
    >
      <section>
        <h2>1. Kerb is not the seller</h2>
        <p>
          Kerb does not own, inspect, sell, finance, warrant or deliver vehicles.
          Buyers and sellers deal directly with each other. Treat every listing
          as something you should independently check before paying.
        </p>
      </section>

      <section>
        <h2>2. Buyer safety tips</h2>
        <ul>
          <li>View the car in person before paying where possible.</li>
          <li>Check the V5C logbook, MOT history, service history and seller identity.</li>
          <li>Consider an HPI or vehicle history check for finance, theft or write-off markers.</li>
          <li>Make sure the mileage, condition and photos match the vehicle.</li>
          <li>Do not send money because a seller is rushing you or refusing basic checks.</li>
          <li>Be careful with delivery-only offers, unusual payment links or prices that look too good to be true.</li>
        </ul>
      </section>

      <section>
        <h2>3. Seller safety tips</h2>
        <ul>
          <li>Meet buyers in a sensible, safe location and avoid being alone if you are unsure.</li>
          <li>Do not hand over keys, documents or the vehicle until payment is cleared.</li>
          <li>Be careful with fake payment screenshots, overpayment scams or courier stories.</li>
          <li>Keep your listing accurate and update it quickly if the car is sold.</li>
          <li>Do not share unnecessary personal information in public listing text.</li>
        </ul>
      </section>

      <section>
        <h2>4. Reporting listings</h2>
        <p>
          If a listing looks suspicious, inaccurate, stolen, abusive or unsafe,
          use the report option on the listing page. Kerb may review reports and
          remove or restrict listings where needed.
        </p>
        <p>
          For urgent safety concerns, email <a href="mailto:hello@kerbcar.co.uk">hello@kerbcar.co.uk</a>.
        </p>
      </section>

      <section>
        <h2>5. Messages</h2>
        <p>
          Keep conversations on Kerb where possible so there is a record of what
          was said. Report users who send abusive, suspicious or unrelated
          messages.
        </p>
      </section>

      <section>
        <h2>6. If something feels wrong</h2>
        <p>
          Pause the conversation. Do not pay under pressure. Get independent
          advice, ask for more evidence and walk away if the advert or user does
          not feel right.
        </p>
      </section>
    </LegalPage>
  );
}
