"use client"
import { redirect } from "next/navigation"
import type { ColumnDef } from "@tanstack/react-table"

interface DataTableProps<TData, TValue> {
  columns: ColumnDef<TData, TValue>[]
  data: TData[]
}

// This page handles the initial routing logic.
export default function Page() {
  redirect("/login")
}

