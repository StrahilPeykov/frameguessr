'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { GameProvider } from '@/contexts/GameContext'
import GameHeader from './GameHeader'
import GameContent from './GameContent'
import ShareModal from './ShareModal'
import StatsModal from './StatsModal'

interface GameBoardProps {
  initialDate?: string
}

export default function GameBoard({ initialDate }: GameBoardProps) {
  const router = useRouter()
  const [showShareModal, setShowShareModal] = useState(false)
  const [showStatsModal, setShowStatsModal] = useState(false)

  const selectedDate = initialDate || new Date().toISOString().split('T')[0]

  const handleDateSelect = (date: string) => {
    router.push(`/day/${date}`)
  }

  const handleStatsClick = () => {
    setShowStatsModal(true)
  }

  const handleShareClick = () => {
    setShowShareModal(true)
  }

  return (
    <GameProvider initialDate={selectedDate}>
      {/* Header with navigation */}
      <GameHeader
        currentDate={selectedDate}
        onDateSelect={handleDateSelect}
        onStatsClick={handleStatsClick}
        onShareClick={handleShareClick}
      />

      {/* Main game content */}
      <GameContent currentDate={selectedDate} />

      {/* Modals */}
      <ShareModal
        isOpen={showShareModal}
        onClose={() => setShowShareModal(false)}
        currentDate={selectedDate}
      />
      
      <StatsModal
        isOpen={showStatsModal}
        onClose={() => setShowStatsModal(false)}
      />
    </GameProvider>
  )
}