import Navbar from '../components/Navbar'

const oswald = { fontFamily: 'Oswald, sans-serif' }

export default function PrivacyPage() {
  return (
    <div className="bg-black min-h-screen text-white">
      <Navbar />

      <div className="pt-24 pb-16 px-4 max-w-3xl mx-auto">
        <h1 style={oswald} className="text-3xl sm:text-4xl tracking-widest uppercase mb-8">
          Privacy Policy
        </h1>
        <p className="text-gray-400 text-sm mb-10">Effective Date: April 18, 2026</p>

        <div className="space-y-8 text-gray-300 text-sm leading-relaxed">
          <Section title="1. Introduction">
            Sultan of Swing ("we," "us," or "our"), operated by Platos Pro LLC, is committed to
            protecting your privacy. This Privacy Policy explains how we collect, use, disclose, and
            safeguard your information when you visit our website or make a purchase.
          </Section>

          <Section title="2. Information We Collect">
            <ul className="list-disc pl-5 space-y-2 mt-2">
              <li><strong>Personal Information:</strong> Name, email address, shipping address, billing address, and phone number provided during checkout.</li>
              <li><strong>Payment Information:</strong> Credit card and payment details are processed securely by Stripe. We do not store your full card number on our servers.</li>
              <li><strong>Order Information:</strong> Products purchased, order total, shipping method, and promo codes applied.</li>
              <li><strong>Device &amp; Usage Data:</strong> Browser type, IP address, pages visited, and referring URL collected automatically through standard web technologies.</li>
            </ul>
          </Section>

          <Section title="3. How We Use Your Information">
            <ul className="list-disc pl-5 space-y-2 mt-2">
              <li>Process and fulfill your orders</li>
              <li>Send order confirmations, shipping updates, and receipts</li>
              <li>Respond to customer service inquiries</li>
              <li>Improve our website and product offerings</li>
              <li>Prevent fraudulent transactions</li>
              <li>Comply with legal obligations</li>
            </ul>
          </Section>

          <Section title="4. Third-Party Services">
            We share information with trusted third parties only as necessary to operate our business:
            <ul className="list-disc pl-5 space-y-2 mt-2">
              <li><strong>Stripe:</strong> Payment processing</li>
              <li><strong>FedEx / USPS:</strong> Shipping and delivery</li>
              <li><strong>Cloudflare:</strong> Website hosting and security</li>
            </ul>
            These providers have their own privacy policies governing their use of your data.
          </Section>

          <Section title="5. Cookies &amp; Tracking">
            Our website may use cookies and similar technologies to enhance your browsing experience.
            You can control cookie settings through your browser preferences. We do not sell your
            personal information to third parties.
          </Section>

          <Section title="6. Data Security">
            We implement industry-standard security measures including SSL/TLS encryption, secure
            payment processing through Stripe, and restricted access to personal data. However, no
            method of transmission over the Internet is 100% secure.
          </Section>

          <Section title="7. Data Retention">
            We retain your personal information for as long as necessary to fulfill orders, provide
            customer support, and comply with legal obligations. You may request deletion of your
            data by contacting us.
          </Section>

          <Section title="8. Your Rights">
            Depending on your location, you may have the right to:
            <ul className="list-disc pl-5 space-y-2 mt-2">
              <li>Access, correct, or delete your personal information</li>
              <li>Opt out of marketing communications</li>
              <li>Request a copy of data we hold about you</li>
            </ul>
            California residents may have additional rights under the CCPA.
          </Section>

          <Section title="9. Children's Privacy">
            Our website is not directed to children under 13. We do not knowingly collect personal
            information from children under 13.
          </Section>

          <Section title="10. Changes to This Policy">
            We may update this Privacy Policy from time to time. Changes will be posted on this page
            with an updated effective date.
          </Section>

          <Section title="11. Contact Us">
            If you have questions about this Privacy Policy, please contact us at:
            <p className="mt-2">
              Platos Pro LLC<br />
              1478 E Mission Blvd Unit 5<br />
              Pomona, CA 91766<br />
              Email: <a href="mailto:info@sultanofswing.com" className="text-orange-500 hover:underline">info@sultanofswing.com</a>
            </p>
          </Section>
        </div>
      </div>
    </div>
  )
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section>
      <h2 style={{ fontFamily: 'Oswald, sans-serif' }} className="text-lg text-orange-500 tracking-wider uppercase mb-3">
        {title}
      </h2>
      <div>{children}</div>
    </section>
  )
}
