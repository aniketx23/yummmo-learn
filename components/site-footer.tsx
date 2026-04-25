import Link from "next/link";

export function SiteFooter({ isLoggedIn }: { isLoggedIn?: boolean }) {
  return (
    <footer className="border-t bg-white/80 py-12">
      <div className="mx-auto grid max-w-6xl gap-8 px-4 md:grid-cols-3">
        <div>
          <p className="font-display text-lg font-bold text-primary">
            Yummmo Learn
          </p>
          <p className="mt-2 text-sm text-muted-foreground">
            Healthy cooking courses in Hindi & Hinglish — swad bhi, sehat bhi.
          </p>
        </div>
        <div className="text-sm">
          <p className="font-semibold">Explore</p>
          <ul className="mt-2 space-y-2 text-muted-foreground">
            <li>
              <Link href="/courses" className="hover:text-primary">
                All courses
              </Link>
            </li>
            <li>
              <Link
                href="/categories/healthy-swaps"
                className="hover:text-primary"
              >
                Healthy swaps
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
      </div>
      <p className="mt-10 text-center text-xs text-muted-foreground">
        © {new Date().getFullYear()} Yummmo Learn. Part of the Yummmo brand.
      </p>
    </footer>
  );
}
