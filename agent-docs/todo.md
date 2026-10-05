# Todo

## Records from other finders

- Convert vamos output (`RU` plus `ALTANNO_H1`/`ALTANNO_H2`) to `<CNV:TR>`
  fields, as `scripts/trgt-to-cnv-tr.mjs` does for TRGT's `MOTIFS` and `MS`. The
  view reads only the spec's fields.
- Report vamos's silent last-record choice to its authors (README, "Writing a
  record from a graph"), if it's worth filing.

## Records from a graph

- NA19043#1's KIV-2 is a single 3,019 bp copy: the first 3 kb of a unit, both
  exons exact, the intron cut short. It is real, not an assembly error: HiFi
  Flagger flags nothing within 100 kb, and 28 MAPQ>=20 HiFi reads span it with
  no insertion over 3 bp.
- Decided against (2026-10-04) running the script on ABCA7, CFHR or AMY1: at
  ABCA7's 51 bp motif, 1% k-mer clustering gives each SNP a unit of its own, and
  CFHR and amylase are structural haplotypes the graph's walk rows and lanes
  already draw. Per-copy colour is a KIV-2 story.
