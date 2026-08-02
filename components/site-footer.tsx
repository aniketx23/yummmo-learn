import Link from "next/link";

export function SiteFooter({ isLoggedIn }: { isLoggedIn?: boolean }) {
  return (
    <footer className="border-t bg-white/80 py-12">
      <div className="mx-auto grid max-w-6xl gap-8 px-4 md:grid-cols-4">
        <div>
          <p className="font-display text-lg font-bold text-primary">
            Yummmo Learn
          </p>
          <p className="mt-2 text-sm text-muted-foreground">
            Akta Mahajan ke saath healthy baking — in-person workshops aur
            recorded tutorials.
          </p>
          <p className="mt-2 text-xs text-muted-foreground">
            Eggless &middot; No maida &middot; Preservative-free
          </p>
        </div>
        <div className="text-sm">
          <p className="font-semibold">Explore</p>
          <ul className="mt-2 space-y-2 text-muted-foreground">
            <li>
              <Link href="/live-classes" className="hover:text-primary">
                Baking workshops
              </Link>
            </li>
            <li>
              <Link href="/courses" className="hover:text-primary">
                Recorded tutorials
              </Link>
            </li>
            <li>
              <Link href="/blog" className="hover:text-primary">
                Blog
              </Link>
            </li>
          </ul>
        </div>
        <div className="text-sm">
          <p className="font-semibold">Account</p>
          <ul className="mt-2 space-y-2 text-muted-foreground">
            {isLoggedIn ? (
              <>
                <li>
                  <Link href="/dashboard" className="hover:text-primary">
                    Dashboard
                  </Link>
                </li>
                <li>
                  <Link href="/profile" className="hover:text-primary">
                    My Profile
                  </Link>
                </li>
              </>
            ) : (
              <>
                <li>
                  <Link href="/auth/login" className="hover:text-primary">
                    Login
                  </Link>
                </li>
                <li>
                  <Link href="/auth/signup" className="hover:text-primary">
                    Sign up
                  </Link>
                </li>
              </>
            )}
          </ul>
        </div>
        <div className="text-sm">
          <p className="font-semibold">Connect</p>
          <ul className="mt-2 space-y-2 text-muted-foreground">
            <li>
              <a
                href="https://wa.me/918459999991?text=Namaste%21%20Main%20aapki%20baking%20workshop%20ke%20baare%20mein%20jaanna%20chahta%2Fchahti%20hoon."
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 transition-colors hover:text-foreground"
              >
                💬 Workshop ke liye WhatsApp karein
              </a>
            </li>
            <li>
              <a
                href="tel:+918459999991"
                className="flex items-center gap-2 transition-colors hover:text-foreground"
              >
                📞 +91 84599 99991
              </a>
            </li>
          </ul>
        </div>
      </div>
      <p className="mt-10 text-center text-xs text-muted-foreground">
        &copy; {new Date().getFullYear()} Yummmo Learn. Part of the Yummmo brand.
      </p>
    </footer>
  );
}
