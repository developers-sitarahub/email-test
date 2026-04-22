import React from 'react';
import Link from 'next/link';

export const metadata = {
  title: 'Privacy Policy — Mail by GPSERP',
  description: 'Privacy policy for Mail by GPSERP, an AI-powered email outreach tool.',
};

export default function PrivacyPolicy() {
  return (
    <div className="max-w-4xl mx-auto py-12 px-6">
      <div className="mb-8">
        <Link href="/" className="text-sm text-blue-600 hover:underline">← Back to Home</Link>
      </div>

      <h1 className="text-3xl font-bold mb-2">Privacy Policy</h1>
      <p className="mb-8 text-gray-500 text-sm">Last updated: April 22, 2025 &nbsp;|&nbsp; App: <strong>Mail by GPSERP</strong></p>

      <section className="mb-8">
        <h2 className="text-2xl font-semibold mb-4">1. Introduction</h2>
        <p className="mb-4">
          Welcome to <strong>Mail by GPSERP</strong> (<a href="https://email-gpserp.vercel.app" className="text-blue-600 hover:underline">https://email-gpserp.vercel.app</a>).
          We are committed to protecting your personal data. This policy explains how we collect, use, and safeguard information
          when you use our AI-powered email outreach platform.
        </p>
      </section>

      <section className="mb-8">
        <h2 className="text-2xl font-semibold mb-4">2. Data We Collect</h2>
        <p className="mb-4">
          When you sign in with Google, we collect and use only the following data:
        </p>
        <ul className="list-disc pl-6 space-y-2">
          <li><strong>Google Account Profile</strong>: your name, email address, and profile photo (from Google OAuth).</li>
          <li><strong>Gmail Send Permission</strong>: we request the <code>https://www.googleapis.com/auth/gmail.send</code> scope only, which allows us to send emails on your behalf. We do <em>not</em> read, access, or store your inbox messages.</li>
          <li><strong>Uploaded CSV Data</strong>: recipient names and email addresses you upload to generate personalized emails. This data is processed in memory and not stored on our servers.</li>
        </ul>
      </section>

      <section className="mb-8">
        <h2 className="text-2xl font-semibold mb-4">3. How We Use Your Data</h2>
        <ul className="list-disc pl-6 space-y-2">
          <li>To authenticate you via Google OAuth and maintain your session.</li>
          <li>To send emails you have composed and approved via your own Gmail account.</li>
          <li>To generate personalized email content using the AI model you select.</li>
        </ul>
        <p className="mt-4">
          We do <strong>not</strong> sell, rent, or share your data with third parties for advertising or marketing purposes.
        </p>
      </section>

      <section className="mb-8">
        <h2 className="text-2xl font-semibold mb-4">4. Google API Services — Limited Use Disclosure</h2>
        <p className="mb-4">
          <strong>Mail by GPSERP</strong>'s use and transfer of information received from Google APIs to any other app will adhere to the{' '}
          <a
            href="https://developers.google.com/terms/api-services-user-data-policy"
            className="text-blue-600 hover:underline"
            target="_blank"
            rel="noreferrer"
          >
            Google API Services User Data Policy
          </a>
          , including the <strong>Limited Use</strong> requirements.
        </p>
        <p>
          Specifically: data obtained from Google APIs is used only to provide the email-sending feature of this application,
          and is not used to develop, improve, or train generalized AI/ML models.
        </p>
      </section>

      <section className="mb-8">
        <h2 className="text-2xl font-semibold mb-4">5. Data Retention &amp; Security</h2>
        <p className="mb-4">
          OAuth tokens are stored securely in your browser session and are not persisted beyond your session unless you use
          the "Remember me" option. We do not store Gmail message content or recipient email bodies on our servers.
        </p>
      </section>

      <section className="mb-8">
        <h2 className="text-2xl font-semibold mb-4">6. Your Rights</h2>
        <p className="mb-4">
          You may revoke our application's access to your Google account at any time via your{' '}
          <a href="https://myaccount.google.com/permissions" className="text-blue-600 hover:underline" target="_blank" rel="noreferrer">
            Google Account permissions
          </a>. Upon revocation, we will no longer be able to send emails on your behalf.
        </p>
      </section>

      <section>
        <h2 className="text-2xl font-semibold mb-4">7. Contact Us</h2>
        <p className="mb-4">
          If you have any questions about this privacy policy, please contact us at{' '}
          <a href="mailto:support@gpserp.com" className="text-blue-600 hover:underline">support@gpserp.com</a>.
        </p>
      </section>

      <div className="mt-12 pt-6 border-t border-gray-200 text-sm text-gray-500">
        <Link href="/" className="hover:underline">Home</Link>
        {' · '}
        <Link href="/terms" className="hover:underline">Terms of Service</Link>
        {' · '}
        <strong>Mail by GPSERP</strong>
      </div>
    </div>
  );
}
