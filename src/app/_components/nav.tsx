import { LogOutButton } from "@/app/_components/auth/logout-button";
import { Button } from "@/components/ui/button";
import { auth } from "@/server/auth";
import Link from "next/link";

export default async function Nav() {
  const session = await auth();

  return (
    <header className="bg-white shadow-md">
      <div className="container mx-auto flex items-center justify-between px-6 py-4">
        <Link href="/" className="text-2xl font-bold text-primary">
          Restaurant Finder
        </Link>
        <nav className="space-x-4">
          {session ? (
            <>
              <span>Welcome, {session.user?.name}!</span>
              <LogOutButton />
            </>
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
