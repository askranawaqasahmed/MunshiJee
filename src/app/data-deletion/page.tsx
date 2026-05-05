import Link from "next/link";
import Image from "next/image";

export const metadata = {
  title: "Data Deletion Instructions | MunshiJee",
  description:
    "How to request deletion of your MunshiJee account and all associated personal data.",
};

export default function DataDeletionPage() {
  const lastUpdated = "May 6, 2026";
  const contactEmail = "hello@munshijee.com";

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
            <Link href="/privacy" className="text-sm text-gray-600 hover:text-gray-900">
              Privacy
            </Link>
            <Link href="/terms" className="text-sm text-gray-600 hover:text-gray-900">
              Terms
            </Link>
          </nav>
        </div>
      </header>

      <main className="mx-auto max-w-3xl px-4 py-12 md:py-16">
        <h1 className="text-4xl font-bold tracking-tight md:text-5xl">
          Data Deletion Instructions
        </h1>
        <p className="mt-3 text-sm text-gray-500">Last updated: {lastUpdated}</p>

        <div className="prose prose-gray mt-8 max-w-none">
          <p>
            MunshiJee respects your right to control your personal data. This
            page explains how to request deletion of your MunshiJee account and
            the personal information associated with it.
          </p>

          <h2 className="mt-10 text-2xl font-semibold">
            What gets deleted
          </h2>
          <p>When you submit a deletion request, we permanently remove:</p>
          <ul className="ml-6 list-disc space-y-2">
            <li>Your account and login credentials;</li>
            <li>Your business profile (name, contact details, branding settings);</li>
            <li>Your customer list and contact information;</li>
            <li>Invoices, payment records, and uploaded files;</li>
            <li>Usage logs and notification history (Email / SMS / WhatsApp);</li>
            <li>Any data received from Meta / Facebook Login (if you used social sign-in).</li>
          </ul>

          <h2 className="mt-10 text-2xl font-semibold">
            What we may retain
          </h2>
          <p>
            For tax, accounting, fraud-prevention, and legal-compliance reasons,
            we may retain a minimal subset of records (such as anonymised
            transaction summaries) for the period required by applicable law.
            These records do not contain your login credentials and are not used
            to identify you for any other purpose.
          </p>

          <h2 className="mt-10 text-2xl font-semibold">
            How to request deletion
          </h2>
          <p>You can request deletion in either of two ways:</p>

          <h3 className="mt-6 text-xl font-semibold">Option 1 — Email request</h3>
          <p>
            Send an email to{" "}
            <a
              href={`mailto:${contactEmail}?subject=Data%20Deletion%20Request`}
              className="text-primary underline"
            >
              {contactEmail}
            </a>{" "}
            from the email address registered on your MunshiJee account, with
            the subject line <strong>&quot;Data Deletion Request&quot;</strong>.
          </p>
          <p>Please include in the body:</p>
          <ul className="ml-6 list-disc space-y-2">
            <li>Your registered email address;</li>
            <li>Your business name (as shown in MunshiJee);</li>
            <li>A short confirmation that you want your account and data permanently deleted.</li>
          </ul>

          <h3 className="mt-6 text-xl font-semibold">Option 2 — In-app request</h3>
          <p>
            Log in to MunshiJee and contact support from your account.
            Authenticated requests are processed faster because we can verify
            ownership immediately.
          </p>

          <h2 className="mt-10 text-2xl font-semibold">
            Processing time
          </h2>
          <p>
            We will acknowledge your request within <strong>3 business days</strong> and
            complete the deletion within <strong>30 days</strong> of verification.
            Once your data is deleted, it cannot be recovered.
          </p>

          <h2 className="mt-10 text-2xl font-semibold">
            Facebook / Meta users
          </h2>
          <p>
            If you signed up using Facebook Login, you can also remove
            MunshiJee&apos;s access to your Facebook data at any time from your
            Facebook account settings:
          </p>
          <ol className="ml-6 list-decimal space-y-2">
            <li>Go to <strong>Settings &amp; Privacy</strong> → <strong>Settings</strong>.</li>
            <li>Open <strong>Apps and Websites</strong>.</li>
            <li>Find <strong>MunshiJee</strong> in the list and click <strong>Remove</strong>.</li>
          </ol>
          <p>
            Removing the app on Facebook revokes future access but does not
            delete data already stored on MunshiJee. To delete that data as
            well, please also follow Option 1 or Option 2 above.
          </p>

          <h2 className="mt-10 text-2xl font-semibold">
            Questions
          </h2>
          <p>
            For any questions about this process, contact us at{" "}
            <a
              href={`mailto:${contactEmail}`}
              className="text-primary underline"
            >
              {contactEmail}
            </a>
            . You can also review our{" "}
            <Link href="/privacy" className="text-primary underline">
              Privacy Policy
            </Link>{" "}
            for more information about how we handle your data.
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
