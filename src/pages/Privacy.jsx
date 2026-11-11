import PageHero from '../components/PageHero.jsx';
import { contactEmail as email, contactPhone as phone } from '../content.js';
import './Privacy.css';

// DRAFT: to be reviewed by Alkebulan Global (and legal counsel if needed)
// before the site goes live.
const lastUpdated = 'November 12, 2026';

export default function Privacy() {
  return (
    <>
      <PageHero
        eyebrow="Legal"
        title="Privacy Policy"
        intro="How Alkebulan Global LLC handles the information you share with us through this website."
      />

      <section className="section section--white">
        <div className="container privacy">
          <p className="privacy-updated">Last updated: {lastUpdated}</p>

          <h2>Who we are</h2>
          <p>
            This website is operated by Alkebulan Global LLC, 1 World Trade
            Center, Suite 8500, New York, NY 10007, United States
            (&ldquo;Alkebulan Global&rdquo;, &ldquo;we&rdquo;, &ldquo;us&rdquo;).
          </p>

          <h2>Information we collect</h2>
          <p>We only collect information that you choose to send us:</p>
          <ul>
            <li>
              <strong>Inquiry form:</strong> your name, email address, and,
              if you provide them, your phone number, company, area of
              interest, sector, and message.
            </li>
            <li>
              <strong>Mailing list:</strong> the email address you enter to
              receive updates.
            </li>
            <li>
              <strong>Direct contact:</strong> anything you include when you
              email, call, or message us on WhatsApp.
            </li>
          </ul>
          <p>
            The inquiry form and the mailing list sign-up open your own email
            app with your message ready to send. Nothing is sent to us until
            you press send in that app.
          </p>

          <h2>How we use your information</h2>
          <ul>
            <li>To respond to your inquiry and discuss potential partnerships or services.</li>
            <li>To send you updates, if you asked to join our mailing list.</li>
            <li>To keep records of our business communications.</li>
          </ul>
          <p>We do not sell or rent your personal information.</p>

          <h2>Sharing your information</h2>
          <p>
            We may share your information with partners or advisers only where
            this is needed to respond to your inquiry and you would reasonably
            expect it, or where we are required to by law.
          </p>

          <h2>Third-party services on this website</h2>
          <p>
            Our Contact page shows a Google Maps map, and some pages load flag
            images from flagcdn.com. These services may receive technical
            information such as your IP address when the content loads, under
            their own privacy policies. Links to WhatsApp open WhatsApp, which
            is governed by its own terms.
          </p>
          <p>
            This website does not use advertising or analytics cookies.
          </p>

          <h2>How long we keep your information</h2>
          <p>
            We keep your information only as long as needed for the purposes
            above, or as required by law. You can ask us to remove you from
            our mailing list at any time.
          </p>

          <h2>Your choices and rights</h2>
          <p>
            You can ask us what personal information we hold about you, ask
            us to correct or delete it, or ask us to stop contacting you.
            Depending on where you live, you may have additional rights under
            local law.
          </p>

          <h2>Contact us about privacy</h2>
          <p>
            Email <a href={`mailto:${email}`}>{email}</a> or call{' '}
            <a href={`tel:${phone.replace(/[^+\d]/g, '')}`}>{phone}</a>.
          </p>

          <h2>Changes to this policy</h2>
          <p>
            We may update this policy from time to time. The date at the top
            of this page shows when it was last changed.
          </p>
        </div>
      </section>
    </>
  );
}
