"use client"

export function JobHeader({ title }: { title: string }) {
  return (
    <div className="mb-4">
      <h1 className="text-2xl font-bold">{title}</h1>
    </div>
  )
}
