export default function LoadingSkeleton() {
  return (
    <div className="max-w-4xl mx-auto p-4 animate-fadeIn">
      <div className="text-center mb-8">
        <h1 className="text-4xl font-bold mb-2">FrameGuessr</h1>
        <p className="text-gray-600">Loading today's challenge...</p>
      </div>

      {/* Status skeleton */}
      <div className="mb-6 text-center">
        <div className="flex justify-center gap-2 mb-2">
          {[1, 2, 3].map((i) => (
            <div key={i} className="w-3 h-3 rounded-full bg-gray-300 skeleton" />
          ))}
        </div>
        <div className="h-4 w-32 mx-auto bg-gray-200 rounded skeleton" />
      </div>

      {/* Image skeleton */}
      <div className="mb-8 bg-gray-900 rounded-lg overflow-hidden shadow-lg">
        <div className="relative aspect-video skeleton" />
      </div>

      {/* Search input skeleton */}
      <div className="mb-6">
        <div className="h-12 bg-gray-200 rounded-lg skeleton" />
      </div>

      {/* Skip button skeleton */}
      <div className="text-center">
        <div className="inline-block h-10 w-32 bg-gray-200 rounded-lg skeleton" />
      </div>
    </div>
  )
}