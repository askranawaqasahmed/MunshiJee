import Link from "next/link";
import Image from "next/image";

export const metadata = {
  title: "Terms of Service | MunshiJee",
  description:
    "The terms and conditions that govern your use of the MunshiJee invoicing platform.",
};

export default function TermsOfServicePage() {
  const lastUpdated = "May 6, 2026";

  return (
    <div className="min-h-screen bg-white text-gray-900">
      {/* Top nav */}
      <header className="sticky top-0 z-30 border-b bg-white/80 backdrop-blur">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-3">
          <Link href="/" className="flex items-center">
            <Image
              src="/logo-mark.png"
              alt="MunshiJee"
              width={400}
              height={160}
              priority
              className="h-16 w-auto"
            />
          </Link>
          <nav className="hidden items-center gap-6 md:flex">
            <Link href="/#features" className="text-sm text-gray-600 hover:text-gray-900">
              Features
            </Link>
            <Link href="/#pricing" className="text-sm text-gray-600 hover:text-gray-900">
              Pricing
            </Link>
            <Link href="/#faq" className="text-sm text-gray-600 hover:text-gray-900">
              FAQ
            </Link>
          </nav>
        </div>
      </header>

      <main className="mx-auto max-w-3xl px-4 py-12 md:py-16">
        <h1 className="text-4xl font-bold tracking-tight md:text-5xl">
          Terms of Service
        </h1>
        <p className="mt-3 text-sm text-gray-500">Last updated: {lastUpdated}</p>

        <div className="prose prose-gray mt-8 max-w-none">
          <p>
            Welcome to MunshiJee. These Terms of Service (&quot;Terms&quot;) govern your
            access to and use of the MunshiJee invoicing platform and related
            services (the &quot;Service&quot;) operated by MunshiJee (&quot;we&quot;, &quot;us&quot;, or
            &quot;our&quot;). By creating an account or using the Service, you agree to be
            bound by these Terms.
          </p>

          <h2 className="mt-10 text-2xl font-semibold">1. Eligibility & accounts</h2>
          <p>
            You must be at least 18 years old and able to form a legally binding
            contract to use the Service. You are responsible for maintaining the
            confidentiality of your login credentials and for all activity that
            occurs under your account.
          </p>

          <h2 className="mt-10 text-2xl font-semibold">2. Subscription plans & billing</h2>
          <ul className="ml-6 list-disc space-y-2">
            <li>
              The Service offers a Free plan and several paid plans. Plan limits
              (emails, SMS, WhatsApp messages) reset monthly.
            </li>
            <li>
              Paid plans are billed in advance on a monthly basis. Fees are
              non-refundable except where required by law.
            </li>
            <li>
              We may change pricing or plan features. Where required, we will give
              you reasonable notice before changes take effect.
            </li>
            <li>
              Failure to pay may result in suspension or termination of paid
              features.
            </li>
          </ul>

          <h2 className="mt-10 text-2xl font-semibold">3. Acceptable use</h2>
          <p>You agree not to use the Service to:</p>
          <ul className="ml-6 list-disc space-y-2">
            <li>Send spam, unsolicited commercial messages, or unlawful content;</li>
            <li>Violate any applicable law, regulation, or third-party right;</li>
            <li>Upload malicious code or attempt to disrupt the Service;</li>
            <li>Reverse-engineer, copy, or resell the Service;</li>
            <li>Misuse Email, SMS, or WhatsApp messaging in violation of provider policies (including WhatsApp Business / Wati policies).</li>
          </ul>
          <p>
            We may suspend or terminate accounts that violate these rules without
            notice.
          </p>

          <h2 className="mt-10 text-2xl font-semibold">4. Your content</h2>
          <p>
            You retain ownership of all data you upload — customers, invoices,
            payments, and any other content (&quot;Your Content&quot;). You grant us a
            limited licence to host, process, and transmit Your Content solely to
            operate the Service on your behalf. You are solely responsible for the
            accuracy and legality of Your Content.
          </p>

          <h2 className="mt-10 text-2xl font-semibold">5. Payments via Easypaisa</h2>
          <p>
            If you accept payments through Easypaisa (MA / OTC) using the Service,
            those transactions are processed by Easypaisa under their own terms.
            We are not a party to the underlying transaction between you and your
            customer and are not responsible for refunds, chargebacks, or
            settlement disputes.
          </p>

          <h2 className="mt-10 text-2xl font-semibold">6. Third-party services</h2>
          <p>
            The Service integrates with third-party providers (email gateways, SMS
            gateways, WhatsApp Business / Wati, Easypaisa, hosting providers).
            Your use of those integrations may also be subject to their respective
            terms.
          </p>

          <h2 className="mt-10 text-2xl font-semibold">7. Service availability</h2>
          <p>
            We aim for high availability but do not guarantee uninterrupted or
            error-free operation. We may modify, suspend, or discontinue any part
            of the Service at any time, and will use reasonable efforts to provide
            notice of material changes.
          </p>

          <h2 className="mt-10 text-2xl font-semibold">8. Termination</h2>
          <p>
            You may stop using the Service or close your account at any time. We
            may suspend or terminate your access if you breach these Terms, fail
            to pay, or use the Service in a way that risks harm to us or other
            users. On termination, your right to use the Service ends immediately;
            certain provisions (such as limitations of liability) survive
            termination.
          </p>

          <h2 className="mt-10 text-2xl font-semibold">9. Disclaimers</h2>
          <p>
            The Service is provided &quot;as is&quot; and &quot;as available&quot; without warranties
            of any kind, whether express or implied, including but not limited to
            implied warranties of merchantability, fitness for a particular
            purpose, and non-infringement.
          </p>

          <h2 className="mt-10 text-2xl font-semibold">10. Limitation of liability</h2>
          <p>
            To the maximum extent permitted by law, MunshiJee and its affiliates
            will not be liable for any indirect, incidental, special,
            consequential, or punitive damages, or any loss of profits, revenue,
            or data, arising out of or in connection with your use of the Service.
            Our total aggregate liability for any claim under these Terms is
            limited to the amount you paid us for the Service in the twelve months
            preceding the claim.
          </p>

          <h2 className="mt-10 text-2xl font-semibold">11. Indemnification</h2>
          <p>
            You agree to indemnify and hold MunshiJee harmless from any claims,
            losses, or damages (including legal fees) arising out of Your Content,
            your use of the Service, or your violation of these Terms or
            applicable law.
          </p>

          <h2 className="mt-10 text-2xl font-semibold">12. Governing law</h2>
          <p>
            These Terms are governed by the laws of the Islamic Republic of
            Pakistan, without regard to its conflict-of-law principles. Disputes
            will be resolved in the competent courts of Pakistan.
          </p>

          <h2 className="mt-10 text-2xl font-semibold">13. Changes to these terms</h2>
          <p>
            We may update these Terms from time to time. The &quot;Last updated&quot; date
            at the top of this page indicates when they were last revised.
            Continued use of the Service after changes are posted constitutes
            acceptance of the updated Terms.
          </p>

          <h2 className="mt-10 text-2xl font-semibold">14. Contact</h2>
          <p>
            For questions about these Terms, contact us at{" "}
            <a
              href="mailto:hello@munshijee.com"
              className="text-primary underline"
            >
              hello@munshijee.com
            </a>
            .
          </p>
        </div>

        <div className="mt-12 border-t pt-6 text-sm text-gray-600">
          <Link href="/" className="hover:text-gray-900">
            ← Back to home
          </Link>
        </div>
      </main>

      <footer className="border-t bg-white py-10">
        <div className="mx-auto flex max-w-6xl flex-col items-center justify-between gap-4 px-4 md:flex-row">
          <div className="flex items-center gap-3">
            <Image
              src="/logo-mark.png"
              alt="MunshiJee"
              width={300}
              height={120}
              className="h-12 w-auto"
            />
            <span className="text-sm text-gray-500">
              © {new Date().getFullYear()}
            </span>
          </div>
          <div className="flex items-center gap-6 text-sm text-gray-600">
            <Link href="/privacy" className="hover:text-gray-900">
              Privacy Policy
            </Link>
            <Link href="/terms" className="hover:text-gray-900">
              Terms of Service
            </Link>
            <Link href="/data-deletion" className="hover:text-gray-900">
              Data Deletion
            </Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
