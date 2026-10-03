# Todo

## Records from other finders

- Convert vamos output (`RU` plus `ALTANNO_H1`/`ALTANNO_H2`) to `<CNV:TR>`
  fields, as `scripts/trgt-to-cnv-tr.mjs` does for TRGT's `MOTIFS` and `MS`. The
  view reads only the spec's fields.
- Report vamos's silent last-record choice to its authors (README, "Writing a
  record from a graph"), if it's worth filing.

## Records from a graph

- The whole HPRC panel at KIV-2: `scripts/tandem-repeat-vcf.mjs` compares every
  distinct copy with every other, so all 464 haplotypes need sketches first.
- Run the script on ABCA7 and on the CFHR window. If each array has one unit,
  per-copy colour is a KIV-2 story, and graphgenomeviewer's walk rows already
  tile the rest by unit.

## Upstream

- jbrowse-components: `VcfFeature` places a symbolic allele from POS − 1 to
  start + SVLEN, one base left of the spec's span. `tandemRepeatOf` in
  `src/tandemRepeat.ts` shifts its start by one to compensate.
