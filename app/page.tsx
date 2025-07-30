import { redirect } from 'next/navigation'
import { getTodayLocal } from '@/utils/dateUtils'

export default function HomePage() {
  const today = getTodayLocal()
  redirect(`/day/${today}`)
}