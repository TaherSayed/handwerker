export default function SplashScreen() {
  return (
    <div className="flex h-screen bg-slate-50 dark:bg-slate-900 overflow-hidden">
      {/* Sidebar Skeleton (Desktop only) */}
      <div className="hidden lg:flex w-64 border-r border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 flex-col p-4 gap-4">
        <div className="h-8 w-32 bg-slate-100 dark:bg-slate-800 rounded animate-pulse" />
        <div className="space-y-2 mt-4">
          {[1, 2, 3, 4, 5].map(i => (
            <div key={i} className="h-10 w-full bg-slate-100 dark:bg-slate-800 rounded animate-pulse" />
          ))}
        </div>
      </div>

      <div className="flex-1 flex flex-col h-full relative">
        {/* Mobile Header Skeleton */}
        <div className="lg:hidden h-16 border-b border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 flex items-center justify-between px-4">
          <div className="h-8 w-8 bg-slate-100 dark:bg-slate-800 rounded animate-pulse" />
          <div className="h-6 w-24 bg-slate-100 dark:bg-slate-800 rounded animate-pulse" />
          <div className="h-8 w-8 bg-slate-100 dark:bg-slate-800 rounded-full animate-pulse" />
        </div>

        <main className="flex-1 p-4 lg:p-8 overflow-y-auto w-full">
          <div className="max-w-7xl mx-auto space-y-6">
            {/* Hero Skeleton (Matches Dashboard) */}
            <div className="flex flex-col gap-4">
              <div className="flex items-center justify-between">
                <div className="space-y-2">
                  <div className="h-8 w-48 bg-slate-100 dark:bg-slate-800 rounded animate-pulse" />
                  <div className="h-4 w-32 bg-slate-100 dark:bg-slate-800 rounded animate-pulse" />
                </div>
                <div className="h-10 w-10 rounded-full bg-slate-100 dark:bg-slate-800 animate-pulse lg:hidden" />
              </div>
              <div className="h-14 w-full lg:w-48 bg-slate-100 dark:bg-slate-800 rounded-lg animate-pulse" />
            </div>

            {/* KPI Grid Skeleton */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
              {[1, 2, 3, 4].map(i => (
                <div key={i} className="h-24 bg-slate-100 dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 animate-pulse" />
              ))}
            </div>

            {/* List Skeleton */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <div className="lg:col-span-2 space-y-3">
                <div className="flex justify-between">
                  <div className="h-5 w-32 bg-slate-100 dark:bg-slate-800 rounded animate-pulse" />
                  <div className="h-5 w-16 bg-slate-100 dark:bg-slate-800 rounded animate-pulse" />
                </div>
                {[1, 2, 3].map(i => (
                  <div key={i} className="h-16 bg-slate-100 dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 animate-pulse" />
                ))}
              </div>
              <div className="space-y-3">
                <div className="h-5 w-24 bg-slate-100 dark:bg-slate-800 rounded animate-pulse" />
                {[1, 2].map(i => (
                  <div key={i} className="h-24 bg-slate-100 dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 animate-pulse" />
                ))}
              </div>
            </div>
          </div>
        </main>

        {/* Loading Indicator */}
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none z-50">
          <div className="bg-white/80 dark:bg-slate-800/80 backdrop-blur px-6 py-3 rounded-full shadow-lg border border-slate-200 dark:border-slate-700 flex items-center gap-3">
            <div className="w-4 h-4 border-2 border-slate-300 dark:border-slate-600 border-t-blue-600 rounded-full animate-spin" />
            <span className="text-sm font-bold text-slate-700 dark:text-slate-200">Wird geladen...</span>
          </div>
        </div>
      </div>

      {/* Mobile Bottom Nav Skeleton */}
      <nav className="lg:hidden fixed bottom-0 left-0 right-0 bg-white/90 dark:bg-slate-900/90 backdrop-blur-lg border-t border-slate-200 dark:border-slate-800 px-6 py-2 flex items-center justify-between z-40 pb-safe h-[60px]">
        {[1, 2, 3, 4].map(i => (
          <div key={i} className="flex flex-col items-center gap-1 w-16">
            <div className="w-6 h-6 bg-slate-100 dark:bg-slate-800 rounded-lg animate-pulse" />
            <div className="w-10 h-2 bg-slate-100 dark:bg-slate-800 rounded animate-pulse" />
          </div>
        ))}
      </nav>
    </div>
  );
}
