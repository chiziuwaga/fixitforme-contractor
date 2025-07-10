"use client"
import { redirect } from "next/navigation"

// This page handles the initial routing logic.
export default function Page() {
  redirect("/login")
}