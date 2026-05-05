import Link from "next/link";
import Image from "next/image";

export const metadata = {
  title: "Privacy Policy | MunshiJee",
  description:
    "How MunshiJee collects, uses, stores, and protects your personal and business data.",
};

export default function PrivacyPolicyPage() {
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
              className="h-12 w-auto"
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
          Privacy Policy
        </h1>
        <p className="mt-3 text-sm text-gray-500">Last updated: {lastUpdated}</p>

        <div className="prose prose-gray mt-8 max-w-none">
          <p>
            MunshiJee (&quot;we&quot;, &quot;us&quot;, or &quot;our&quot;) is committed to protecting your
            privacy. This Privacy Policy explains how we collect, use, disclose, and
            safeguard your information when you use our invoicing platform and
            related services (the &quot;Service&quot;).
          </p>

          <h2 className="mt-10 text-2xl font-semibold">1. Information we collect</h2>
          <p>We collect the following categories of information:</p>
          <ul className="ml-6 list-disc space-y-2">
            <li>
              <strong>Account information:</strong> name, email address, phone number,
              business name, and password (stored as a bcrypt hash).
            </li>
            <li>
              <strong>Customer & invoice data:</strong> customer details, invoices,
              payment records, and any other content you upload or generate.
            </li>
            <li>
              <strong>Payment information:</strong> when you upgrade a paid plan or
              accept Easypaisa payments, transaction metadata is processed by our
              payment partners. We do not store full card numbers on our servers.
            </li>
            <li>
              <strong>Usage data:</strong> log entries, IP address, browser type,
              device information, and pages visited.
            </li>
          </ul>

          <h2 className="mt-10 text-2xl font-semibold">2. How we use your information</h2>
          <p>We use the information we collect to:</p>
          <ul className="ml-6 list-disc space-y-2">
            <li>Provide, operate, and maintain the Service;</li>
            <li>Send invoices, reminders, and notifications via Email, SMS, and WhatsApp on your behalf;</li>
            <li>Process subscription payments and Easypaisa transactions;</li>
            <li>Improve, personalise, and expand the Service;</li>
            <li>Detect and prevent fraud, abuse, and security incidents;</li>
            <li>Comply with applicable legal obligations.</li>
          </ul>

          <h2 className="mt-10 text-2xl font-semibold">3. Sharing of information</h2>
          <p>
            We do not sell your personal information. We share data only with trusted
            sub-processors who help us deliver the Service, including:
          </p>
          <ul className="ml-6 list-disc space-y-2">
            <li>Email delivery providers;</li>
            <li>SMS gateways;</li>
            <li>WhatsApp Business / Wati for WhatsApp delivery;</li>
            <li>Easypaisa for payment processing;</li>
            <li>Cloud hosting and database providers.</li>
          </ul>
          <p>
            We may also disclose information when required by law, to enforce our
            terms, or to protect the rights and safety of our users.
          </p>

          <h2 className="mt-10 text-2xl font-semibold">4. Data security</h2>
          <p>
            We use industry-standard safeguards to protect your data: passwords are
            hashed with bcrypt, sessions are signed with JWT, and every account is
            isolated so your customers and invoices are visible only to you. No
            method of transmission over the internet is 100% secure, but we
            continually work to maintain reasonable safeguards.
          </p>

          <h2 className="mt-10 text-2xl font-semibold">5. Data retention</h2>
          <p>
            We retain your data for as long as your account is active or as needed to
            provide the Service. You may request deletion of your account at any
            time; certain records (such as invoices) may be retained for tax,
            accounting, or legal compliance purposes.
          </p>

          <h2 className="mt-10 text-2xl font-semibold">6. Your rights</h2>
          <p>
            Subject to applicable law, you may have the right to access, correct,
            export, or delete your personal information. To exercise these rights,
            contact us at the email below.
          </p>

          <h2 className="mt-10 text-2xl font-semibold">7. Children&apos;s privacy</h2>
          <p>
            The Service is not intended for individuals under 18. We do not knowingly
            collect personal information from children.
          </p>

          <h2 className="mt-10 text-2xl font-semibold">8. Changes to this policy</h2>
          <p>
            We may update this Privacy Policy from time to time. The &quot;Last updated&quot;
            date at the top of this page indicates when it was last revised.
            Continued use of the Service after changes are posted constitutes
            acceptance of the updated policy.
          </p>

          <h2 className="mt-10 text-2xl font-semibold">9. Contact us</h2>
          <p>
            If you have questions about this Privacy Policy, please contact us at{" "}
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
              className="h-9 w-auto"
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
