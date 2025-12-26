'use client'

export function Footer() {
  return (
    <footer className="border-t border-border bg-card/50">
      <div className="max-w-7xl mx-auto px-4 py-4">
        <div className="flex flex-col sm:flex-row items-center justify-center gap-2 text-xs text-muted-foreground">
          <span>© 2025 nimbi.gr</span>
          <span className="hidden sm:inline">·</span>
          <a
            href="mailto:hello@nimbi.gr"
            className="hover:text-foreground transition-colors"
          >
            hello@nimbi.gr
          </a>
        </div>
      </div>
    </footer>
  )
}
