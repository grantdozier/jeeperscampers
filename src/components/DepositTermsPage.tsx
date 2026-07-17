import React from 'react';
import { ArrowLeft, FileCheck2, Printer, ShieldCheck } from 'lucide-react';
import { DEPOSIT_TERMS, DEPOSIT_TERMS_VERSION } from '../lib/terms';

export const DepositTermsPage: React.FC = () => (
  <main className="min-h-screen bg-[#0b1018] px-4 py-8 text-gray-100 sm:px-6 sm:py-12">
    <article className="mx-auto max-w-4xl overflow-hidden rounded-2xl border border-gray-700 bg-gray-900 shadow-2xl">
      <header className="border-b border-gray-700 bg-gradient-to-br from-orange-500/15 via-gray-900 to-gray-900 px-6 py-8 sm:px-10 sm:py-10">
        <div className="mb-8 flex flex-wrap items-center justify-between gap-3 print:hidden">
          <a href="/" className="inline-flex items-center gap-2 text-sm font-bold text-gray-300 transition hover:text-white">
            <ArrowLeft size={17} />
            Return to Badland Campers
          </a>
          <button
            type="button"
            onClick={() => window.print()}
            className="inline-flex items-center gap-2 rounded-lg border border-gray-600 bg-gray-800 px-4 py-2 text-sm font-bold transition hover:border-orange-500 hover:text-orange-300"
          >
            <Printer size={16} />
            Print or save PDF
          </button>
        </div>

        <div className="flex items-start gap-4">
          <div className="hidden rounded-xl bg-orange-500/15 p-3 text-orange-400 sm:block">
            <FileCheck2 size={28} />
          </div>
          <div>
            <p className="mb-2 text-xs font-black uppercase tracking-[0.22em] text-orange-400">Badland Campers</p>
            <h1 className="text-3xl font-black tracking-tight sm:text-4xl">50% Build Deposit Terms</h1>
            <p className="mt-3 max-w-2xl leading-relaxed text-gray-300">
              These terms explain how your build reservation, remaining balance, changes,
              cancellation, and delivery are handled.
            </p>
            <p className="mt-4 text-xs font-semibold uppercase tracking-wider text-gray-500">
              Agreement version {DEPOSIT_TERMS_VERSION}
            </p>
          </div>
        </div>
      </header>

      <section className="grid gap-px border-b border-gray-700 bg-gray-700 sm:grid-cols-3">
        {[
          ['Due today', '50% of the quoted build price'],
          ['Remaining balance', 'Due within 30 days of completion notice'],
          ['Camper release', 'After final cleared payment and paperwork'],
        ].map(([label, value]) => (
          <div key={label} className="bg-gray-900 px-6 py-5">
            <p className="text-xs font-black uppercase tracking-wider text-orange-400">{label}</p>
            <p className="mt-2 text-sm font-semibold leading-relaxed text-gray-200">{value}</p>
          </div>
        ))}
      </section>

      <div className="space-y-9 px-6 py-8 sm:px-10 sm:py-10">
        {DEPOSIT_TERMS.map((section) => (
          <section key={section.title} className="grid gap-3 sm:grid-cols-[180px_1fr] sm:gap-8">
            <h2 className="text-base font-black leading-snug text-orange-400">{section.title}</h2>
            <div className="space-y-3">
              {section.items.map((item) => (
                <p key={item} className="text-sm leading-7 text-gray-300">{item}</p>
              ))}
            </div>
          </section>
        ))}

        <footer className="border-t border-gray-700 pt-7">
          <div className="flex items-start gap-3 rounded-xl border border-gray-700 bg-black/20 p-5">
            <ShieldCheck className="mt-0.5 shrink-0 text-orange-400" size={20} />
            <div>
              <p className="font-bold text-gray-100">Electronic acceptance</p>
              <p className="mt-1 text-sm leading-6 text-gray-400">
                Returning to checkout, selecting the acceptance checkbox, and submitting
                the deposit constitutes the buyer&apos;s electronic agreement to this version
                of the terms.
              </p>
            </div>
          </div>
          <p className="mt-5 text-xs leading-6 text-gray-500">
            Questions about these terms or your order? Contact Badland Campers before submitting
            payment at matthew@badlandcampers.com or (843) 540-8503.
          </p>
        </footer>
      </div>
    </article>
  </main>
);
