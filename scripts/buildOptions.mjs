/**
 * The ESM bundle JBrowse loads from an `esmUrl` plugin definition.
 *
 * Everything JBrowse re-exports to plugins is bound by core's `hostShim` to the
 * host's copy on `globalThis.JBrowseExports`: bundling a second React, MobX or
 * `@jbrowse/core` gives the plugin its own hooks and configuration registry,
 * and nothing talks to anything. The shim also fails the build on an import
 * the host does not serve by that name. `pluginName` is the plugin's `name`,
 * src/pluginName.ts, which the shim's runtime error names.
 *
 * Splitting emits any dynamic import as a content-hashed sibling chunk the
 * browser resolves relative to the plugin's own module url, which works the
 * same on the main thread and in the RPC worker.
 */
import { hostShim } from '@jbrowse/core/ReExports/hostShim'

export function buildOptions(shim = {}) {
  return {
    entryPoints: ['src/index.ts'],
    bundle: true,
    format: 'esm',
    splitting: true,
    outdir: 'dist',
    chunkNames: 'chunks/[name]-[hash]',
    jsx: 'automatic',
    metafile: true,
    plugins: [hostShim({ pluginName: 'TandemRepeat', ...shim })],
  }
}
