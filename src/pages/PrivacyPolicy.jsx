const PrivacyPolicy = () => {
  return (
    <div className="max-w-4xl mx-auto px-4 py-12">
      <h1 className="text-4xl font-bold mb-8">Privacy Policy</h1>
      
      <div className="space-y-6 text-gray-700">
        <p className="text-sm text-gray-500">Last updated: October 20, 2025</p>
        
        <section>
          <h2 className="text-2xl font-bold mb-4">1. Information We Collect</h2>
          <p className="mb-3">We collect information that you provide directly to us, including:</p>
          <ul className="list-disc list-inside space-y-2 ml-4">
            <li>Name and contact information (email, phone number)</li>
            <li>Shipping and billing address</li>
            <li>Payment information (processed securely by CAC Bank)</li>
            <li>Order history and preferences</li>
          </ul>
        </section>

        <section>
          <h2 className="text-2xl font-bold mb-4">2. How We Use Your Information</h2>
          <p className="mb-3">We use the information we collect to:</p>
          <ul className="list-disc list-inside space-y-2 ml-4">
            <li>Process and fulfill your orders</li>
            <li>Send you order confirmations and shipping updates</li>
            <li>Respond to your comments and questions</li>
            <li>Improve our products and services</li>
            <li>Detect and prevent fraud</li>
          </ul>
        </section>

        <section>
          <h2 className="text-2xl font-bold mb-4">3. Information Sharing</h2>
          <p className="mb-3">
            We do not sell, trade, or rent your personal information to third parties. 
            We may share your information with:
          </p>
          <ul className="list-disc list-inside space-y-2 ml-4">
            <li>Payment processors (CAC Bank) to process payments</li>
            <li>Shipping partners to deliver your orders</li>
            <li>Service providers who assist in operating our website</li>
          </ul>
        </section>

        <section>
          <h2 className="text-2xl font-bold mb-4">4. Data Security</h2>
          <p>
            We implement appropriate security measures to protect your personal information. 
            All payment transactions are encrypted and processed securely through CAC Bank's 
            payment gateway. We do not store your credit card information on our servers.
          </p>
        </section>

        <section>
          <h2 className="text-2xl font-bold mb-4">5. Cookies</h2>
          <p>
            We use cookies and similar technologies to enhance your browsing experience, 
            remember your preferences, and analyze site traffic. You can control cookies 
            through your browser settings.
          </p>
        </section>

        <section>
          <h2 className="text-2xl font-bold mb-4">6. Your Rights</h2>
          <p className="mb-3">You have the right to:</p>
          <ul className="list-disc list-inside space-y-2 ml-4">
            <li>Access your personal information</li>
            <li>Correct inaccurate data</li>
            <li>Request deletion of your data</li>
            <li>Opt-out of marketing communications</li>
          </ul>
        </section>

        <section>
          <h2 className="text-2xl font-bold mb-4">7. Contact Us</h2>
          <p className="mb-3">
            If you have any questions about this Privacy Policy, please contact us:
          </p>
          <ul className="space-y-1 ml-4">
            <li>Email: info@gabfashionhouse.dj</li>
            <li>Phone: +253 77 57 41 52</li>
            <li>WhatsApp: +253 77 57 41 52</li>
            <li>Address: Djibouti, East Africa</li>
          </ul>
        </section>

        <section>
          <h2 className="text-2xl font-bold mb-4">8. Changes to This Policy</h2>
          <p>
            We may update this Privacy Policy from time to time. We will notify you of any 
            changes by posting the new Privacy Policy on this page and updating the "Last updated" date.
          </p>
        </section>
      </div>
    </div>
  );
};

export default PrivacyPolicy;

