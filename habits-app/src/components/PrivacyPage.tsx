import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';

export const PrivacyPage = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-[#0B0B0B] text-[#F5F5F5] selection:bg-[#E85D4F]/30">
      {/* Navigation */}
      <nav className="max-w-[800px] mx-auto px-6 py-10 flex justify-between items-center">
        <button
          onClick={() => navigate('/')}
          className="text-[18px] font-semibold tracking-[-0.01em] hover:opacity-80 transition-opacity"
        >
          Habits
        </button>
        <button
          onClick={() => navigate(-1)}
          className="text-[14px] text-[#A0A0A0] hover:text-[#F5F5F5] transition-colors"
        >
          Back
        </button>
      </nav>

      {/* Content */}
      <motion.main
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
        className="max-w-[800px] mx-auto px-6 pb-24"
      >
        <header className="mb-16">
          <p className="text-[12px] uppercase tracking-[0.1em] text-[#6F6F6F] mb-4">Legal</p>
          <h1 className="text-[42px] font-semibold tracking-[-0.02em] leading-tight">Privacy Policy</h1>
          <p className="text-[14px] text-[#6F6F6F] mt-4">Last updated: December 23, 2025</p>
        </header>

        <div className="space-y-12 text-[15px] leading-relaxed text-[#A0A0A0]">
          <section>
            <h2 className="text-[20px] font-medium text-[#F5F5F5] mb-4">Overview</h2>
            <p>
              ATXCopy LLC ("ATXCopy," "we," "us," or "our"), a company based in Austin, Texas, operates the Habits application (the "Service"). This Privacy Policy explains how we collect, use, disclose, and safeguard your information when you use our Service.
            </p>
          </section>

          <section>
            <h2 className="text-[20px] font-medium text-[#F5F5F5] mb-4">Information We Collect</h2>
            <p className="mb-4">We collect information you provide directly to us, including:</p>
            <ul className="list-disc list-inside space-y-2 ml-4">
              <li>Account information (email address, password)</li>
              <li>Profile information (display name, avatar)</li>
              <li>Habit data (habit names, completion records, streak information)</li>
              <li>Usage data (app interactions, feature usage patterns)</li>
              <li>Payment information (processed securely through Stripe)</li>
            </ul>
          </section>

          <section>
            <h2 className="text-[20px] font-medium text-[#F5F5F5] mb-4">How We Use Your Information</h2>
            <p className="mb-4">We use the information we collect to:</p>
            <ul className="list-disc list-inside space-y-2 ml-4">
              <li>Provide, maintain, and improve the Service</li>
              <li>Process transactions and send related information</li>
              <li>Send technical notices, updates, and support messages</li>
              <li>Respond to your comments and questions</li>
              <li>Analyze usage patterns to improve user experience</li>
              <li>Protect against fraudulent or illegal activity</li>
            </ul>
          </section>

          <section>
            <h2 className="text-[20px] font-medium text-[#F5F5F5] mb-4">Data Security</h2>
            <p>
              We implement industry-standard security measures to protect your personal information. Your data is encrypted in transit and at rest. We use row-level security (RLS) to ensure complete data isolation between users. However, no method of transmission over the Internet or electronic storage is 100% secure, and we cannot guarantee absolute security.
            </p>
          </section>

          <section>
            <h2 className="text-[20px] font-medium text-[#F5F5F5] mb-4">Data Retention</h2>
            <p>
              We retain your personal information for as long as your account is active or as needed to provide you services. If you wish to cancel your account or request that we no longer use your information, please contact us. We will retain and use your information as necessary to comply with our legal obligations, resolve disputes, and enforce our agreements.
            </p>
          </section>

          <section>
            <h2 className="text-[20px] font-medium text-[#F5F5F5] mb-4">Third-Party Services</h2>
            <p className="mb-4">We use the following third-party services:</p>
            <ul className="list-disc list-inside space-y-2 ml-4">
              <li><strong>Supabase</strong> - Database and authentication services</li>
              <li><strong>Stripe</strong> - Payment processing</li>
            </ul>
            <p className="mt-4">
              These services have their own privacy policies governing the use of your information.
            </p>
          </section>

          <section>
            <h2 className="text-[20px] font-medium text-[#F5F5F5] mb-4">Your Rights</h2>
            <p className="mb-4">You have the right to:</p>
            <ul className="list-disc list-inside space-y-2 ml-4">
              <li>Access the personal information we hold about you</li>
              <li>Request correction of inaccurate data</li>
              <li>Request deletion of your data</li>
              <li>Export your data in a portable format</li>
              <li>Opt out of marketing communications</li>
            </ul>
          </section>

          <section>
            <h2 className="text-[20px] font-medium text-[#F5F5F5] mb-4">Children's Privacy</h2>
            <p>
              The Service is not intended for children under 13 years of age. We do not knowingly collect personal information from children under 13. If we discover that a child under 13 has provided us with personal information, we will delete such information from our servers.
            </p>
          </section>

          <section>
            <h2 className="text-[20px] font-medium text-[#F5F5F5] mb-4">Changes to This Policy</h2>
            <p>
              We may update this Privacy Policy from time to time. We will notify you of any changes by posting the new Privacy Policy on this page and updating the "Last updated" date. Your continued use of the Service after any modifications indicates your acceptance of the updated Privacy Policy.
            </p>
          </section>

          <section>
            <h2 className="text-[20px] font-medium text-[#F5F5F5] mb-4">Contact Us</h2>
            <p>
              If you have any questions about this Privacy Policy, please contact us at:
            </p>
            <div className="mt-4 p-6 rounded-xl" style={{ background: 'rgba(255, 255, 255, 0.04)' }}>
              <p className="text-[#F5F5F5] font-medium">ATXCopy LLC</p>
              <p>Austin, Texas</p>
              <p className="mt-2">hello@atxcopy.com</p>
            </div>
          </section>
        </div>
      </motion.main>
    </div>
  );
};
