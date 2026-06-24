import Image from "next/image";
import Link from "next/link";
import { ArrowRight, FileText, LogIn, MapPin, Shield, Users } from "lucide-react";
import { btnAccentClass, btnPrimaryClass } from "@/lib/ui";
import { SITE_BRAND } from "@/lib/constants";
import { MalawiFlag } from "@/components/MalawiFlag";

export function PublicLanding() {
  return (
    <>
      <section className="relative min-h-[420px] overflow-hidden border-b border-border lg:min-h-[480px]">
        <Image
          src="/cover-image.jpeg"
          alt="Semi-urban residential neighbourhood in Area 18, Lilongwe"
          fill
          priority
          className="object-cover object-center"
          sizes="100vw"
        />
        <div className="absolute inset-0 bg-[#0f2d52]/55" aria-hidden />
        <div className="relative mx-auto flex max-w-6xl flex-col justify-center px-6 py-16 lg:min-h-[480px] lg:py-20">
          <div className="max-w-xl">
            <div className="mb-5 inline-flex items-center gap-3 rounded-md border border-white/25 bg-black/20 px-3 py-2 text-sm backdrop-blur-sm">
              <MalawiFlag className="h-5 w-8 rounded-sm" />
              <span className="flex items-center gap-1.5 font-medium text-white">
                <MapPin className="h-3.5 w-3.5" />
                Area 18 · Lilongwe · Malawi
              </span>
            </div>
            <h1 className="text-3xl font-semibold tracking-tight text-white sm:text-4xl lg:text-5xl">
              {SITE_BRAND}
            </h1>
            <p className="mt-4 text-lg leading-relaxed text-white">
              Your voice. Your ward. Transparent governance for Area 18 residents.
            </p>
            <p className="mt-3 text-sm leading-relaxed text-white/90">
              Sign up to report issues, track progress, discuss with your councillor, and read official announcements.
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Link href="/citizen/register" className={btnAccentClass + " gap-2 px-6 py-3"}>
                Sign Up <ArrowRight className="h-4 w-4" />
              </Link>
              <Link
                href="/login"
                className="inline-flex items-center gap-2 rounded-md border-2 border-white bg-white/10 px-6 py-3 text-sm font-medium text-white backdrop-blur-sm transition hover:bg-white/20"
              >
                <LogIn className="h-4 w-4" />
                Sign In
              </Link>
            </div>
          </div>
        </div>
      </section>

      <section className="bg-white px-6 py-14">
        <div className="mx-auto max-w-6xl">
          <div className="mb-10">
            <h2 className="text-xl font-semibold text-slate-900 sm:text-2xl">How It Works</h2>
            <p className="mt-1 text-sm text-slate-600">Real issues, real discussions — no placeholders</p>
          </div>
          <div className="grid gap-6 md:grid-cols-3">
            {[
              { icon: Users, title: "Sign Up", desc: "Create your citizen account as an Area 18 resident." },
              { icon: FileText, title: "Report & Discuss", desc: "Report issues with photos and map pins. Follow councillor updates and join the discussion." },
              { icon: Shield, title: "Stay Informed", desc: "View ward transparency stats and official councillor announcements." },
            ].map(({ icon: Icon, title, desc }) => (
              <div key={title} className="rounded-lg border border-slate-200 bg-white p-6 shadow-sm">
                <div className="mb-4 inline-flex rounded-md bg-slate-100 p-2.5 text-navy">
                  <Icon className="h-5 w-5" />
                </div>
                <h3 className="text-base font-semibold text-slate-900">{title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-slate-600">{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="border-t border-slate-200 bg-slate-50 px-6 py-14">
        <div className="mx-auto max-w-2xl text-center">
          <h2 className="text-xl font-semibold text-slate-900">Ready to connect with your councillor?</h2>
          <p className="mt-2 text-sm text-slate-600">
            The official digital bridge between Area 18 residents and ward leadership.
          </p>
          <div className="mt-6 flex flex-wrap justify-center gap-3">
            <Link href="/citizen/register" className={btnPrimaryClass + " gap-2 px-8"}>
              Create Citizen Account
            </Link>
            <Link href="/councillor/login" className={btnAccentClass + " px-8"}>
              Councillor Sign In
            </Link>
          </div>
        </div>
      </section>
    </>
  );
}
