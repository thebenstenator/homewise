import { useState, useEffect } from 'react'

interface InstallPromptResult {
  isMobile: boolean     // any mobile browser — show the button
  isIOS: boolean        // iOS Safari — needs manual share sheet instructions
  canInstall: boolean   // Android/Chrome — native prompt is ready
  isInstalled: boolean  // already running in standalone mode
  triggerPrompt: () => void
}

export function useInstallPrompt(): InstallPromptResult {
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null)
  const [isInstalled, setIsInstalled] = useState(
    () => window.matchMedia('(display-mode: standalone)').matches
  )

  const ua = navigator.userAgent.toLowerCase()
  const isIOS = /iphone|ipad|ipod/.test(ua) && !(window as any).MSStream
  const isAndroid = /android/.test(ua)
  const isMobile = isIOS || isAndroid

  useEffect(() => {
    if (isInstalled) return

    function handleBeforeInstallPrompt(e: Event) {
      e.preventDefault()
      setDeferredPrompt(e)
    }

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt)

    const mq = window.matchMedia('(display-mode: standalone)')
    function handleStandaloneChange(e: MediaQueryListEvent) {
      if (e.matches) setIsInstalled(true)
    }
    mq.addEventListener('change', handleStandaloneChange)

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt)
      mq.removeEventListener('change', handleStandaloneChange)
    }
  }, [isInstalled])

  function triggerPrompt() {
    if (!deferredPrompt) return
    deferredPrompt.prompt()
    deferredPrompt.userChoice.then(() => setDeferredPrompt(null))
  }

  return {
    isMobile,
    isIOS,
    canInstall: !!deferredPrompt,
    isInstalled,
    triggerPrompt,
  }
}
