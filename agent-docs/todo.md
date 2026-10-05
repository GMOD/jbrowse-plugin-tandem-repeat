# Todo

## Records from other finders

- Convert vamos output (`RU` plus `ALTANNO_H1`/`ALTANNO_H2`) to `<CNV:TR>`
  fields, as `scripts/trgt-to-cnv-tr.mjs` does for TRGT's `MOTIFS` and `MS`. The
  view reads only the spec's fields.
- Report vamos's silent last-record choice to its authors (README, "Writing a
  record from a graph"), if it's worth filing.

## Records from a graph

- NA19043#1 reaches both flanks of KIV-2 with one 3 kb copy, shorter than any
  unit; check whether its assembly is broken there before reading it as a
  one-copy allele.
- Run the script on ABCA7 and on the CFHR window. If each array has one unit,
  per-copy colour is a KIV-2 story, and graphgenomeviewer's walk rows already
  tile the rest by unit.
