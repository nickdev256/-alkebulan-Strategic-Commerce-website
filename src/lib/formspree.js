/*
 * Sends website forms to the company inbox through Formspree (https://formspree.io).
 *
 * Setup: create a form in Formspree, then set its ID (the part after /f/ in the
 * form's endpoint, e.g. "xyzabcd") as VITE_FORMSPREE_FORM_ID in a `.env.local`
 * file for local work, and in the hosting provider's environment variables for
 * the live site. Rebuild after changing it.
 *
 * Until an ID is set, `isFormspreeReady` is false and the pages fall back to
 * opening the visitor's email app, so the forms never silently fail.
 */

const formId = import.meta.env.VITE_FORMSPREE_FORM_ID?.trim();

export const isFormspreeReady = Boolean(formId);

/**
 * Posts the fields to Formspree.
 * Resolves on success; throws an Error with a readable message on failure.
 */
export async function sendToFormspree(fields) {
  if (!isFormspreeReady) throw new Error('The form service is not configured.');

  let response;
  try {
    response = await fetch(`https://formspree.io/f/${formId}`, {
      method: 'POST',
      headers: { Accept: 'application/json', 'Content-Type': 'application/json' },
      body: JSON.stringify(fields),
    });
  } catch {
    throw new Error('We could not reach the server. Please check your connection and try again.');
  }

  if (response.ok) return;

  let message = 'Something went wrong while sending your message. Please try again.';
  try {
    const data = await response.json();
    if (Array.isArray(data.errors) && data.errors.length) {
      message = data.errors.map((error) => error.message).join(' ');
    }
  } catch {
    // Keep the general message when the reply is not JSON.
  }
  throw new Error(message);
}
