import { redirect } from 'next/navigation'

export default function HomePage() {
  // Redirect to contractor dashboard for now
  redirect('/contractor/dashboard')
}
