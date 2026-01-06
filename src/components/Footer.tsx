import Link from 'next/link'
import { VERSION } from '@/lib/version'

interface FooterProps {
  /** Show the primary CTA "Run the test" prominently */
  showCta?: boolean
  /** Custom tagline (defaults to generic) */
  tagline?: string
}

export function Footer({ showCta = false, tagline }: FooterProps) {
  return (
    <footer className="border-t border-[var(--border)] py-8 sm:py-10 px-4 sm:px-6">
      <div className="max-w-4xl mx-auto">
        {showCta && (
          <div className="text-center mb-8">
            <Link href="/" className="inline-flex items-center gap-2 text-[var(--accent)] hover:underline text-lg font-medium">
              Run another test →
            </Link>
          </div>
        )}

        <div className="flex flex-col sm:flex-row justify-between items-center gap-6">
          {/* Left: version (invisible) + attribution */}
          <div className="flex items-center gap-4">
            <span className="text-[var(--background)] text-xs">v{VERSION}</span>
            <div className="text-center sm:text-left">
              <p className="text-[var(--foreground)] font-medium text-sm">
                Built by <a href="https://leefuhr.com" className="text-[var(--accent)] hover:underline">Lee Fuhr</a>
              </p>
              {tagline && (
                <p className="text-[var(--muted-foreground)] text-xs mt-0.5">{tagline}</p>
              )}
            </div>
          </div>

          {/* Right: nav links */}
          <nav className="flex items-center gap-6 text-sm">
            <Link href="/how-it-works" className="text-[var(--muted-foreground)] hover:text-[var(--foreground)]">How it works</Link>
            <Link href="/privacy" className="text-[var(--muted-foreground)] hover:text-[var(--foreground)]">Privacy</Link>
            <Link href="/contact" className="text-[var(--muted-foreground)] hover:text-[var(--foreground)]">Contact</Link>
          </nav>
        </div>
      </div>
    </footer>
  )
}
