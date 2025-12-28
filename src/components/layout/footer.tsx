'use client'

export function Footer() {
  return (
    <footer className="fixed bottom-0 left-0 right-0 z-40 border-t border-border/50 bg-card/90 backdrop-blur-md">
      <div className="max-w-7xl mx-auto px-4 py-1.5 sm:py-2">
        <div className="flex items-center justify-center gap-1.5 sm:gap-2 text-[10px] sm:text-xs text-muted-foreground">
          <span>© 2025 nimbi.gr</span>
          <span className="opacity-40">·</span>
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
