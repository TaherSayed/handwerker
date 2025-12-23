export default function SplashScreen() {
  return (
    <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-blue-600 to-blue-800">
      <div className="text-center">
        <h1 className="text-5xl font-bold text-white mb-4">OnSite Forms</h1>
        <div className="flex justify-center">
          <div className="animate-spin rounded-full h-12 w-12 border-4 border-white border-t-transparent"></div>
        </div>
      </div>
    </div>
  );
}
