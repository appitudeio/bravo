import type { HTMLAttributes } from 'astro/types'
import { getConfig } from '@libs/config'
import { getVersionedDocsPath } from '@libs/path'

export function getVersionedBsCssProps(direction: 'rtl' | undefined) {
  let bsCssLinkHref = '/dist/css/bootstrap'

  if (direction === 'rtl') {
    bsCssLinkHref = `${bsCssLinkHref}.rtl`
  }

  if (import.meta.env.PROD) {
    bsCssLinkHref = `${bsCssLinkHref}.min`
  }

  bsCssLinkHref = `${bsCssLinkHref}.css`

  const bsCssLinkProps: HTMLAttributes<'link'> = {
    href: getVersionedDocsPath(bsCssLinkHref),
    rel: 'stylesheet'
  }

  if (import.meta.env.PROD) {
    bsCssLinkProps.integrity = direction === 'rtl' ? getConfig().cdn.css_rtl_hash : getConfig().cdn.css_hash
  }

  return bsCssLinkProps
}

export function getVersionedBsJsProps() {
  // Use Bravo's bundle instead of Bootstrap's
  let bsJsScriptSrc = '/dist/js/bravo.bundle.umd'

  if (import.meta.env.PROD) {
    // For production, we might want to use a minified version (when available)
    // For now, use the same unminified version
    bsJsScriptSrc = '/dist/js/bravo.bundle.umd'
  }

  bsJsScriptSrc = `${bsJsScriptSrc}.js`

  const bsJsLinkProps: HTMLAttributes<'script'> = {
    src: getVersionedDocsPath(bsJsScriptSrc)
  }

  // Skip integrity check for Bravo bundle as it's built locally
  // if (import.meta.env.PROD) {
  //   bsJsLinkProps.integrity = getConfig().cdn.js_bundle_hash
  // }

  return bsJsLinkProps
}
