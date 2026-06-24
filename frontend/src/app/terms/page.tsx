import Link from "next/link";
import { SITE_BRAND } from "@/lib/constants";

export default function TermsPage() {
  return (
    <div className="min-h-screen bg-white">
      <div className="mx-auto max-w-3xl px-6 py-12">
        <Link href="/citizen/register" className="text-sm font-medium text-navy hover:underline">← Back to registration</Link>
        <h1 className="mt-6 text-3xl font-semibold text-charcoal">Terms & Conditions</h1>
        <p className="mt-2 text-muted-fg">{SITE_BRAND} · Area 18, Lilongwe, Malawi</p>

        <div className="prose prose-slate mt-8 max-w-none">
          <h2>1. Acceptance</h2>
          <p>
            By creating an account on Councillors Desk, you agree to use the platform
            responsibly for legitimate civic engagement in Area 18 ward.
          </p>
          <h2>2. Accurate Information</h2>
          <p>
            You agree to provide truthful information when reporting issues and interacting
            with ward officials. False or malicious reports may result in account suspension.
          </p>
          <h2>3. Privacy</h2>
          <p>
            Your personal data is used to process issue reports, send notifications, and
            improve ward services. Private reports are visible only to authorised councillors
            and administrators.
          </p>
          <h2>4. Community Conduct</h2>
          <p>
            Harassment, hate speech, or abusive content is prohibited. Councillors may
            moderate or close comments on issues when necessary.
          </p>
          <h2>5. Notifications</h2>
          <p>
            You consent to receive in-app, email, and SMS notifications related to your
            reports and ward announcements where contact details are provided.
          </p>
          <h2>6. Contact</h2>
          <p>
            For questions about these terms, contact the Area 18 Ward Office through the
            platform or your local councillor.
          </p>
        </div>
      </div>
    </div>
  );
}
