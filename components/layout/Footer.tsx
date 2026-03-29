import Link from 'next/link'

export function Footer() {
  const year = new Date().getFullYear()

  return (
    <footer className="bg-[var(--color-indigo-deep)] text-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Brand */}
          <div>
            <h3 className="font-heading text-2xl mb-3">Hypnotherapy.ie</h3>
            <p className="font-body text-white/70 text-sm">
              Professional self-hypnosis audio downloads for sleep, anxiety, confidence and more.
            </p>
          </div>

          {/* Quick links */}
          <div>
            <h4 className="font-body font-semibold text-sm uppercase tracking-wider text-white/50 mb-4">Quick Links</h4>
            <ul className="space-y-2">
              {[
                ['/', 'Home'],
                ['/shop', 'Shop'],
                ['/about-hypnotherapy', 'About Hypnotherapy'],
                ['/blog', 'Blog'],
                ['/contact', 'Contact'],
              ].map(([href, label]) => (
                <li key={href}>
                  <Link href={href} className="font-body text-white/70 hover:text-white text-sm transition-colors">
                    {label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Legal */}
          <div>
            <h4 className="font-body font-semibold text-sm uppercase tracking-wider text-white/50 mb-4">Legal</h4>
            <ul className="space-y-2">
              <li><span className="font-body text-white/70 text-sm">Privacy Policy</span></li>
              <li><span className="font-body text-white/70 text-sm">Terms of Service</span></li>
              <li><span className="font-body text-white/70 text-sm">Refund Policy</span></li>
            </ul>
          </div>
        </div>

        <div className="mt-8 pt-8 border-t border-white/10 text-center">
          <p className="font-body text-white/50 text-sm">
            © {year} Hypnotherapy.ie — All rights reserved
          </p>
        </div>
      </div>
    </footer>
  )
}
