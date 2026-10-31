---
name: vamos-to-cnv-tr
description: Convert vamos output to the CNV:TR fields the view reads.
metadata:
  category: ready
  area: records
  first_move:
    'Write a converter beside scripts/trgt-to-cnv-tr.mjs that maps RU and
    ALTANNO_H1/ALTANNO_H2.'
  order: 1
---

# Records from other finders

Convert vamos output (`RU` plus `ALTANNO_H1`/`ALTANNO_H2`) to `<CNV:TR>` fields,
as `scripts/trgt-to-cnv-tr.mjs` does for TRGT's `MOTIFS` and `MS`. The view
reads only the spec's fields.
