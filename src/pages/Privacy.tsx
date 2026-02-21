import { motion } from "framer-motion";
import { ArrowLeft } from "lucide-react";
import { Link } from "react-router-dom";

const Privacy = () => {
  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border">
        <div className="max-w-4xl mx-auto px-6 py-6 flex items-center gap-4">
          <Link 
            to="/" 
            className="inline-flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Home
          </Link>
        </div>
      </header>

      {/* Content */}
      <main className="max-w-4xl mx-auto px-6 py-16">
        <motion.article
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="prose prose-invert max-w-none"
        >
          <h1 className="text-4xl font-bold text-foreground mb-2">Privacy Policy</h1>
          <p className="text-muted-foreground mb-8">Last updated: February 2026</p>

          <section className="space-y-6 text-muted-foreground">
            <div>
              <h2 className="text-xl font-semibold text-foreground mb-3">1. Introduction</h2>
              <p>
                SITA OS ("we," "our," or "us") is committed to protecting your privacy. This Privacy Policy explains how we collect, use, disclose, and safeguard your information when you visit our website and use our services.
              </p>
            </div>

            <div>
              <h2 className="text-xl font-semibold text-foreground mb-3">2. Information We Collect</h2>
              <p className="mb-3">We may collect information about you in a variety of ways, including:</p>
              <ul className="list-disc list-inside space-y-2 ml-4">
                <li><strong>Personal Data:</strong> Email address, name, and other contact information you provide when joining our waitlist or registering interest.</li>
                <li><strong>Usage Data:</strong> Information about how you use our website, including IP address, browser type, and pages visited.</li>
                <li><strong>Investment Interest:</strong> If you express interest as an investor, we collect relevant professional information.</li>
              </ul>
            </div>

            <div>
              <h2 className="text-xl font-semibold text-foreground mb-3">3. How We Use Your Information</h2>
              <p className="mb-3">We use the information we collect to:</p>
              <ul className="list-disc list-inside space-y-2 ml-4">
                <li>Communicate with you about our products and services</li>
                <li>Send you updates about SITA OS development and launch</li>
                <li>Process your waitlist registration or backer commitment</li>
                <li>Improve our website and services</li>
                <li>Respond to investor inquiries</li>
              </ul>
            </div>

            <div>
              <h2 className="text-xl font-semibold text-foreground mb-3">4. Data Security</h2>
              <p>
                We implement appropriate technical and organizational security measures to protect your personal information. However, no method of transmission over the Internet is 100% secure, and we cannot guarantee absolute security.
              </p>
            </div>

            <div>
              <h2 className="text-xl font-semibold text-foreground mb-3">5. Data Retention</h2>
              <p>
                We retain your personal information for as long as necessary to fulfill the purposes outlined in this Privacy Policy, unless a longer retention period is required or permitted by law.
              </p>
            </div>

            <div>
              <h2 className="text-xl font-semibold text-foreground mb-3">6. Your Rights</h2>
              <p className="mb-3">Depending on your location, you may have the following rights:</p>
              <ul className="list-disc list-inside space-y-2 ml-4">
                <li>Access to your personal data</li>
                <li>Correction of inaccurate data</li>
                <li>Deletion of your data</li>
                <li>Opt-out of marketing communications</li>
                <li>Data portability</li>
              </ul>
            </div>

            <div>
              <h2 className="text-xl font-semibold text-foreground mb-3">7. Cookies</h2>
              <p>
                We use cookies and similar tracking technologies to track activity on our website and improve your experience. You can instruct your browser to refuse all cookies or to indicate when a cookie is being sent.
              </p>
            </div>

            <div>
              <h2 className="text-xl font-semibold text-foreground mb-3">8. Third-Party Services</h2>
              <p>
                We may use third-party services that collect, monitor, and analyze data. These third parties have their own privacy policies addressing how they use such information.
              </p>
            </div>

            <div>
              <h2 className="text-xl font-semibold text-foreground mb-3">9. Changes to This Policy</h2>
              <p>
                We may update this Privacy Policy from time to time. We will notify you of any changes by posting the new Privacy Policy on this page and updating the "Last updated" date.
              </p>
            </div>

            <div>
              <h2 className="text-xl font-semibold text-foreground mb-3">10. Contact Us</h2>
              <p>
                If you have questions about this Privacy Policy, please contact us at privacy@sita-os.com.
              </p>
            </div>
          </section>
        </motion.article>
      </main>
    </div>
  );
};

export default Privacy;
