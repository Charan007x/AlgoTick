import { Link } from "react-router-dom";

export default function LegalLayout({ title, updated, children }) {
  return (
    <div className="min-h-screen bg-black text-white">
      <nav className="sticky top-0 z-50 border-b border-white/10 bg-black/80 backdrop-blur-md">
        <div className="mx-auto flex max-w-3xl items-center justify-between px-4 py-4">
          <Link to="/" className="flex items-center space-x-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-gradient-to-br from-[#61dca3] to-[#61b3dc]">
              <span className="text-lg font-bold text-black">✓</span>
            </div>
            <span className="text-lg font-bold tracking-tight">
              <span className="text-white">Algo</span>
              <span className="text-[#61dca3]">Tick</span>
            </span>
          </Link>
          <div className="flex items-center gap-4 text-sm">
            <Link to="/privacy" className="text-white/60 transition-colors hover:text-[#61dca3]">
              Privacy
            </Link>
            <Link to="/terms" className="text-white/60 transition-colors hover:text-[#61dca3]">
              Terms
            </Link>
            <Link to="/" className="text-white/60 transition-colors hover:text-white">
              Home
            </Link>
          </div>
        </div>
      </nav>

      <main className="mx-auto max-w-3xl px-4 py-12 sm:py-16">
        <p className="mb-3 text-sm font-medium text-[#61dca3]">Legal</p>
        <h1 className="mb-3 text-4xl font-bold tracking-tight sm:text-5xl">{title}</h1>
        <p className="mb-10 text-sm text-white/50">Last updated: {updated}</p>
        <div className="space-y-8 text-[15px] leading-7 text-white/75">{children}</div>
      </main>

      <footer className="border-t border-white/10 py-8">
        <div className="mx-auto flex max-w-3xl flex-col items-center gap-3 px-4 text-center text-sm text-white/40">
          <p>
            © 2025-26 <span className="text-white">Algo</span>
            <span className="text-[#61dca3]">Tick</span>
          </p>
          <div className="flex gap-4">
            <Link to="/privacy" className="hover:text-[#61dca3]">
              Privacy Policy
            </Link>
            <Link to="/terms" className="hover:text-[#61dca3]">
              Terms of Service
            </Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
