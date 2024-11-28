import Link from "next/link";
import { Button } from "@/components/ui/button";
import { auth } from "@/server/auth";
import AccountNav from "./accunt-nav";
import type { User } from "next-auth";

export default async function Nav() {
  const session = await auth();
  const user = session?.user as User;

  return (
    <header className="bg-white shadow-md">
      <div className="container mx-auto flex items-center justify-between p-4">
        <Link href="/" className="text-2xl font-bold text-primary">
          Restaurant App
        </Link>
        <nav className="space-x-4">
          {session ? (
            <AccountNav user={user} />
          ) : (
            <Link href="/login">
              <Button>Login</Button>
            </Link>
          )}
        </nav>
      </div>
    </header>
  );
}
