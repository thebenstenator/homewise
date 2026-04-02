export function thumbtackUrl(category: string, zipCode: string) {
  return `https://www.thumbtack.com/k/${category}/near-me/?zip=${zipCode}&utm_source=homewise&utm_medium=referral`
}

export function angiUrl(category: string, zipCode: string) {
  return `https://www.angi.com/companylist/${category}/${zipCode}/?utm_source=homewise&utm_medium=referral`
}

export function openAffiliate(url: string) {
  window.open(url, '_blank', 'noopener,noreferrer')
}
