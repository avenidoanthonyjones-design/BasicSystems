/* =========================================================
   BASIC SYSTEMS — site configuration
   Edit this file only; no other code changes are needed.
   ========================================================= */
window.BASIC_SYSTEMS_CONFIG = {

  /* ---------------------------------------------------------
     CONTACT FORM
     While `endpoint` is empty, the form validates input but does
     NOT send anything, and it tells the visitor so.

     To start receiving inquiries by email, pick ONE free option:

     A) Web3Forms (free tier) — https://web3forms.com
        endpoint: "https://api.web3forms.com/submit",
        extraFields: { access_key: "YOUR-WEB3FORMS-ACCESS-KEY" }

     B) Formspree (free tier) — https://formspree.io
        endpoint: "https://formspree.io/f/YOUR-FORM-ID",
        extraFields: {}

     C) Your own Cloudflare Pages Function (see README, "Contact form")
        endpoint: "/api/contact",
        extraFields: {}

     The form sends a JSON POST with these fields:
     name, company, email, phone, service, message, subject
     (plus anything in extraFields).
     --------------------------------------------------------- */
  contactForm: {
    endpoint: "",
    extraFields: {},
    subject: "New website inquiry — BASIC SYSTEMS"
  },

  /* ---------------------------------------------------------
     PUBLIC CONTACT DETAILS
     Leave blank until confirmed. Blank items are not shown.
     Filled items appear in the Contact section and the footer.
     --------------------------------------------------------- */
  siteContact: {
    email: "",    // e.g. "info@yourdomain.com"
    phone: "",    // e.g. "+00 000 000 0000"
    address: ""   // e.g. "Street, City, Country"
  }
};
