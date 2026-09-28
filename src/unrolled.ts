// What an "unrolled" tandem array is, and where the two halves of it live.
//
// A tandem array has no useful reference coordinate past the copies the
// reference happens to carry: GRCh38 holds six copies of the LPA KIV-2 unit
// where a real haplotype holds twenty to thirty, so four fifths of the array
// has nowhere to be drawn on it. The coordinate system that does work is
// (position within the repeat unit, which copy), and the first half of that is
// an ordinary genome axis one unit long.
//
// So an unrolled array is two things that already exist in JBrowse: an assembly
// whose single contig IS the repeat unit, and a track of one alignment per copy
// against it. This plugin does not create either. It records the link between
// an array's position on a real assembly and the unit assembly that unrolls it,
// so a reader can get from one to the other without knowing the config.

/** Declared on a track config as `tandemArray`. */
export interface TandemArrayConfig {
  /** Assembly whose single contig is one copy of the repeat unit. */
  unitAssembly: string
  /** Track of one alignment per copy, on `unitAssembly`. */
  copiesTrackId: string
  /**
   * Read-group tag to section the copies by, almost always the haplotype the
   * copy came from. Sections are what make copy number readable as height.
   */
  groupTag?: string
}

export interface TandemArrayLocus extends TandemArrayConfig {
  assemblyName: string
  refName: string
  start: number
  end: number
  /** Feature name, when the array came from a feature rather than a region. */
  name?: string
}

export function isTandemArrayConfig(
  value: unknown,
): value is TandemArrayConfig {
  if (typeof value !== 'object' || value === null) {
    return false
  }
  const v = value as Record<string, unknown>
  return (
    typeof v.unitAssembly === 'string' &&
    v.unitAssembly.length > 0 &&
    typeof v.copiesTrackId === 'string' &&
    v.copiesTrackId.length > 0
  )
}

/**
 * The session spec for the unrolled view: the whole unit, every copy, sectioned
 * by haplotype.
 *
 * The whole unit and not a sub-window because a copy is only interpretable
 * against the entire unit — a partial view of one is a partial view of all of
 * them at once, which is never what is wanted.
 */
export function unrolledViewSpec(locus: TandemArrayLocus) {
  const groupTag = locus.groupTag ?? 'RG'
  return {
    type: 'LinearGenomeView' as const,
    assembly: locus.unitAssembly,
    tracks: [
      {
        trackId: locus.copiesTrackId,
        type: 'LinearAlignmentsDisplay',
        groupBy: { type: 'tag', tag: groupTag },
        colorBy: { type: 'tag', tag: groupTag },
      },
    ],
  }
}

/**
 * How the unrolled view must be read, shown where it is launched.
 *
 * Not a footnote. Arrays expand and contract by unequal crossing over, so the
 * nth copy of one haplotype is not homologous to the nth copy of another, and
 * two sections stacked vertically invite exactly that comparison. Row order is
 * position along one haplotype's array and nothing more. The same distinction
 * the HPRC pangenome docs draw between attribution and carriage, one level
 * down: here it is order versus homology.
 */
export const ORDER_NOT_HOMOLOGY =
  'Rows are copies in array order within each haplotype. Copy N of one ' +
  'haplotype is not homologous to copy N of another, so read down a section, ' +
  'not across two.'
