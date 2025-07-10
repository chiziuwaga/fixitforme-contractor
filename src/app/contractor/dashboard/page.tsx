"use client"

export default function DashboardPage() {
  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Dashboard</h1>
          <p className="text-muted-foreground">Welcome back! Here's what's happening.</p>
        </div>
      </div>
      <div className="border rounded-lg p-8 text-center">
        <p>Your dashboard content will go here.</p>
      </div>
    </div>
  )
}
