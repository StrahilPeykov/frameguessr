export default function LoadingSkeleton() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-950">
      {/* Add top padding to account for fixed navbar */}
      <div className="pt-14">
        <div className="max-w-4xl mx-auto p-4 animate-fadeIn">
          <div className="text-center mb-8">
            <h1 className="text-4xl font-bold mb-2 bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent">
              FrameGuessr
            </h1>
            <p className="text-gray-600 dark:text-gray-400">Loading today's challenge...</p>
          </div>

          {/* Date picker skeleton */}
          <div className="mb-6">
            <div className="flex items-center justify-center gap-4">
              <div className="w-8 h-8 bg-gray-200 dark:bg-gray-700 rounded-lg skeleton" />
              <div className="h-10 w-40 bg-gray-200 dark:bg-gray-700 rounded-lg skeleton" />
              <div className="w-8 h-8 bg-gray-200 dark:bg-gray-700 rounded-lg skeleton" />
            </div>
          </div>

          {/* Status skeleton */}
          <div className="mb-6 text-center min-h-[80px] flex flex-col justify-center">
            <div className="flex justify-center gap-2 mb-3">
              {[1, 2, 3].map((i) => (
                <div key={i} className="w-4 h-4 rounded-full bg-gray-300 dark:bg-gray-600 skeleton" />
              ))}
            </div>
            <div className="h-6 w-48 mx-auto bg-gray-200 dark:bg-gray-700 rounded skeleton mb-2" />
            <div className="h-4 w-32 mx-auto bg-gray-200 dark:bg-gray-700 rounded skeleton" />
          </div>

          {/* Image skeleton */}
          <div className="mb-6">
            <div className="relative bg-gray-900 rounded-2xl overflow-hidden shadow-xl border border-gray-200/50 dark:border-gray-700/50">
              <div className="relative w-full aspect-video bg-gray-800 skeleton flex items-center justify-center">
                <div className="text-center">
                  <div className="w-8 h-8 border-2 border-white/30 border-t-white rounded-full animate-spin mb-3" />
                  <p className="text-white text-sm">Loading...</p>
                </div>
              </div>
            </div>
          </div>

          {/* Search input skeleton */}
          <div className="mb-6">
            <div className="h-16 bg-gray-200 dark:bg-gray-700 rounded-2xl skeleton" />
          </div>

          {/* Skip button skeleton */}
          <div className="text-center">
            <div className="inline-block h-12 w-40 bg-gray-200 dark:bg-gray-700 rounded-xl skeleton" />
            <div className="h-3 w-24 mx-auto mt-2 bg-gray-200 dark:bg-gray-700 rounded skeleton" />
          </div>
        </div>
      </div>
    </div>
  )
}