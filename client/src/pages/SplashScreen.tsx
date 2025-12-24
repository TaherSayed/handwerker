export default function SplashScreen() {

  return (
    <div className="flex min-h-screen bg-slate-50 font-sans text-slate-900">
      {/* Skeleton Sidebar (Desktop) */}
      <aside className="hidden lg:flex flex-col sticky top-0 h-screen bg-white/50 backdrop-blur-xl border-r border-slate-200/60 w-64 z-30">
        <div className="h-16 flex items-center px-5 mb-2 border-b border-transparent">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-slate-200 rounded-lg animate-pulse" />
            <div className="h-4 w-24 bg-slate-200 rounded animate-pulse" />
          </div>
        </div>
        <div className="flex-1 px-3 space-y-2 mt-4">
          {[1, 2, 3, 4].map(i => (
            <div key={i} className="h-10 bg-slate-100 rounded-lg animate-pulse" />
          ))}
        </div>
        <div className="p-3 mt-auto">
          <div className="h-12 bg-slate-100 rounded-xl animate-pulse" />
        </div>
      </aside>

      {/* Main Content Skeleton */}
      <div className="flex-1 flex flex-col min-w-0 pb-24 lg:pb-0">
        {/* Header Skeleton */}
        <header className="sticky top-0 z-20 flex items-center justify-between px-6 h-16 bg-transparent">
          <div className="flex items-center gap-4 lg:hidden">
            <div className="w-8 h-8 bg-slate-200 rounded-xl animate-pulse" />
            <div className="h-5 w-20 bg-slate-200 rounded animate-pulse" />
          </div>
          <div className="hidden lg:block">
            <div className="h-6 w-32 bg-slate-200 rounded animate-pulse" />
          </div>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-slate-100 rounded-2xl animate-pulse" />
          </div>
        </header>

        <main className="flex-1 p-4 md:p-8 max-w-7xl mx-auto w-full space-y-6">
          {/* Hero Section Skeleton */}
          <div className="relative rounded-[2rem] p-6 md:p-8 border border-white/50 bg-white/50 shadow-sm overflow-hidden h-48 sm:h-56">
            <div className="space-y-4 relative z-10 max-w-lg">
              <div className="h-8 w-48 bg-slate-200 rounded-lg animate-pulse" />
              <div className="h-12 w-3/4 bg-slate-200 rounded-xl animate-pulse delay-75" />
              <div className="h-10 w-32 bg-slate-200 rounded-xl animate-pulse delay-100 mt-4" />
            </div>
          </div>

          {/* Stats Grid Skeleton */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {[1, 2, 3, 4].map(i => (
              <div key={i} className="bg-white rounded-3xl p-6 border border-slate-100 h-32 flex flex-col justify-between">
                <div className="w-10 h-10 bg-slate-100 rounded-2xl animate-pulse" />
                <div className="h-6 w-16 bg-slate-100 rounded animate-pulse" />
              </div>
            ))}
          </div>

          {/* Loading Text Indicator - Fixed at bottom center or prominent */}
          <div className="fixed bottom-8 left-0 right-0 lg:left-64 flex flex-col items-center justify-center gap-3 z-50 pointer-events-none">
            <div className="bg-white/80 backdrop-blur-md px-6 py-3 rounded-full shadow-sm border border-slate-200/50 flex items-center gap-3">
              <div className="w-4 h-4 border-2 border-blue-600/30 border-t-blue-600 rounded-full animate-spin" />
              <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Einsatz wird vorbereitet...</span>
            </div>
          </div>
        </main>
      </div>

      {/* Mobile Bottom Nav Skeleton */}
      <nav className="lg:hidden fixed bottom-0 left-0 right-0 bg-white/90 backdrop-blur-lg border-t border-slate-200 px-6 py-2 flex items-center justify-between z-40 pb-safe h-[60px]">
        {[1, 2, 3, 4].map(i => (
          <div key={i} className="flex flex-col items-center gap-1 w-16">
            <div className="w-6 h-6 bg-slate-100 rounded-lg animate-pulse" />
            <div className="w-10 h-2 bg-slate-100 rounded animate-pulse" />
          </div>
        ))}
      </nav>
    </div>
  );
}
