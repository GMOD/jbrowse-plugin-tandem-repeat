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

- jbrowse-components: `getEnd` in `plugins/variants/src/VcfFeature/util.ts` ends
  a symbolic allele with no END at start + |SVLEN|, one base short of the END =
  POS + |SVLEN| the spec gives (its `<DEL>` example: POS 321682, SVLEN -205, END
  321887). The same record ends one base later when it states END. Minor, and
  `index.test.ts` pins the current 599 for POS 100, SVLEN 500. `tandemRepeatOf`
  doesn't depend on it: it drops the padding base and measures by SVLEN itself.
