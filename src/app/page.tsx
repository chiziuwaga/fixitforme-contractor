import { redirect } from "next/navigation"

// This page handles the initial routing logic - redirect to login
export default function Page() {
  redirect("/login")
}

