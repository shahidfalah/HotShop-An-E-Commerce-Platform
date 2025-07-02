// src/app/privacy/page.tsx - Privacy Policy Template
import React from 'react';
import { ShieldCheck, Info, User, Lock, Share2, Scale, Mail } from 'lucide-react'; // Added more icons for sections

export default function PrivacyPolicyPage() {
  return (
    <div className="container mx-auto px-4 py-12 text-(--color-font) min-h-[calc(100vh-64px)] flex flex-col items-center">
      {/* Header Section */}
      <div className="text-center mb-10 p-6 bg-gradient-to-br from-(--color-primary) to-(--color-primary-hover) text-white rounded-xl shadow-lg max-w-3xl w-full">
        <ShieldCheck className="w-20 h-20 mx-auto mb-4 text-white" />
        <h1 className="text-4xl font-bold mb-3">Understanding Our Privacy Policy</h1>
        <p className="text-lg opacity-90">
          Welcome to our privacy policy template! This page is designed to show you the kinds of
          information a real privacy policy would contain. For a learning project like ours,
          it&apos;s a simplified version, but it covers the main points you&apos;d typically see.
        </p>
      </div>

      {/* Main Content Sections */}
      <div className="w-full max-w-4xl space-y-12"> {/* Increased space between sections */}

        {/* Section 1: What Information We Collect */}
        <div className="p-8 bg-white rounded-xl shadow-md border border-gray-200">
          <h2 className="text-3xl font-bold text-gray-800 mb-6 flex items-center justify-center md:justify-start gap-3">
            <Info className="w-8 h-8 text-(--color-primary)" /> 1. What Information We Collect
          </h2>
          <p className="text-lg text-gray-700 mb-6 leading-relaxed">
            In a real application, this section would detail *exactly* what kind of personal
            and non-personal data is collected. For example:
          </p>
          <ul className="list-none space-y-6"> {/* Changed to list-none for custom bullet styling */}
            <li>
              <h3 className="text-xl font-semibold text-gray-800 mb-2 flex items-center gap-2">
                <User className="w-5 h-5 text-(--color-primary)" /> Personal Data <span className="text-gray-500 text-sm italic">(e.g., when you create an account or make a purchase):</span>
              </h3>
              <ul className="list-disc list-inside text-gray-700 ml-6 space-y-2">
                <li>Your Name: <span className="text-gray-500 text-sm italic">(e.g., for shipping, account identification)</span></li>
                <li>Email Address: <span className="text-gray-500 text-sm italic">(e.g., for login, order confirmations, marketing if opted-in)</span></li>
                <li>Shipping Address: <span className="text-gray-500 text-sm italic">(e.g., for delivering products)</span></li>
                <li>Payment Information: <span className="text-gray-500 text-sm italic">(e.g., credit card details, but usually handled by a secure third-party payment processor like Stripe or PayPal, not stored directly by the site)</span></li>
                <li>Phone Number: <span className="text-gray-500 text-sm italic">(e.g., for delivery updates, customer service)</span></li>
              </ul>
            </li>
            <li>
              <h3 className="text-xl font-semibold text-gray-800 mb-2 flex items-center gap-2">
                <Scale className="w-5 h-5 text-(--color-primary)" /> Usage Data <span className="text-gray-500 text-sm italic">(collected automatically as you use the site):</span>
              </h3>
              <ul className="list-disc list-inside text-gray-700 ml-6 space-y-2">
                <li>IP Address: <span className="text-gray-500 text-sm italic">(e.g., for security, analytics)</span></li>
                <li>Browser Type and Operating System: <span className="text-gray-500 text-sm italic">(e.g., for compatibility, analytics)</span></li>
                <li>Pages Visited and Time Spent: <span className="text-gray-500 text-sm italic">(e.g., for understanding user behavior, improving content)</span></li>
                <li>Device Information: <span className="text-gray-500 text-sm italic">(e.g., mobile, desktop, tablet)</span></li>
              </ul>
            </li>
            <li>
              <h3 className="text-xl font-semibold text-gray-800 mb-2 flex items-center gap-2">
                <Lock className="w-5 h-5 text-(--color-primary)" /> Cookies and Tracking Technologies:
              </h3>
              <span className="text-gray-500 text-sm italic ml-7">(e.g., details about what cookies are used, why, and how users can manage them. This is often a dedicated section in a real policy.)</span>
            </li>
          </ul>
        </div>

        {/* Section 2: How We Use Your Information */}
        <div className="p-8 bg-gray-50 rounded-xl shadow-md border border-gray-200">
          <h2 className="text-3xl font-bold text-gray-800 mb-6 flex items-center justify-center md:justify-start gap-3">
            <Info className="w-8 h-8 text-(--color-primary)" /> 2. How We Use Your Information
          </h2>
          <p className="text-lg text-gray-700 mb-4 leading-relaxed">
            This section would explain the purposes for which the collected data is used. Common reasons include:
          </p>
          <ul className="list-disc list-inside text-gray-700 ml-4 space-y-2">
            <li>To provide and maintain our service (e.g., process orders, manage accounts).</li>
            <li>To improve, personalize, and expand our service (e.g., analyze trends, develop new features).</li>
            <li>To communicate with you (e.g., send order updates, respond to inquiries).</li>
            <li>For security and fraud prevention.</li>
            <li>For marketing and advertising (if applicable and with user consent).</li>
          </ul>
        </div>

        {/* Section 3: How Your Information Might Be Shared */}
        <div className="p-8 bg-white rounded-xl shadow-md border border-gray-200">
          <h2 className="text-3xl font-bold text-gray-800 mb-6 flex items-center justify-center md:justify-start gap-3">
            <Share2 className="w-8 h-8 text-(--color-primary)" /> 3. How Your Information Might Be Shared
          </h2>
          <p className="text-lg text-gray-700 mb-4 leading-relaxed">
            Here, a real policy would list the categories of third parties with whom data might be shared, and why:
          </p>
          <ul className="list-disc list-inside text-gray-700 ml-4 space-y-2">
            <li>
              **Service Providers:** <span className="text-gray-500 text-sm italic">(e.g., payment processors, shipping companies, cloud hosting, analytics providers)</span>
            </li>
            <li>
              **Legal Requirements:** <span className="text-gray-500 text-sm italic">(e.g., responding to subpoenas, protecting rights)</span>
            </li>
            <li>
              **Business Transfers:** <span className="text-gray-500 text-sm italic">(e.g., in case of a merger, acquisition)</span>
            </li>
            <li>
              **With Your Consent:** <span className="text-gray-500 text-sm italic">(e.g., sharing with a partner if you agree)</span>
            </li>
          </ul>
        </div>

        {/* Section 4: Your Privacy Rights */}
        <div className="p-8 bg-gray-50 rounded-xl shadow-md border border-gray-200">
          <h2 className="text-3xl font-bold text-gray-800 mb-6 flex items-center justify-center md:justify-start gap-3">
            <User className="w-8 h-8 text-(--color-primary)" /> 4. Your Privacy Rights
          </h2>
          <p className="text-gray-700 mb-4 leading-relaxed">
            This section would inform users about their rights regarding their data, such as:
          </p>
          <ul className="list-disc list-inside text-gray-700 ml-4 space-y-2">
            <li>The right to access their personal data.</li>
            <li>The right to correct inaccurate data.</li>
            <li>The right to request deletion of data.</li>
            <li>The right to object to data processing.</li>
            <li>The right to withdraw consent.</li>
            <li><span className="text-gray-500 text-sm italic">(Mention specific regulations like GDPR, CCPA if applicable)</span></li>
          </ul>
        </div>

        {/* Section 5: Data Security */}
        <div className="p-8 bg-white rounded-xl shadow-md border border-gray-200">
          <h2 className="text-3xl font-bold text-gray-800 mt-8 mb-4 flex items-center justify-center md:justify-start gap-3">
            <Lock className="w-8 h-8 text-(--color-primary)" /> 5. Data Security
          </h2>
          <p className="text-gray-700 mb-4 leading-relaxed">
            A real policy would describe the security measures taken to protect data (e.g., encryption, access controls).
            While no method is 100% secure, commitment to security is key.
          </p>
        </div>

        {/* Section 6: Changes to This Policy */}
        <div className="p-8 bg-gray-50 rounded-xl shadow-md border border-gray-200">
          <h2 className="text-3xl font-bold text-gray-800 mt-8 mb-4 flex items-center justify-center md:justify-start gap-3">
            <Info className="w-8 h-8 text-(--color-primary)" /> 6. Changes to This Policy
          </h2>
          <p className="text-gray-700 mb-4 leading-relaxed">
            Policies can change! This section would state how users will be notified of updates.
          </p>
        </div>

        {/* Section 7: Contact Us */}
        <div className="p-8 bg-white rounded-xl shadow-md border border-gray-200 text-center">
          <h2 className="text-3xl font-bold text-gray-800 mt-8 mb-4 flex items-center justify-center gap-3">
            <Mail className="w-8 h-8 text-(--color-primary)" /> 7. Contact Us
          </h2>
          <p className="text-gray-700 mb-4 leading-relaxed max-w-2xl mx-auto">
            For questions about this policy, users should contact:
          </p>
          <p className="text-gray-700 mb-8">
            <a
              href="mailto:support@hotshop.com"
              className="text-(--color-primary) hover:text-(--color-primary-hover) font-medium transition-colors text-lg"
            >
              support@hotshop.com
            </a>
            <br/>
            <span className="text-gray-500 text-sm italic">(Or provide a physical address, phone number, or contact form link)</span>
          </p>
        </div>
      </div>

      {/* Footer Note */}
      <div className="mt-12 pt-6 border-t border-gray-200 text-center w-full max-w-4xl">
        <p className="text-sm text-gray-500 mb-2">
          Last updated: {new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}
        </p>
        <p className="text-md text-gray-600 font-semibold p-3 bg-yellow-50 rounded-lg border border-yellow-200 shadow-sm">
          <span className="font-extrabold text-yellow-700">Important Note:</span> This is a template for educational purposes and should not be used as a legal document. Always consult legal professionals for actual privacy policies.
        </p>
      </div>
    </div>
  );
}
