import { AccountForm } from "../_components/account/account-form"

export default function Account() {
  return (
    <section className="container mx-auto py-10">
      <h1 className="mb-6 text-3xl font-bold">Account Details</h1>
      <AccountForm />
    </section>
  )
}
