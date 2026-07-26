"use client";

import { useState } from "react";
import styles from "./ContactPage.module.css";

const supportOptions = [
  "Account help",
  "Listing help",
  "Safety report",
  "Buyer/seller enquiry issue",
  "General question",
];

const initialForm = {
  category: "General question",
  name: "",
  email: "",
  listingLink: "",
  message: "",
};

export default function ContactForm() {
  const [form, setForm] = useState(initialForm);
  const [submitted, setSubmitted] = useState(false);

  function updateField(field, value) {
    setSubmitted(false);
    setForm((current) => ({ ...current, [field]: value }));
  }

  function handleSubmit(event) {
    event.preventDefault();

    const subject = `Kerb Car support - ${form.category}`;
    const body = [
      `Support category: ${form.category}`,
      `Name: ${form.name}`,
      `Email: ${form.email}`,
      form.listingLink ? `Listing link: ${form.listingLink}` : "Listing link: Not provided",
      "",
      "Message:",
      form.message,
    ].join("\n");

    const mailto = `mailto:hello@kerbcar.co.uk?subject=${encodeURIComponent(
      subject
    )}&body=${encodeURIComponent(body)}`;

    setSubmitted(true);
    window.location.href = mailto;
  }

  return (
    <form className={styles.contactForm} onSubmit={handleSubmit}>
      <label>
        Support category
        <select
          value={form.category}
          onChange={(event) => updateField("category", event.target.value)}
          required
        >
          {supportOptions.map((option) => (
            <option key={option} value={option}>
              {option}
            </option>
          ))}
        </select>
      </label>

      <div className={styles.formRow}>
        <label>
          Your name
          <input
            type="text"
            value={form.name}
            onChange={(event) => updateField("name", event.target.value)}
            placeholder="Your full name"
            required
          />
        </label>

        <label>
          Email address
          <input
            type="email"
            value={form.email}
            onChange={(event) => updateField("email", event.target.value)}
            placeholder="you@example.com"
            required
          />
        </label>
      </div>

      <label>
        Listing link or reference, if relevant
        <input
          type="text"
          value={form.listingLink}
          onChange={(event) => updateField("listingLink", event.target.value)}
          placeholder="https://kerbcar.co.uk/listing/..."
        />
      </label>

      <label>
        How can we help?
        <textarea
          value={form.message}
          onChange={(event) => updateField("message", event.target.value)}
          placeholder="Tell us what happened and include any useful details."
          rows={6}
          required
        />
      </label>

      {submitted ? (
        <div className={styles.successBox}>
          Thanks — your email app should open with your message prepared. Send it
          from there and we’ll aim to reply within 1–2 working days.
        </div>
      ) : null}

      <button type="submit">Prepare email to support</button>
    </form>
  );
}
