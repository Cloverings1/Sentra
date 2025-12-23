import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';

export const TermsPage = () => {
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
          <h1 className="text-[42px] font-semibold tracking-[-0.02em] leading-tight">Terms of Service</h1>
          <p className="text-[14px] text-[#6F6F6F] mt-4">Last updated: December 23, 2025</p>
        </header>

        <div className="space-y-12 text-[15px] leading-relaxed text-[#A0A0A0]">
          <section>
            <h2 className="text-[20px] font-medium text-[#F5F5F5] mb-4">Agreement to Terms</h2>
            <p>
              By accessing or using the Habits application (the "Service") operated by ATXCopy LLC ("ATXCopy," "we," "us," or "our"), a company based in Austin, Texas, you agree to be bound by these Terms of Service ("Terms"). If you do not agree to these Terms, you may not access or use the Service.
            </p>
          </section>

          <section>
            <h2 className="text-[20px] font-medium text-[#F5F5F5] mb-4">Use of the Service</h2>
            <p className="mb-4">You agree to use the Service only for lawful purposes and in accordance with these Terms. You agree not to:</p>
            <ul className="list-disc list-inside space-y-2 ml-4">
              <li>Use the Service in any way that violates any applicable law or regulation</li>
              <li>Attempt to interfere with the proper working of the Service</li>
              <li>Attempt to access any portion of the Service that you are not authorized to access</li>
              <li>Use the Service to transmit any malicious code or harmful content</li>
              <li>Impersonate any person or entity or misrepresent your affiliation</li>
            </ul>
          </section>

          <section>
            <h2 className="text-[20px] font-medium text-[#F5F5F5] mb-4">Account Registration</h2>
            <p>
              To use certain features of the Service, you must create an account. You are responsible for maintaining the confidentiality of your account credentials and for all activities that occur under your account. You agree to provide accurate, current, and complete information during registration and to update such information as necessary.
            </p>
          </section>

          <section className="p-6 rounded-xl border border-[#E85D4F]/30" style={{ background: 'rgba(232, 93, 79, 0.05)' }}>
            <h2 className="text-[20px] font-medium text-[#F5F5F5] mb-4">Payment Terms & No Refund Policy</h2>
            <p className="mb-4">
              <strong className="text-[#F5F5F5]">ALL PAYMENTS ARE FINAL AND NON-REFUNDABLE.</strong> By subscribing to any paid plan, you acknowledge and agree that:
            </p>
            <ul className="list-disc list-inside space-y-2 ml-4">
              <li>No refunds will be issued under any circumstances, including but not limited to dissatisfaction with the Service, accidental purchases, or unused subscription time</li>
              <li>The Service requires significant server infrastructure, computing resources, and ongoing operational costs that are incurred immediately upon subscription</li>
              <li>Subscription fees are charged in advance and are non-refundable regardless of actual usage</li>
              <li>You are responsible for canceling your subscription before renewal to avoid future charges</li>
              <li>Chargebacks or payment disputes may result in immediate account termination</li>
            </ul>
          </section>

          <section className="p-6 rounded-xl border border-[#E85D4F]/30" style={{ background: 'rgba(232, 93, 79, 0.05)' }}>
            <h2 className="text-[20px] font-medium text-[#F5F5F5] mb-4">Account Termination</h2>
            <p>
              <strong className="text-[#F5F5F5]">ATXCopy reserves the absolute right to suspend or terminate your account at any time, for any reason, with or without notice, and without any obligation to provide a refund.</strong> This includes, but is not limited to, violations of these Terms, suspicious activity, or at our sole discretion. Upon termination, your right to use the Service will immediately cease. We shall not be liable to you or any third party for any termination of your access to the Service.
            </p>
          </section>

          <section className="p-6 rounded-xl border border-[#E85D4F]/30" style={{ background: 'rgba(232, 93, 79, 0.05)' }}>
            <h2 className="text-[20px] font-medium text-[#F5F5F5] mb-4">Waiver of Right to Sue & Dispute Resolution</h2>
            <p className="mb-4">
              <strong className="text-[#F5F5F5]">BY USING THIS SERVICE, YOU EXPRESSLY WAIVE YOUR RIGHT TO SUE ATXCOPY LLC, ITS OWNERS, OFFICERS, DIRECTORS, EMPLOYEES, AGENTS, AND AFFILIATES.</strong>
            </p>
            <p className="mb-4">You agree that:</p>
            <ul className="list-disc list-inside space-y-2 ml-4">
              <li>Any disputes arising from or relating to the Service shall be resolved through binding arbitration in Austin, Texas</li>
              <li>You waive any right to participate in class action lawsuits or class-wide arbitration</li>
              <li>You release ATXCopy from any and all claims, demands, and damages of every kind, known or unknown</li>
              <li>The maximum liability of ATXCopy for any claim shall not exceed the amount you paid for the Service in the 12 months preceding the claim</li>
            </ul>
          </section>

          <section>
            <h2 className="text-[20px] font-medium text-[#F5F5F5] mb-4">Technical & Billing Support</h2>
            <p>
              You acknowledge and agree that ATXCopy will address any technical issues, billing concerns, or support requests within a reasonable timeframe. "Reasonable" shall be determined at the sole discretion of ATXCopy based on the nature and complexity of the issue. We are not obligated to provide 24/7 support or immediate resolution of issues.
            </p>
          </section>

          <section>
            <h2 className="text-[20px] font-medium text-[#F5F5F5] mb-4">Intellectual Property</h2>
            <p>
              The Service and its original content, features, and functionality are owned by ATXCopy and are protected by international copyright, trademark, patent, trade secret, and other intellectual property laws. You may not copy, modify, distribute, sell, or lease any part of the Service without our prior written consent.
            </p>
          </section>

          <section>
            <h2 className="text-[20px] font-medium text-[#F5F5F5] mb-4">Disclaimer of Warranties</h2>
            <p>
              THE SERVICE IS PROVIDED "AS IS" AND "AS AVAILABLE" WITHOUT WARRANTIES OF ANY KIND, EITHER EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO IMPLIED WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE, AND NON-INFRINGEMENT. ATXCOPY DOES NOT WARRANT THAT THE SERVICE WILL BE UNINTERRUPTED, SECURE, OR ERROR-FREE.
            </p>
          </section>

          <section>
            <h2 className="text-[20px] font-medium text-[#F5F5F5] mb-4">Limitation of Liability</h2>
            <p>
              IN NO EVENT SHALL ATXCOPY, ITS OFFICERS, DIRECTORS, EMPLOYEES, OR AGENTS BE LIABLE FOR ANY INDIRECT, INCIDENTAL, SPECIAL, CONSEQUENTIAL, OR PUNITIVE DAMAGES, INCLUDING WITHOUT LIMITATION LOSS OF PROFITS, DATA, USE, GOODWILL, OR OTHER INTANGIBLE LOSSES, RESULTING FROM YOUR ACCESS TO OR USE OF OR INABILITY TO ACCESS OR USE THE SERVICE.
            </p>
          </section>

          <section>
            <h2 className="text-[20px] font-medium text-[#F5F5F5] mb-4">Indemnification</h2>
            <p>
              You agree to defend, indemnify, and hold harmless ATXCopy and its officers, directors, employees, and agents from and against any claims, liabilities, damages, judgments, awards, losses, costs, expenses, or fees arising out of or relating to your violation of these Terms or your use of the Service.
            </p>
          </section>

          <section>
            <h2 className="text-[20px] font-medium text-[#F5F5F5] mb-4">Governing Law</h2>
            <p>
              These Terms shall be governed by and construed in accordance with the laws of the State of Texas, United States, without regard to its conflict of law provisions. Any legal action or proceeding relating to these Terms shall be brought exclusively in the state or federal courts located in Travis County, Texas.
            </p>
          </section>

          <section>
            <h2 className="text-[20px] font-medium text-[#F5F5F5] mb-4">Severability</h2>
            <p>
              If any provision of these Terms is held to be invalid or unenforceable, such provision shall be struck and the remaining provisions shall be enforced to the fullest extent under law.
            </p>
          </section>

          <section>
            <h2 className="text-[20px] font-medium text-[#F5F5F5] mb-4">Changes to Terms</h2>
            <p>
              We reserve the right to modify these Terms at any time. We will provide notice of any material changes by posting the new Terms on this page. Your continued use of the Service following the posting of revised Terms constitutes your acceptance of such changes.
            </p>
          </section>

          <section>
            <h2 className="text-[20px] font-medium text-[#F5F5F5] mb-4">Contact Us</h2>
            <p>
              If you have any questions about these Terms, please contact us at:
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
