export function thumbtackUrl(category: string, zipCode: string) {
  return `https://www.thumbtack.com/k/${category}/near-me/?zip=${zipCode}&utm_source=homewise&utm_medium=referral`
}

export function angiUrl(category: string, zipCode: string) {
  const zip = zipCode ? `&zip=${zipCode}` : ''
  return `https://www.angi.com/nearme/${category}/?utm_source=homewise&utm_medium=referral${zip}`
}

function trackFindProClick(destination: 'thumbtack' | 'angi') {
  // Plausible custom event — fires only if the analytics script is loaded
  if (typeof window !== 'undefined' && (window as any).plausible) {
    ;(window as any).plausible('find-pro-click', { props: { destination } })
  }
}

export function openAffiliate(url: string, destination?: 'thumbtack' | 'angi') {
  if (destination) trackFindProClick(destination)
  window.open(url, '_blank', 'noopener,noreferrer')
}
