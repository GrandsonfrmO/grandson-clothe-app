import Link from "next/link"

const footerLinks = {
  boutique: [
    { name: "Nouveautes", href: "#nouveautes" },
    { name: "Hoodies", href: "#hoodies" },
    { name: "T-Shirts", href: "#tshirts" },
    { name: "Pantalons", href: "#pantalons" },
    { name: "Accessoires", href: "#accessoires" },
  ],
  aide: [
    { name: "FAQ", href: "#" },
    { name: "Livraison", href: "#" },
    { name: "Echanges", href: "#" },
    { name: "Guide des tailles", href: "#" },
  ],
  contact: [
    { name: "WhatsApp: +224 XX XX XX XX", href: "#" },
    { name: "Email: contact@grandsonclothes.com", href: "#" },
    { name: "Conakry, Guinee", href: "#" },
  ],
}

const socialLinks = [
  { name: "Instagram", href: "#" },
  { name: "TikTok", href: "#" },
  { name: "Facebook", href: "#" },
]

export function Footer() {
  return (
    <footer className="bg-card border-t border-border">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-12 lg:py-16">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8 lg:gap-12">
          {/* Brand */}
          <div className="col-span-2 md:col-span-1">
            <Link href="/" className="inline-block">
              <span className="font-[family-name:var(--font-display)] text-3xl tracking-wider text-foreground">
                GRANDSON
              </span>
            </Link>
            <p className="mt-4 text-sm text-muted-foreground leading-relaxed">
              Streetwear authentique depuis la Guinee, Afrique. Style urbain. Culture africaine.
            </p>
            <div className="flex gap-4 mt-6">
              {socialLinks.map((link) => (
                <Link
                  key={link.name}
                  href={link.href}
                  className="text-sm text-muted-foreground hover:text-accent transition-colors"
                >
                  {link.name}
                </Link>
              ))}
            </div>
          </div>

          {/* Boutique */}
          <div>
            <h3 className="font-bold text-foreground mb-4 tracking-wider text-sm">
              BOUTIQUE
            </h3>
            <ul className="space-y-3">
              {footerLinks.boutique.map((link) => (
                <li key={link.name}>
                  <Link
                    href={link.href}
                    className="text-sm text-muted-foreground hover:text-foreground transition-colors"
                  >
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Aide */}
          <div>
            <h3 className="font-bold text-foreground mb-4 tracking-wider text-sm">
              AIDE
            </h3>
            <ul className="space-y-3">
              {footerLinks.aide.map((link) => (
                <li key={link.name}>
                  <Link
                    href={link.href}
                    className="text-sm text-muted-foreground hover:text-foreground transition-colors"
                  >
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h3 className="font-bold text-foreground mb-4 tracking-wider text-sm">
              CONTACT
            </h3>
            <ul className="space-y-3">
              {footerLinks.contact.map((link) => (
                <li key={link.name}>
                  <Link
                    href={link.href}
                    className="text-sm text-muted-foreground hover:text-foreground transition-colors"
                  >
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>

        <div className="border-t border-border mt-12 pt-8 flex flex-col sm:flex-row justify-between items-center gap-4">
          <p className="text-sm text-muted-foreground">
            © 2026 GRANDSON CLOTHES. Tous droits reserves. Made in Guinee.
          </p>
          <div className="flex gap-6">
            <Link href="#" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
              Conditions generales
            </Link>
            <Link href="#" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
              Confidentialite
            </Link>
          </div>
        </div>
      </div>
    </footer>
  )
}
