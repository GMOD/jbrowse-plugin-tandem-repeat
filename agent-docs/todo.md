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
- KIV-2's units are the field's subtypes: exon-1 sites 14/41/86 (transcript
  orientation) alone separate them, unit 1 = A/T/A (KIV-2A) on 7,987 of 7,991
  copies, unit 2 = G/C/T on 834 and G/C/A on 124. Every B-holding array but
  GRCh38's opens with B. Name the units in the tutorial and README, and decide
  whether the analysis ships as a script.
- Run the script on ABCA7 and on the CFHR window. If each array has one unit,
  per-copy colour is a KIV-2 story, and graphgenomeviewer's walk rows already
  tile the rest by unit.
