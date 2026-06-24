import Link from "next/link";
import { Mail, MapPin, Phone } from "lucide-react";
import { MalawiFlag } from "@/components/MalawiFlag";
import { SITE_NAME } from "@/lib/constants";

export function Footer() {
  return (
    <footer className="mt-auto border-t border-border bg-navy text-white">
      <div className="mx-auto grid max-w-6xl gap-8 px-6 py-10 lg:grid-cols-3">
        <div>
          <div className="mb-4 flex items-center gap-3">
            <MalawiFlag className="h-7 w-11 rounded-sm ring-1 ring-white/20" />
            <div>
              <p className="font-semibold">{SITE_NAME}</p>
              <p className="text-sm text-white/60">Republic of Malawi</p>
            </div>
          </div>
          <p className="text-sm leading-relaxed text-white/70">
            A national-standard civic platform connecting Area 18 residents with
            their ward councillor — transparent, accountable, and accessible.
          </p>
        </div>

        <div>
          <h3 className="mb-3 text-sm font-semibold uppercase tracking-wide text-white/80">Platform</h3>
          <ul className="space-y-2 text-sm text-white/70">
            <li><Link href="/issues" className="transition hover:text-white">Report an Issue</Link></li>
            <li><Link href="/feed" className="transition hover:text-white">Community Feed</Link></li>
            <li><Link href="/magazine" className="transition hover:text-white">Magazine</Link></li>
            <li><Link href="/transparency" className="transition hover:text-white">Transparency</Link></li>
            <li><Link href="/councillor/login" className="transition hover:text-white">Councillor Portal</Link></li>
          </ul>
        </div>

        <div>
          <h3 className="mb-3 text-sm font-semibold uppercase tracking-wide text-white/80">Contact</h3>
          <ul className="space-y-3 text-sm text-white/70">
            <li className="flex items-start gap-2">
              <MapPin className="mt-0.5 h-4 w-4 shrink-0 text-accent" />
              Area 18 Ward Office, Lilongwe, Malawi
            </li>
            <li className="flex items-center gap-2">
              <Phone className="h-4 w-4 shrink-0 text-accent" />
              +265 999 000 000
            </li>
            <li className="flex items-center gap-2">
              <Mail className="h-4 w-4 shrink-0 text-accent" />
              councillor@area18.mw
            </li>
          </ul>
        </div>
      </div>
      <div className="border-t border-white/10 px-6 py-4 text-center text-xs text-white/50">
        © {new Date().getFullYear()} {SITE_NAME}. All rights reserved.
      </div>
    </footer>
  );
}
