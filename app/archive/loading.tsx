export default function ArchiveLoading() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-stone-50 via-amber-50/30 to-rose-50/20 dark:from-stone-950 dark:via-amber-950/20 dark:to-rose-950/10">
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="cinema-spinner mx-auto mb-6" />
          <h2 className="text-xl font-bold cinema-gradient-text">Loading Archive</h2>
          <p className="text-stone-600 dark:text-stone-400">Accessing the film vault...</p>
        </div>
      </div>
    </div>
  )
}