import React from 'react'
import { Link } from 'react-router-dom'
import { ArrowLeft, Maximize2, Minimize2 } from 'lucide-react'
import TokenDisplay from '../components/TokenDisplay'
import { useRealtimeToken } from '../hooks/useRealtimeToken'

export default function ClientPage() {
  const {
    token,
    updatedAt,
    status,
    error,
    reconnect
  } = useRealtimeToken()

  const [isFullscreen, setIsFullscreen] = React.useState(false)

  // Opsi toggle layar penuh (Fullscreen) untuk TV / Monitor antrean
  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen().catch(() => {})
      setIsFullscreen(true)
    } else {
      if (document.exitFullscreen) {
        document.exitFullscreen().catch(() => {})
        setIsFullscreen(false)
      }
    }
  }

  React.useEffect(() => {
    const handleFullscreenChange = () => {
      setIsFullscreen(Boolean(document.fullscreenElement))
    }
    document.addEventListener('fullscreenchange', handleFullscreenChange)
    return () => document.removeEventListener('fullscreenchange', handleFullscreenChange)
  }, [])

  return (
    <div className="relative min-h-screen w-full bg-black text-slate-100 flex flex-col justify-between overflow-x-hidden selection:bg-indigo-500 selection:text-white">
      {/* Background radial glow halus untuk meningkatkan kedalaman visual tanpa mengganggu kontras */}
      <div
        className="pointer-events-none absolute inset-0 opacity-20"
        style={{
          background: 'radial-gradient(circle at 50% 50%, rgba(99, 102, 241, 0.15) 0%, transparent 70%)'
        }}
      />

      {/* Top Bar: Navigasi & Kontrol Layar */}
      <header className="relative z-10 w-full px-6 py-5 sm:px-10 flex items-center justify-between border-b border-slate-900 bg-black/60 backdrop-blur-md">
        <Link
          to="/"
          className="inline-flex items-center gap-2 rounded-lg border border-slate-800 bg-slate-900/60 px-3.5 py-2 text-xs font-semibold text-slate-300 hover:border-slate-700 hover:text-white transition"
        >
          <ArrowLeft className="h-4 w-4" />
          <span>Kembali</span>
        </Link>

        <div className="flex items-center gap-3">
          <div className="text-right hidden sm:block">
            <span className="block text-xs font-bold text-white tracking-wider">
              TOKEN DISPLAY
            </span>
            <span className="block text-[11px] text-slate-400">
              Layar Monitor Antrean
            </span>
          </div>

          <button
            onClick={toggleFullscreen}
            title={isFullscreen ? 'Keluar Layar Penuh' : 'Mode Layar Penuh (TV / Monitor)'}
            className="rounded-lg border border-slate-800 bg-slate-900/60 p-2 text-slate-400 hover:text-white hover:border-slate-700 transition"
          >
            {isFullscreen ? (
              <Minimize2 className="h-4 w-4" />
            ) : (
              <Maximize2 className="h-4 w-4" />
            )}
          </button>
        </div>
      </header>

      {/* Area Tampilan Token Utama */}
      <main className="relative z-10 flex-1 flex items-center justify-center px-4 py-8 sm:px-8">
        <TokenDisplay
          token={token}
          updatedAt={updatedAt}
          status={status}
          error={error}
          onReconnect={reconnect}
        />
      </main>

      {/* Bottom Footer Info */}
      <footer className="relative z-10 w-full px-6 py-4 text-center text-xs text-slate-600 border-t border-slate-900/80 bg-black/40">
        <span>Token Display &bull; Layar Publik Real-Time &bull; Pembaruan otomatis tanpa reload</span>
      </footer>
    </div>
  )
}
