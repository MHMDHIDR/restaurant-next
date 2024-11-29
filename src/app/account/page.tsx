import { auth } from "@/server/auth";
import type { Session } from "next-auth";
import { AccountForm } from "../_components/account/account-form";

export default async function Account() {
  const session = await auth();
  const user = session!.user as Session["user"];

  return (
    <section className="container mx-auto px-6 py-10">
      <h1 className="mb-6 text-3xl font-bold">Account Details</h1>
      <AccountForm user={user} />
    </section>
  );
}
