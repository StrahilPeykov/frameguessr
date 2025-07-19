import { Metadata } from 'next'
import ArchiveCalendar from '@/components/archive/ArchiveCalendar'

export const metadata: Metadata = {
  title: 'Archive - FrameGuessr Cinema Collection',
  description: 'Browse the complete collection of FrameGuessr daily challenges. Explore past movie and TV show puzzles from our cinema archive.',
}

export default function ArchivePage() {
  return <ArchiveCalendar />
}