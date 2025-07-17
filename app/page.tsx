import GameBoard from '@/components/game/GameBoard'

export default function Home() {
  return (
    <main className="min-h-screen bg-gray-50">
      <div className="container mx-auto py-8">
        <GameBoard />
      </div>
    </main>
  )
}