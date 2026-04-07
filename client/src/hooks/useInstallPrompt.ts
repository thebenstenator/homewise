import { useState, useEffect } from 'react'

interface InstallPromptResult {
  canInstall: boolean   // Android/Chrome — deferred prompt available
  isIOS: boolean        // iOS Safari — needs manual share sheet instructions
  isInstalled: boolean  // already running in standalone mode
  triggerPrompt: () => void
}

export function useInstallPrompt(): InstallPromptResult {
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null)
  const [isInstalled, setIsInstalled] = useState(
    () => window.matchMedia('(display-mode: standalone)').matches
  )

  const isIOS = /iphone|ipad|ipod/i.test(navigator.userAgent.toLowerCase()) &&
    !(window as any).MSStream

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
  }, [isInstalled, isIOS])

  function triggerPrompt() {
    if (!deferredPrompt) return
    deferredPrompt.prompt()
    deferredPrompt.userChoice.then(() => setDeferredPrompt(null))
  }

  return {
    canInstall: !!deferredPrompt,
    isIOS,
    isInstalled,
    triggerPrompt,
  }
}
