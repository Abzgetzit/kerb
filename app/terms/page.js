import LegalPage, { legalStyles as styles } from "../components/LegalPage";

export const metadata = {
  title: "Terms and Conditions | Kerb",
  description: "Terms and conditions for using the Kerb car marketplace.",
};

export default function TermsPage() {
  return (
    <LegalPage
      kicker="Terms and conditions"
      title="Kerb terms of use"
      description="These terms explain how buyers, sellers and account holders can use Kerb. Kerb is a marketplace for vehicle listings, not a direct car seller."
    >
      <section>
        <h2>1. About Kerb</h2>
        <p>
          Kerb is an early-stage UK car marketplace website. Buyers can browse
          vehicle listings, save cars and message sellers. Sellers can create an
          account, submit listings and manage buyer enquiries.
        </p>
        <p>
          Kerb does <strong>not</strong> own, inspect, sell, finance, insure,
          warrant or deliver vehicles listed on the site. Any agreement to buy,
          sell, reserve, view, test drive or pay for a vehicle is made directly
          between the buyer and the seller.
        </p>
        <p>
          Kerb is not currently described as a limited company or registered
          company. If that changes, these terms will be updated.
        </p>
      </section>

      <section>
        <h2>2. Using Kerb</h2>
        <p>
          You must use Kerb honestly, lawfully and only for genuine vehicle
          marketplace activity. You must not misuse the site, interfere with its
          security, scrape it at scale, submit false information, impersonate
          another person, or use Kerb to send spam, scams or abusive messages.
        </p>
        <p>
          You are responsible for keeping your sign-in details and device secure.
          If you believe someone has accessed your Kerb account without
          permission, stop using the account and tell Kerb through the available
          in-product support or reporting routes.
        </p>
      </section>

      <section>
        <h2>3. Accounts</h2>
        <p>
          Kerb uses one account type for buyers and sellers. Your account may be
          used to save cars, create listings, send enquiries, receive messages
          and manage your vehicle activity.
        </p>
        <p>
          You must provide accurate account and contact information. Kerb may
          suspend, restrict or remove accounts that appear fake, unsafe,
          misleading, abusive, automated or in breach of these terms.
        </p>
      </section>

      <section>
        <h2>4. Vehicle listings</h2>
        <p>Sellers are responsible for every listing they submit to Kerb.</p>
        <ul>
          <li>The vehicle details, mileage, price, condition and photos must be accurate.</li>
          <li>You must have the right to advertise the vehicle.</li>
          <li>You must not hide important information such as finance, accident damage, write-off status, serious mechanical issues, mileage concerns or ownership issues.</li>
          <li>You must not upload stolen, misleading or unrelated photos.</li>
          <li>You must not list prohibited, illegal or unsafe items.</li>
        </ul>
        <p>
          Kerb may manually review listings before they appear publicly. Kerb may
          approve, reject, edit, hide, mark as sold or remove listings if they
          appear inaccurate, unsafe, suspicious, duplicated, poor quality or in
          breach of these terms.
        </p>
      </section>

      <section>
        <h2>5. Prices and valuations</h2>
        <p>
          Any guide price or valuation shown by Kerb is a rough estimate only. It
          is not a guaranteed value, offer, promise, finance quote or sale price.
          Vehicle value depends on many factors including exact trim, mileage,
          condition, history, location, demand, photos and market timing.
        </p>
        <p>
          Sellers choose their own asking price. Buyers should carry out their
          own checks before agreeing a price.
        </p>
      </section>

      <section>
        <h2>6. Messages and enquiries</h2>
        <p>
          Kerb may let buyers and sellers message each other about a listing.
          Messages should be used only for genuine vehicle enquiries. Do not send
          abusive, fraudulent, misleading, unlawful or unrelated messages.
        </p>
        <p>
          Kerb may store and review messages where needed to operate the service,
          investigate reports, prevent misuse, improve safety or comply with
          legal obligations.
        </p>
      </section>

      <section>
        <h2>7. Buying and selling</h2>
        <p>
          Buyers and sellers are responsible for agreeing viewings, inspections,
          tests, payment, collection, delivery and transfer of ownership between
          themselves. Kerb is not a party to the sale and does not process vehicle
          payments.
        </p>
        <p>
          Buyers should check the vehicle, documents, MOT, mileage, finance,
          write-off status and seller identity before paying. Sellers should make
          sure funds are cleared before handing over a vehicle or documents.
        </p>
      </section>

      <section>
        <h2>8. Fees</h2>
        <p>
          Kerb may currently be free to use while it is being developed. If paid
          features, listing fees, subscriptions or promotions are added, the
          relevant price and payment terms will be shown before you choose to use
          them.
        </p>
      </section>

      <section>
        <h2>9. Photos, descriptions and user content</h2>
        <p>
          You keep ownership of content you upload, but you give Kerb permission
          to host, store, copy, display, resize and use that content to operate,
          promote and improve the marketplace. You must only upload content you
          own or have permission to use.
        </p>
      </section>

      <section>
        <h2>10. Availability and changes</h2>
        <p>
          Kerb may change, pause or remove features as the website develops. The
          site may sometimes be unavailable because of maintenance, updates,
          hosting issues or technical problems.
        </p>
      </section>

      <section>
        <h2>11. Liability</h2>
        <p>
          Kerb aims to provide a useful marketplace, but it cannot guarantee that
          every listing, message, seller, buyer or vehicle is accurate, available
          or safe. To the fullest extent allowed by law, Kerb is not responsible
          for losses caused by user listings, vehicle condition, private
          agreements, payments between users, missed messages or third-party
          services.
        </p>
        <p>
          Nothing in these terms excludes liability where it would be unlawful to
          do so, including liability for fraud or for death or personal injury
          caused by negligence.
        </p>
      </section>

      <section>
        <h2>12. Governing law</h2>
        <p>
          These terms are intended for use with a UK marketplace. Unless your
          local consumer rights require otherwise, they are governed by the laws
          of England and Wales.
        </p>
      </section>

      <section>
        <h2>13. Contact details</h2>
        <p className={styles.note}>
          Kerb does not yet publish a dedicated business email, phone number or
          postal address. These details should be added before a full public
          launch. Until then, users should use the account, message and report
          tools available on the website.
        </p>
      </section>
    </LegalPage>
  );
}
