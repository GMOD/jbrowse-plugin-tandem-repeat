import { getConf } from '@jbrowse/core/configuration'
import UnfoldMoreIcon from '@mui/icons-material/UnfoldMore'

import { launchUnrolledView } from './launchUnrolled'
import { isTandemArrayConfig } from './unrolled'

import type { TandemArrayLocus } from './unrolled'
import type PluginManager from '@jbrowse/core/PluginManager'

interface DisplayWithView {
  parentTrack?: { configuration?: unknown }
  view?: {
    assemblyNames?: string[]
    coarseDynamicBlocks?: { refName: string; start: number; end: number }[]
    dynamicBlocks?: {
      contentBlocks?: { refName: string; start: number; end: number }[]
    }
  }
}

/**
 * The array in view, for a display whose track declares a `tandemArray` link.
 *
 * The region comes from the view rather than from a feature: an array is
 * usually wider than one drawn feature and the reader has already framed it,
 * so "what is on screen" is both the least ceremony and the least likely to be
 * wrong. `undefined` means this display has no link and gets no menu item.
 */
export function tandemArrayInView(
  self: DisplayWithView,
): TandemArrayLocus | undefined {
  const conf = self.parentTrack?.configuration
  if (!conf) {
    return undefined
  }
  let declared: unknown
  try {
    declared = getConf(self.parentTrack, 'tandemArray')
  } catch {
    return undefined
  }
  if (!isTandemArrayConfig(declared)) {
    return undefined
  }
  const block =
    self.view?.coarseDynamicBlocks?.[0] ??
    self.view?.dynamicBlocks?.contentBlocks?.[0]
  const assemblyName = self.view?.assemblyNames?.[0]
  if (!block || !assemblyName) {
    return undefined
  }
  return {
    ...declared,
    assemblyName,
    refName: block.refName,
    start: Math.floor(block.start),
    end: Math.ceil(block.end),
  }
}

/**
 * "Unroll tandem array" on any display whose track declares the link.
 *
 * Added to LinearBasicDisplay, which is what an ordinary annotation track of
 * arrays uses. Wrapped in try/catch at the registration boundary because a
 * cosmetic menu contribution must never be able to error-page the app: a throw
 * from `configure` takes the whole session down, not one track.
 */
export default function TrackMenuItemsF(pluginManager: PluginManager) {
  pluginManager.addToExtensionPoint(
    'Core-extendPluggableElement',
    (pluggableElement: unknown) => {
      const el = pluggableElement as { name?: string; stateModel?: unknown }
      if (el.name !== 'LinearBasicDisplay') {
        return pluggableElement
      }
      try {
        const stateModel = (
          el.stateModel as {
            views: (fn: (self: unknown) => unknown) => unknown
          }
        ).views((self: unknown) => {
          const display = self as {
            trackMenuItems?: () => unknown[]
          } & DisplayWithView
          const superTrackMenuItems = display.trackMenuItems?.bind(display)
          return {
            trackMenuItems() {
              const base = superTrackMenuItems?.() ?? []
              const locus = tandemArrayInView(display)
              return locus
                ? [
                    ...base,
                    {
                      label: 'Unroll tandem array',
                      icon: UnfoldMoreIcon,
                      onClick: () => {
                        launchUnrolledView(display, locus)
                      },
                    },
                  ]
                : base
            },
          }
        })
        el.stateModel = stateModel
      } catch {
        // a display shape this plugin did not expect: leave it untouched
      }
      return pluggableElement
    },
  )
}
