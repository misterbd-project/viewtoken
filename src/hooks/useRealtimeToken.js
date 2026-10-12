import { useState, useEffect, useRef, useCallback } from 'react'
import { supabase, isSupabaseConfigured } from '../lib/supabase'

/**
 * Custom hook untuk mengelola state dan langganan real-time token dari Supabase
 * Memenuhi syarat:
 * - Fetch awal
 * - Realtime Postgres Changes subscription
 * - Anti-race condition (fetch lama tidak menimpa data realtime baru)
 * - Auto-reconnect & resync saat jaringan pulih
 * - Unsubscribe bersih saat unmount
 */
export function useRealtimeToken() {
  const [token, setToken] = useState(null)
  const [updatedAt, setUpdatedAt] = useState(null)
  const [status, setStatus] = useState(
    isSupabaseConfigured ? 'connecting' : 'unconfigured'
  )
  const [error, setError] = useState(
    isSupabaseConfigured
      ? null
      : 'Supabase belum dikonfigurasi. Silakan periksa file .env dan Vercel Environment Variables.'
  )
  const [isLoading, setIsLoading] = useState(isSupabaseConfigured)

  // Melacak timestamp update terbaru (ms) untuk mencegah race condition
  const latestTimestampRef = useRef(0)
  const channelRef = useRef(null)
  const isMountedRef = useRef(true)
  const retryTimeoutRef = useRef(null)

  // Fungsi untuk memperbarui state token jika timestamp-nya lebih baru atau sama
  const applyTokenUpdate = useCallback((newToken, newUpdatedAt) => {
    if (!newUpdatedAt) {
      if (isMountedRef.current) {
        setToken(newToken)
        setUpdatedAt(null)
      }
      return
    }

    const itemTime = new Date(newUpdatedAt).getTime()

    // Cegah fetch lama menimpa data realtime yang lebih baru
    if (itemTime >= latestTimestampRef.current) {
      latestTimestampRef.current = itemTime
      if (isMountedRef.current) {
        setToken(newToken)
        setUpdatedAt(newUpdatedAt)
        setError(null)
      }
    }
  }, [])

  // Fungsi fetch token awal dari database
  const fetchCurrentToken = useCallback(async () => {
    if (!isSupabaseConfigured || !supabase) return

    try {
      const { data, error: fetchErr } = await supabase
        .from('active_token')
        .select('id, token, updated_at')
        .eq('id', 1)
        .maybeSingle()

      if (fetchErr) {
        throw fetchErr
      }

      if (data) {
        applyTokenUpdate(data.token, data.updated_at)
      } else {
        if (isMountedRef.current) {
          setToken(null)
          setUpdatedAt(null)
        }
      }
    } catch (err) {
      if (isMountedRef.current) {
        console.error('Error fetching token:', err)
        setError('Gagal memuat token dari server: ' + (err.message || 'Kesalahan jaringan'))
      }
    } finally {
      if (isMountedRef.current) {
        setIsLoading(false)
      }
    }
  }, [applyTokenUpdate])

  // Setup subscription ref untuk memfasilitasi rekursi/reconnect yang bersih
  const setupSubscriptionRef = useRef(null)

  const setupSubscription = useCallback(() => {
    if (!isSupabaseConfigured || !supabase) return

    // Bersihkan channel sebelumnya jika ada
    if (channelRef.current) {
      supabase.removeChannel(channelRef.current)
      channelRef.current = null
    }

    if (isMountedRef.current) {
      setStatus('connecting')
    }

    // Buat channel subscription khusus tabel active_token
    const channel = supabase
      .channel('public:active_token:changes')
      .on(
        'postgres_changes',
        {
          event: '*', // Tangani INSERT dan UPDATE
          schema: 'public',
          table: 'active_token'
        },
        (payload) => {
          if (payload.new && (payload.new.id === 1 || payload.new.id === '1')) {
            applyTokenUpdate(payload.new.token, payload.new.updated_at)
          }
        }
      )
      .subscribe((subscribeStatus) => {
        if (!isMountedRef.current) return

        if (subscribeStatus === 'SUBSCRIBED') {
          setStatus('connected')
          setError(null)
        } else if (subscribeStatus === 'CLOSED') {
          setStatus('disconnected')
        } else if (subscribeStatus === 'CHANNEL_ERROR' || subscribeStatus === 'TIMED_OUT') {
          setStatus('disconnected')
          setError('Koneksi real-time terputus. Mencoba menghubungkan kembali...')

          if (retryTimeoutRef.current) {
            clearTimeout(retryTimeoutRef.current)
          }

          retryTimeoutRef.current = setTimeout(() => {
            if (isMountedRef.current && setupSubscriptionRef.current) {
              setupSubscriptionRef.current()
              fetchCurrentToken()
            }
          }, 3000)
        }
      })

    channelRef.current = channel
  }, [applyTokenUpdate, fetchCurrentToken])

  // Simpan referensi fungsi setup subscription
  useEffect(() => {
    setupSubscriptionRef.current = setupSubscription
  }, [setupSubscription])

  useEffect(() => {
    isMountedRef.current = true

    let isSubscribed = true

    if (isSupabaseConfigured && supabase) {
      supabase
        .from('active_token')
        .select('id, token, updated_at')
        .eq('id', 1)
        .maybeSingle()
        .then(({ data, error: fetchErr }) => {
          if (!isSubscribed) return
          if (fetchErr) {
            setError('Gagal memuat token dari server: ' + (fetchErr.message || 'Kesalahan jaringan'))
          } else if (data) {
            applyTokenUpdate(data.token, data.updated_at)
          }
          setIsLoading(false)
        })

      setupSubscription()
    }

    // Listener browser online/offline untuk auto-reconnect
    const handleOnline = () => {
      if (isSupabaseConfigured) {
        fetchCurrentToken()
        setupSubscription()
      }
    }

    const handleOffline = () => {
      setStatus('disconnected')
      setError('Koneksi internet Anda terputus.')
    }

    window.addEventListener('online', handleOnline)
    window.addEventListener('offline', handleOffline)

    // Cleanup saat unmount
    return () => {
      isSubscribed = false
      isMountedRef.current = false
      window.removeEventListener('online', handleOnline)
      window.removeEventListener('offline', handleOffline)

      if (retryTimeoutRef.current) {
        clearTimeout(retryTimeoutRef.current)
      }

      if (channelRef.current && supabase) {
        supabase.removeChannel(channelRef.current)
        channelRef.current = null
      }
    }
  }, [applyTokenUpdate, fetchCurrentToken, setupSubscription])

  // Fungsi manual retry
  const reconnect = useCallback(() => {
    if (!isSupabaseConfigured) return
    setError(null)
    setStatus('connecting')
    fetchCurrentToken()
    setupSubscription()
  }, [fetchCurrentToken, setupSubscription])

  return {
    token,
    updatedAt,
    status, // 'connected' | 'connecting' | 'disconnected' | 'unconfigured'
    error,
    isLoading,
    reconnect,
    refetch: fetchCurrentToken,
    isConfigured: isSupabaseConfigured
  }
}
