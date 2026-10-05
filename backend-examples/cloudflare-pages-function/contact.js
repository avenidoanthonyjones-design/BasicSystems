/**
 * OPTIONAL backend for the BASIC SYSTEMS contact form.
 *
 * A Cloudflare Pages Function that receives the form's JSON POST and
 * emails it with Resend (https://resend.com — free tier available).
 * Pages Functions are included in the Cloudflare Pages free plan.
 *
 * To enable:
 *   1. Copy this file to:  functions/api/contact.js   (at the project root,
 *      next to the "public" folder — NOT inside "public").
 *   2. In Cloudflare: Pages project → Settings → Variables and Secrets, add:
 *        RESEND_API_KEY  (secret)  your Resend API key
 *        CONTACT_TO                the inbox that should receive inquiries
 *        CONTACT_FROM              a sender on a domain verified in Resend,
 *                                  e.g. "BASIC SYSTEMS Website <web@yourdomain.com>"
 *   3. In public/js/config.js set:  endpoint: "/api/contact"
 *   4. Commit and push; Cloudflare redeploys automatically.
 */

const MAX = { name: 120, company: 160, email: 160, phone: 40, service: 80, message: 4000 };

function clean(value, max) {
  return String(value || '').trim().slice(0, max);
}

function json(body, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { 'Content-Type': 'application/json' }
  });
}

export async function onRequestPost({ request, env }) {
  let input;
  try {
    input = await request.json();
  } catch {
    return json({ ok: false, error: 'Invalid request.' }, 400);
  }

  // Honeypot field: bots fill it, people don't.
  if (input.website) return json({ ok: true });

  const data = {};
  for (const key of Object.keys(MAX)) data[key] = clean(input[key], MAX[key]);

  if (!data.name || !data.message || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(data.email)) {
    return json({ ok: false, error: 'Missing or invalid fields.' }, 422);
  }

  if (!env.RESEND_API_KEY || !env.CONTACT_TO || !env.CONTACT_FROM) {
    return json({ ok: false, error: 'Email service is not configured.' }, 500);
  }

  const text = [
    `Name:    ${data.name}`,
    `Company: ${data.company || '-'}`,
    `Email:   ${data.email}`,
    `Phone:   ${data.phone || '-'}`,
    `Service: ${data.service || '-'}`,
    '',
    data.message
  ].join('\n');

  const res = await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${env.RESEND_API_KEY}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      from: env.CONTACT_FROM,
      to: [env.CONTACT_TO],
      reply_to: data.email,
      subject: `Website inquiry: ${data.service || 'General'} — ${data.name}`,
      text
    })
  });

  if (!res.ok) return json({ ok: false, error: 'Could not send email.' }, 502);
  return json({ ok: true });
}
