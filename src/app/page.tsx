import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  FileText,
  FileDown,
  Bell,
  Users,
  CreditCard,
  BarChart3,
  Check,
  ArrowRight,
  Receipt,
  Sparkles,
} from "lucide-react";

export const dynamic = "force-dynamic";

const PLAN_ORDER: Record<string, number> = {
  FREE: 0,
  STARTER: 1,
  GROWTH: 2,
  PROFESSIONAL: 3,
  ENTERPRISE: 4,
};

const FEATURES = [
  {
    icon: FileText,
    title: "Smart invoicing",
    description:
      "Create one-time, recurring, and bulk invoices in seconds. Track every status from draft to paid.",
  },
  {
    icon: FileDown,
    title: "Branded PDFs",
    description:
      "Download polished, branded invoice PDFs and share them with customers via secure links.",
  },
  {
    icon: Bell,
    title: "Multi-channel notifications",
    description:
      "Reach customers where they are — Email, SMS, and WhatsApp delivery built in.",
  },
  {
    icon: Users,
    title: "Customer management",
    description:
      "Maintain a clean customer list with bulk Excel import and per-customer activity history.",
  },
  {
    icon: CreditCard,
    title: "Payments & Easypaisa",
    description:
      "Track every payment manually or via Easypaisa MA / OTC checkout — no spreadsheets needed.",
  },
  {
    icon: BarChart3,
    title: "Reporting dashboard",
    description:
      "See revenue, pending balances, and growth at a glance with a clean, real-time dashboard.",
  },
];

const STEPS = [
  {
    number: "1",
    title: "Sign up free",
    description:
      "Create your account in under a minute — no credit card required. Free plan included.",
  },
  {
    number: "2",
    title: "Add your customers",
    description:
      "Import via Excel or add them one-by-one. Build your customer list once, reuse forever.",
  },
  {
    number: "3",
    title: "Send invoices, get paid",
    description:
      "Generate professional invoices, send via Email/SMS/WhatsApp, and track payments in one place.",
  },
];

const FAQS = [
  {
    q: "Is there a free plan?",
    a: "Yes — every new account starts on the Free plan, which includes 10 emails and 10 WhatsApp notifications per month. No credit card required.",
  },
  {
    q: "Can I send invoices via WhatsApp and SMS?",
    a: "Yes. Email, SMS, and WhatsApp delivery are built in. WhatsApp uses the official Wati integration and SMS works with your provider of choice.",
  },
  {
    q: "Do you support recurring invoices?",
    a: "Yes — set a frequency (weekly, monthly, quarterly, yearly) and MunshiJee will generate the next invoice automatically.",
  },
  {
    q: "How do upgrades work?",
    a: "Reach out to upgrade — our team will activate the new plan on your account immediately. You can also stay on the Free plan as long as you like.",
  },
  {
    q: "Can I import my existing customers?",
    a: "Yes. Bulk-import customers from Excel in one go from the Customers page.",
  },
  {
    q: "Is my data secure?",
    a: "Passwords are bcrypt-hashed, sessions are JWT-signed, and every account is fully isolated — your customers and invoices are visible only to you.",
  },
];

export default async function LandingPage() {
  const dbPlans = await prisma.subscriptionPlan.findMany();
  const plans = dbPlans
    .map((p) => ({ ...p, price: Number(p.price) }))
    .sort(
      (a, b) =>
        (PLAN_ORDER[a.slug] ?? 99) - (PLAN_ORDER[b.slug] ?? 99)
    );

  return (
    <div className="min-h-screen bg-white text-gray-900">
      {/* Top nav */}
      <header className="sticky top-0 z-30 border-b bg-white/80 backdrop-blur">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-3">
          <Link href="/" className="flex items-center gap-2">
            <Receipt className="h-6 w-6 text-primary" />
            <span className="text-xl font-bold">MunshiJee</span>
          </Link>
          <nav className="hidden items-center gap-6 md:flex">
            <a href="#features" className="text-sm text-gray-600 hover:text-gray-900">
              Features
            </a>
            <a href="#pricing" className="text-sm text-gray-600 hover:text-gray-900">
              Pricing
            </a>
            <a href="#faq" className="text-sm text-gray-600 hover:text-gray-900">
              FAQ
            </a>
          </nav>
          <div className="flex items-center gap-2">
            <Link href="/login">
              <Button variant="outline" size="sm">
                Log in
              </Button>
            </Link>
            <Link href="/signup">
              <Button size="sm">Sign up free</Button>
            </Link>
          </div>
        </div>
      </header>

      {/* Hero */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 -z-10 bg-gradient-to-b from-blue-50 to-white" />
        <div className="mx-auto max-w-6xl px-4 py-20 md:py-28">
          <div className="mx-auto max-w-3xl text-center">
            <Badge variant="secondary" className="mb-6">
              <Sparkles className="mr-1 h-3 w-3" />
              Free plan, no credit card required
            </Badge>
            <h1 className="text-4xl font-bold tracking-tight md:text-6xl">
              Send professional invoices.
              <br />
              <span className="text-primary">Get paid faster.</span>
            </h1>
            <p className="mx-auto mt-6 max-w-2xl text-lg text-gray-600">
              MunshiJee is the all-in-one invoicing platform for small businesses —
              generate invoices, send via Email / SMS / WhatsApp, accept payments,
              and run reports from one clean dashboard.
            </p>
            <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
              <Link href="/signup">
                <Button size="lg" className="text-base">
                  Sign up free
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </Link>
              <Link href="/login">
                <Button size="lg" variant="outline" className="text-base">
                  Log in
                </Button>
              </Link>
            </div>
            <p className="mt-4 text-xs text-gray-500">
              10 free notifications/month · cancel anytime
            </p>
          </div>
        </div>
      </section>

      {/* Features */}
      <section id="features" className="border-t bg-white py-20">
        <div className="mx-auto max-w-6xl px-4">
          <div className="mx-auto max-w-2xl text-center">
            <h2 className="text-3xl font-bold md:text-4xl">
              Everything you need to bill customers
            </h2>
            <p className="mt-4 text-gray-600">
              From the first draft to the final payment — MunshiJee covers the
              entire invoicing lifecycle.
            </p>
          </div>

          <div className="mt-12 grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {FEATURES.map((f) => (
              <Card key={f.title} className="border-gray-200">
                <CardHeader>
                  <div className="mb-3 inline-flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
                    <f.icon className="h-5 w-5 text-primary" />
                  </div>
                  <CardTitle className="text-lg">{f.title}</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-gray-600">{f.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* How it works */}
      <section className="border-t bg-gray-50 py-20">
        <div className="mx-auto max-w-6xl px-4">
          <div className="mx-auto max-w-2xl text-center">
            <h2 className="text-3xl font-bold md:text-4xl">How it works</h2>
            <p className="mt-4 text-gray-600">
              Be up and running in three steps.
            </p>
          </div>

          <div className="mt-12 grid gap-6 md:grid-cols-3">
            {STEPS.map((s) => (
              <div key={s.number} className="rounded-lg border bg-white p-6">
                <div className="mb-4 inline-flex h-10 w-10 items-center justify-center rounded-full bg-primary text-lg font-bold text-white">
                  {s.number}
                </div>
                <h3 className="text-lg font-semibold">{s.title}</h3>
                <p className="mt-2 text-sm text-gray-600">{s.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing */}
      <section id="pricing" className="border-t bg-white py-20">
        <div className="mx-auto max-w-6xl px-4">
          <div className="mx-auto max-w-2xl text-center">
            <h2 className="text-3xl font-bold md:text-4xl">
              Simple, transparent pricing
            </h2>
            <p className="mt-4 text-gray-600">
              Start free, upgrade when you need more.
            </p>
          </div>

          <div className="mt-12 grid gap-6 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5">
            {plans.map((plan) => {
              const isEnterprise = plan.slug === "ENTERPRISE";
              const isHighlight = plan.slug === "GROWTH";
              return (
                <Card
                  key={plan.id}
                  className={`flex flex-col ${
                    isHighlight ? "border-primary ring-2 ring-primary/20" : "border-gray-200"
                  }`}
                >
                  <CardHeader>
                    {isHighlight && (
                      <Badge className="mb-2 w-fit">Most popular</Badge>
                    )}
                    <CardTitle className="text-xl">{plan.name}</CardTitle>
                    <div className="mt-2 flex items-baseline gap-1">
                      <span className="text-3xl font-bold">
                        Rs.{plan.price.toFixed(0)}
                      </span>
                      <span className="text-sm text-gray-500">/mo</span>
                    </div>
                    {plan.description && (
                      <p className="mt-2 text-sm text-gray-600">
                        {plan.description}
                      </p>
                    )}
                  </CardHeader>
                  <CardContent className="flex flex-1 flex-col">
                    <ul className="space-y-2 text-sm">
                      <li className="flex items-start gap-2">
                        <Check className="mt-0.5 h-4 w-4 flex-shrink-0 text-green-600" />
                        <span>{plan.emailLimit.toLocaleString()} emails / month</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <Check className="mt-0.5 h-4 w-4 flex-shrink-0 text-green-600" />
                        <span>
                          {plan.smsLimit > 0
                            ? `${plan.smsLimit.toLocaleString()} SMS / month`
                            : "SMS not included"}
                        </span>
                      </li>
                      <li className="flex items-start gap-2">
                        <Check className="mt-0.5 h-4 w-4 flex-shrink-0 text-green-600" />
                        <span>
                          {plan.whatsappLimit.toLocaleString()} WhatsApp / month
                        </span>
                      </li>
                      <li className="flex items-start gap-2">
                        <Check className="mt-0.5 h-4 w-4 flex-shrink-0 text-green-600" />
                        <span>Unlimited invoices & customers</span>
                      </li>
                    </ul>
                    <div className="mt-6">
                      <Link href={isEnterprise ? "mailto:hello@munshijee.com" : "/signup"}>
                        <Button
                          variant={isHighlight ? "default" : "outline"}
                          className="w-full"
                        >
                          {plan.isFree
                            ? "Get started free"
                            : isEnterprise
                            ? "Contact us"
                            : "Get started"}
                        </Button>
                      </Link>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section id="faq" className="border-t bg-gray-50 py-20">
        <div className="mx-auto max-w-3xl px-4">
          <div className="text-center">
            <h2 className="text-3xl font-bold md:text-4xl">
              Frequently asked questions
            </h2>
          </div>
          <div className="mt-10 space-y-3">
            {FAQS.map((item) => (
              <details
                key={item.q}
                className="group rounded-lg border bg-white p-4 [&_summary::-webkit-details-marker]:hidden"
              >
                <summary className="flex cursor-pointer items-center justify-between font-medium">
                  {item.q}
                  <span className="text-gray-400 transition-transform group-open:rotate-45">
                    +
                  </span>
                </summary>
                <p className="mt-3 text-sm text-gray-600">{item.a}</p>
              </details>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="border-t bg-primary py-16 text-white">
        <div className="mx-auto max-w-4xl px-4 text-center">
          <h2 className="text-3xl font-bold md:text-4xl">
            Ready to send your first invoice?
          </h2>
          <p className="mt-4 text-blue-100">
            Free forever plan. Set up in under a minute.
          </p>
          <div className="mt-6 flex flex-wrap items-center justify-center gap-3">
            <Link href="/signup">
              <Button size="lg" variant="secondary" className="text-base">
                Sign up free
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t bg-white py-10">
        <div className="mx-auto flex max-w-6xl flex-col items-center justify-between gap-4 px-4 md:flex-row">
          <div className="flex items-center gap-2">
            <Receipt className="h-5 w-5 text-primary" />
            <span className="font-semibold">MunshiJee</span>
            <span className="text-sm text-gray-500">
              © {new Date().getFullYear()}
            </span>
          </div>
          <div className="flex flex-wrap items-center justify-center gap-x-6 gap-y-2 text-sm text-gray-600">
            <Link href="/login" className="hover:text-gray-900">
              Log in
            </Link>
            <Link href="/signup" className="hover:text-gray-900">
              Sign up
            </Link>
            <a href="#features" className="hover:text-gray-900">
              Features
            </a>
            <a href="#pricing" className="hover:text-gray-900">
              Pricing
            </a>
            <Link href="/privacy" className="hover:text-gray-900">
              Privacy Policy
            </Link>
            <Link href="/terms" className="hover:text-gray-900">
              Terms of Service
            </Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
