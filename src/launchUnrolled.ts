import { getSession } from '@jbrowse/core/util'

import { ORDER_NOT_HOMOLOGY, unrolledViewSpec } from './unrolled'

import type { TandemArrayLocus } from './unrolled'
import type { AbstractSessionModel } from '@jbrowse/core/util'

interface SessionWithViews extends AbstractSessionModel {
  addView: (typeName: string, initialState: Record<string, unknown>) => unknown
}

function hasAddView(session: unknown): session is SessionWithViews {
  return typeof (session as SessionWithViews | undefined)?.addView === 'function'
}

/**
 * Open the unrolled view for an array.
 *
 * Notifies rather than throws on a bad link. A menu item should never be able
 * to cost a user their session, and every failure here is a config mistake
 * (a unit assembly that was never added, a copies track that was renamed)
 * whose only useful outcome is telling the reader which name is missing.
 */
export function launchUnrolledView(model: unknown, locus: TandemArrayLocus) {
  const session = getSession(model as Parameters<typeof getSession>[0])
  if (!hasAddView(session)) {
    return
  }
  const known = new Set(session.assemblyNames ?? [])
  if (known.size > 0 && !known.has(locus.unitAssembly)) {
    session.notify(
      `No assembly named "${locus.unitAssembly}" is loaded, so this array ` +
        `cannot be unrolled. It is the assembly whose single contig is one ` +
        `copy of the repeat unit.`,
      'warning',
    )
    return
  }
  session.addView('LinearGenomeView', {
    ...unrolledViewSpec(locus),
    displayName: locus.name
      ? `${locus.name} unrolled`
      : `${locus.refName}:${locus.start}-${locus.end} unrolled`,
  })
  session.notify(ORDER_NOT_HOMOLOGY, 'info')
}

/**
 * Open the array's own locus on the assembly it sits on, from the unrolled
 * view. The return leg: a unit coordinate means nothing outside the unit, so
 * without this the unrolled view is a dead end.
 */
export function launchArrayLocus(model: unknown, locus: TandemArrayLocus) {
  const session = getSession(model as Parameters<typeof getSession>[0])
  if (!hasAddView(session)) {
    return
  }
  session.addView('LinearGenomeView', {
    type: 'LinearGenomeView',
    assembly: locus.assemblyName,
    loc: `${locus.refName}:${locus.start + 1}-${locus.end}`,
  })
}
