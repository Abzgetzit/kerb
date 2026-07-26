import LegalPage from "../components/LegalPage";

export const metadata = {
  title: "Cookie Policy | Kerb Car",
  description: "How Kerb Car uses cookies, local storage and similar technologies.",
};

export default function CookiesPage() {
  return (
    <LegalPage
      kicker="Cookie policy"
      title="Cookies and local storage"
      description="Kerb Car uses essential cookies and browser storage to keep the marketplace working. This page explains what is used and why."
    >
      <section>
        <h2>1. What cookies are</h2>
        <p>
          Cookies and similar technologies store small pieces of information on
          your browser or device. Local storage can also remember non-sensitive
          preferences and interface state.
        </p>
      </section>

      <section>
        <h2>2. Essential storage Kerb Car uses</h2>
        <p>
          Kerb Car uses essential storage to provide account and marketplace
          features. This may include:
        </p>
        <ul>
          <li><strong>kerb_session:</strong> an HttpOnly, Secure session cookie used to keep you signed in. It is set by the server and is not readable by normal browser JavaScript.</li>
          <li><strong>kerbSessionToken:</strong> a temporary non-sensitive compatibility marker for older account pages while Kerb Car moves session handling to HttpOnly cookies.</li>
          <li><strong>kerbAccountEmail:</strong> remembers the email address linked to the current account interface.</li>
          <li><strong>kerbUser:</strong> stores basic account display information for the website interface.</li>
          <li><strong>Saved preferences:</strong> may remember recent browsing, filters, saved cars, saved searches or UI state.</li>
        </ul>
        <p>
          These are used because the website needs them to provide requested
          features such as signing in, listing cars, saving cars and messaging.
        </p>
      </section>

      <section>
        <h2>3. Analytics and optional cookies</h2>
        <p>
          Kerb Car may use basic technical logs and page-view information to
          understand whether the website is working and to show sellers listing
          view counts. Kerb Car does not currently need third-party advertising
          cookies for core marketplace use.
        </p>
        <p>
          If Kerb Car adds optional analytics, advertising or marketing cookies in
          future, the website should ask for consent where required and explain
          how to change your choice.
        </p>
      </section>

      <section>
        <h2>4. Managing browser storage</h2>
        <p>
          You can clear cookies and local storage in your browser settings. If
          you clear essential Kerb Car storage, you may be signed out and some
          saved preferences may be removed.
        </p>
        <p>
          For cookie questions, contact <a href="mailto:hello@kerbcar.co.uk">hello@kerbcar.co.uk</a>.
        </p>
      </section>

      <section>
        <h2>5. Changes to this policy</h2>
        <p>
          Kerb Car may update this page if new cookies, analytics tools or browser
          storage features are added.
        </p>
      </section>
    </LegalPage>
  );
}
