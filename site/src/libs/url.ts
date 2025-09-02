/**
 * Get a URL with the correct base path for internal navigation
 * This ensures links work both locally and on GitHub Pages
 */
export function getUrl(path: string): string {
  // Remove leading slash if present to avoid double slashes
  const cleanPath = path.startsWith('/') ? path.slice(1) : path
  
  // Get base URL from environment (e.g., '/bravo' for GitHub Pages)
  const base = import.meta.env.BASE_URL || ''
  
  // For absolute URLs or external links, return as-is
  if (cleanPath.startsWith('http://') || cleanPath.startsWith('https://') || cleanPath.startsWith('//')) {
    return path
  }
  
  // Combine base path with the requested path
  return cleanPath ? (base ? `${base}/${cleanPath}` : `/${cleanPath}`) : (base || '/')
}

/**
 * Check if a URL is the current active page
 */
export function isActive(currentPath: string, linkPath: string): boolean {
  const base = import.meta.env.BASE_URL || ''
  const fullLinkPath = linkPath.startsWith('/') ? linkPath : `/${linkPath}`
  const fullCurrentPath = currentPath.startsWith('/') ? currentPath : `/${currentPath}`
  
  // Remove base path for comparison if present
  const cleanCurrentPath = base && fullCurrentPath.startsWith(base) 
    ? fullCurrentPath.slice(base.length) 
    : fullCurrentPath
  
  const cleanLinkPath = base && fullLinkPath.startsWith(base)
    ? fullLinkPath.slice(base.length)
    : fullLinkPath
    
  return cleanCurrentPath === cleanLinkPath
}