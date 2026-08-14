import LANDING_ICONS from "../constants/icons";

export default function LegalLayout({ title, updated, children }) {
  return (
    <div className="min-h-screen bg-black text-white">
      <nav className="sticky top-0 z-50 border-b border-white/10 bg-black/80 backdrop-blur-md">
        <div className="mx-auto flex max-w-3xl items-center justify-between px-4 py-4">
          <a href="/" className="flex items-center space-x-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-gradient-to-br from-[#61dca3] to-[#61b3dc]">
              <LANDING_ICONS.TICK className="h-5 w-5 text-black" strokeWidth={3} />
            </div>
            <span className="text-lg font-bold tracking-tight">
              <span className="text-white">Algo</span>
              <span className="text-[#61dca3]">Tick</span>
            </span>
          </a>
          <div className="flex items-center gap-4 text-sm">
            <a href="/privacy" className="text-white/60 transition-colors hover:text-[#61dca3]">
              Privacy
            </a>
            <a href="/terms" className="text-white/60 transition-colors hover:text-[#61dca3]">
              Terms
            </a>
            <a href="/" className="text-white/60 transition-colors hover:text-white">
              Home
            </a>
          </div>
        </div>
      </nav>

      <main className="mx-auto max-w-3xl px-4 py-12 sm:py-16">
        <p className="mb-3 text-sm font-medium text-[#61dca3]">Legal</p>
        <h1 className="mb-3 text-4xl font-bold tracking-tight sm:text-5xl">{title}</h1>
        <p className="mb-10 text-sm text-white/50">Last updated: {updated}</p>
        <div className="legal-content space-y-8 text-[15px] leading-7 text-white/75">
          {children}
        </div>
      </main>

      <footer className="border-t border-white/10 py-8">
        <div className="mx-auto flex max-w-3xl flex-col items-center gap-3 px-4 text-center text-sm text-white/40">
          <p>
            © 2025-26 <span className="text-white">Algo</span>
            <span className="text-[#61dca3]">Tick</span>
          </p>
          <div className="flex gap-4">
            <a href="/privacy" className="hover:text-[#61dca3]">
              Privacy Policy
            </a>
            <a href="/terms" className="hover:text-[#61dca3]">
              Terms of Service
            </a>
          </div>
        </div>
      </footer>
    </div>
  );
}
