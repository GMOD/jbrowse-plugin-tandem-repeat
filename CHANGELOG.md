## [0.1.3](https://github.com/GMOD/jbrowse-plugin-tandem-repeat/compare/v0.1.2...v0.1.3) (2026-10-05)

### Other Changes

- Typos accepts TRGT's STRUC field ([38714dc](https://github.com/GMOD/jbrowse-plugin-tandem-repeat/commit/38714dcf82c6258876835c470501e0c270de57f7))
- Tandem-repeat-vcf.mjs splits copies whose array start mutated ([8c86ef7](https://github.com/GMOD/jbrowse-plugin-tandem-repeat/commit/8c86ef701c8047209785400f9ec5b87a08b7496c))
- Reshoot the cohort KIV-2 figure with its merged copies split ([980ec56](https://github.com/GMOD/jbrowse-plugin-tandem-repeat/commit/980ec56bdfa656b1752cb6f6541d2c42e130bad3))
- NA19043#1's short KIV-2 is read-supported; the units are KIV-2A and B by exon 1 ([8d08b72](https://github.com/GMOD/jbrowse-plugin-tandem-repeat/commit/8d08b72cb60e7a61b8a938a5bf369d0412b811d5))
- Tandem-repeat-vcf.mjs --sites reports where the units differ inside named intervals ([bed79fd](https://github.com/GMOD/jbrowse-plugin-tandem-repeat/commit/bed79fdb2c30e49097579778f1e1329077047ea7))
- Squeezed rows sort by copies of the rarest unit, then longest ([8ae4906](https://github.com/GMOD/jbrowse-plugin-tandem-repeat/commit/8ae4906e088ea5bd2cacc885793d5b6c807caf24))
- Prettier formats the squeezed-order code ([2d0f420](https://github.com/GMOD/jbrowse-plugin-tandem-repeat/commit/2d0f42083fa68a90554f0fd7e7f80647208e8a4e))
- The cohort figure sorts unit 2 carriers first, and --sites names KIV-2B ([e3f65fb](https://github.com/GMOD/jbrowse-plugin-tandem-repeat/commit/e3f65fb7ac82e27a84ed52f61f854e58fc7681b8))

## [0.1.2](https://github.com/GMOD/jbrowse-plugin-tandem-repeat/compare/v0.1.1...v0.1.2) (2026-10-04)

### Other Changes

- Figures take --width, for the plugin store's 800 px card ([259e9aa](https://github.com/GMOD/jbrowse-plugin-tandem-repeat/commit/259e9aac18830b35090230b9881678803933a739))
- Tandem-repeat-vcf.mjs moves here from graphgenomeviewer; figures boot a candidate config ([33657e2](https://github.com/GMOD/jbrowse-plugin-tandem-repeat/commit/33657e2b2ff4c969cab3b07bf27f2b6905d2321e))
- Scripts/trgt-to-cnv-tr.mjs rewrites a TRGT VCF as <CNV:TR> records ([2266907](https://github.com/GMOD/jbrowse-plugin-tandem-repeat/commit/22669073765d121d293e0febdcd98ff78cc43198))
- Trgt-to-cnv-tr.mjs folds the bases between TRGT's MS spans into the run before them ([2cd5fce](https://github.com/GMOD/jbrowse-plugin-tandem-repeat/commit/2cd5fce0eed347407866a7292d5b82a8a32c7b36))
- README records why vamos isn't the KIV-2 finder; a todo takes the graph handoff's open items ([5e719f3](https://github.com/GMOD/jbrowse-plugin-tandem-repeat/commit/5e719f3b486117109aa9fcfd7c442f112e133389))
- The vamos report waits on whether it's worth filing ([946ffa5](https://github.com/GMOD/jbrowse-plugin-tandem-repeat/commit/946ffa5d9ab5738837129ccdbff495f52cdb7d37))
- The VcfFeature note says what is actually off, the SVLEN fallback's end ([d07ca66](https://github.com/GMOD/jbrowse-plugin-tandem-repeat/commit/d07ca6675d93c8fc9b57daae92c38bcd421d482e))
- The VcfFeature SVLEN end is fixed upstream (jbrowse-components ff33abe30b) ([76c60e6](https://github.com/GMOD/jbrowse-plugin-tandem-repeat/commit/76c60e6ee44f92024a72a881fee9b96b0549c138))
- Tandem-repeat-vcf.mjs clusters a whole-cohort cut in seconds ([1683238](https://github.com/GMOD/jbrowse-plugin-tandem-repeat/commit/168323867f6e48217cc3369b5479898b4f883801))
- Tandem-repeat-vcf.mjs takes a unit's RUS from copies of typical length ([fbdadc5](https://github.com/GMOD/jbrowse-plugin-tandem-repeat/commit/fbdadc5e9a71fbcbaab38382f4e0a65222efa627))
- Show repeat copies squashes a cohort's rows into the view's height ([a8f83fc](https://github.com/GMOD/jbrowse-plugin-tandem-repeat/commit/a8f83fcc429d858ad9aeb1672db209a5f54712c6))
- The cohort KIV-2 record waits on hosting; its merged copies stay open ([4713750](https://github.com/GMOD/jbrowse-plugin-tandem-repeat/commit/47137501bdfdf211c5e9eb30516814097e49b590))
- Show repeat copies sorts a squashed cohort longest first ([5a7ad07](https://github.com/GMOD/jbrowse-plugin-tandem-repeat/commit/5a7ad07e5be00193c69703ab93d59c9d292b016d))
- The cohort KIV-2 record gets a figure and a README paragraph ([32e8390](https://github.com/GMOD/jbrowse-plugin-tandem-repeat/commit/32e839058f0a640dc274456ddd92c62534a326d9))

## [0.1.1](https://github.com/GMOD/jbrowse-plugin-tandem-repeat/compare/...v0.1.1) (2026-09-28)

### Other Changes

- Copy-index axis and unrolled array ideas, before any plugin entry ([dbf01b9](https://github.com/GMOD/jbrowse-plugin-tandem-repeat/commit/dbf01b9a1bb0cc91a7a174b90b71fb17f79e4106))
- Tooling from graphgenomeviewer: published core, lockfile, CI, tag-driven publish ([e2ed9f8](https://github.com/GMOD/jbrowse-plugin-tandem-repeat/commit/e2ed9f850585a5db65d6b875b6ac4fc7100a25bf))
- A view of a <CNV:TR> record's alleles, opened from a variant's right-click menu ([e49fe6f](https://github.com/GMOD/jbrowse-plugin-tandem-repeat/commit/e49fe6fe11688d213441762f59b4b8a387d67ad8))
- MIT, as the scaffold's package.json said and the sibling plugins are ([7e9c0bb](https://github.com/GMOD/jbrowse-plugin-tandem-repeat/commit/7e9c0bbf214ce82c9b7609c3010004c4494c4017))

