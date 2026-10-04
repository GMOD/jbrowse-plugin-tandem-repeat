# Todo

## Records from other finders

- Convert vamos output (`RU` plus `ALTANNO_H1`/`ALTANNO_H2`) to `<CNV:TR>`
  fields, as `scripts/trgt-to-cnv-tr.mjs` does for TRGT's `MOTIFS` and `MS`. The
  view reads only the spec's fields.
- Report vamos's silent last-record choice to its authors (README, "Writing a
  record from a graph"), if it's worth filing.

## Records from a graph

- Host the whole HPRC panel's KIV-2 record (464 haplotypes, ~20 s from the
  cohort cut) beside or in place of the eight-haplotype one, and reshoot.
- Seven HPRC KIV-2 copies span two or three units (11.1-16.6 kb) where the array
  start mutated, and each counts as one copy; the script warns only of the
  longest. Splitting such a copy needs a second probe, e.g. the array start's
  last 24 bases. NA19043#1 reaches both flanks with one 3 kb copy.
- Run the script on ABCA7 and on the CFHR window. If each array has one unit,
  per-copy colour is a KIV-2 story, and graphgenomeviewer's walk rows already
  tile the rest by unit.
