// The file this view reads, and why it is a plain fetch rather than an adapter.
//
// A tandem array decomposition is tiny -- one record per copy, so a 30-copy
// array in four haplotypes is 85 rows and a few kilobytes. There is nothing to
// range-query and no region to key on, because the whole point of this view is
// that its axis is NOT a genome coordinate. Putting it behind a tabix adapter
// would buy nothing and would force a refName the data does not have.
//
// Producing one is offline work: decompose an array into copies (map a
// consensus unit back onto each haplotype's own sequence and take the
// contiguous run of hits one period apart), then write the rows below. That
// step needs an aligner and the assemblies, neither of which belongs in a
// browser.

export interface TandemCopy {
  /** 1-based position along this haplotype's array. NOT a homology statement. */
  index: number
  /** Identity to the consensus unit, 0-1, when the producer measured it. */
  identity?: number
  /** Free-text class, drawn as a colour if the file supplies a palette. */
  class?: string
}

export interface TandemArrayRow {
  /** Haplotype or sample this array belongs to. */
  label: string
  /** Where this array sits in its own assembly, for the round trip out. */
  locus?: {
    assemblyName: string
    refName: string
    start: number
    end: number
  }
  copies: TandemCopy[]
}

export interface TandemArrayFile {
  /** Locus name, e.g. "LPA KIV-2". Shown as the view's subject. */
  name: string
  /** Repeat unit length in bp. Reported, never used as an axis. */
  unitLength: number
  /** Optional per-class colours, keyed by `TandemCopy.class`. */
  palette?: Record<string, string>
  rows: TandemArrayRow[]
}

export function isTandemArrayFile(v: unknown): v is TandemArrayFile {
  if (typeof v !== 'object' || v === null) {
    return false
  }
  const f = v as Record<string, unknown>
  return (
    typeof f.name === 'string' &&
    typeof f.unitLength === 'number' &&
    Array.isArray(f.rows) &&
    f.rows.every(r => {
      const row = r as Record<string, unknown>
      return typeof row.label === 'string' && Array.isArray(row.copies)
    })
  )
}

/**
 * Longest array in the file, which is the axis extent.
 *
 * The axis is copy index and every row starts at 1, so the only thing that
 * varies is where a row stops -- which is the measurement this view exists to
 * show. Deliberately not padded to a round number: a row that ends at 29 should
 * end at 29, not at a tick.
 */
export function maxCopies(file: TandemArrayFile) {
  return Math.max(1, ...file.rows.map(r => r.copies.length))
}

/**
 * Tick positions for the copy axis: 1, then every `step`, then the maximum.
 *
 * `step` scales with the count so a 6-copy array and a 200-copy one both get a
 * readable number of ticks. Whole copies only -- there is no such thing as copy
 * 2.5, and a fractional tick is exactly the reference-coordinate reflex this
 * axis exists to avoid.
 */
export function copyAxisTicks(max: number) {
  const step = max <= 12 ? 1 : max <= 40 ? 5 : max <= 120 ? 10 : 25
  const ticks: number[] = []
  for (let i = 1; i <= max; i += step) {
    ticks.push(i)
  }
  if (ticks.at(-1) !== max) {
    ticks.push(max)
  }
  return ticks
}
