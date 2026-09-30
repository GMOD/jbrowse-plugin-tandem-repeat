import { tandemRepeatOf } from './tandemRepeat'
import { convertRecord } from '../scripts/trgt-to-cnv-tr.mjs'

const allele = (a: number, b: number) =>
  'CAG'.repeat(a) + 'CAACAG' + 'CCG'.repeat(b)
const ref = `G${allele(10, 7)}`
const alt1 = `G${allele(17, 9)}`
const alt2 = `G${allele(24, 9)}`

function record(columns: string[]) {
  return [
    'chr4',
    '3074877',
    '.',
    ref,
    `${alt1},${alt2}`,
    '.',
    '.',
    'TRID=HTT;END=3074933;MOTIFS=CAG,CCG',
    ...columns,
  ].join('\t')
}

function feature(line: string) {
  const f = line.split('\t')
  const info = Object.fromEntries(
    f[7]!.split(';').map(kv => {
      const [key, value = ''] = kv.split('=')
      return [key, value.split(',')]
    }),
  )
  const keys = f[8]!.split(':')
  return {
    refName: f[0]!,
    start: Number(f[1]) - 1,
    end: Number(f[1]),
    name: f[2]!,
    ALT: f[4]!.split(','),
    INFO: info,
    samples: Object.fromEntries(
      f
        .slice(9)
        .map((s, i) => [
          `S${i + 1}`,
          Object.fromEntries(s.split(':').map((v, k) => [keys[k], [v]])),
        ]),
    ),
  }
}

test("a TRGT record's MS spans become the runs of each allele", () => {
  const { line } = convertRecord(
    record([
      'GT:AL:MC:MS',
      '1/2:84,105:17_9,24_9:0(0-51)_1(57-84),0(0-72)_1(78-105)',
      '0/1:57,84:10_7,17_9:0(0-30)_1(36-57),0(0-51)_1(57-84)',
    ]),
  )
  const f = line!.split('\t')
  expect(f[3]).toBe('G')
  expect(f[4]).toBe('<CNV:TR>,<CNV:TR>')
  expect(f[7]).toContain('SVLEN=57,57;RN=2,2;RUS=CAG,CCG,CAG,CCG;RUL=3,3,3,3')
  expect(f[7]).toContain('RUC=17,9,24,9;RB=51,27,72,27')
  const repeat = tandemRepeatOf(feature(line!))!
  expect(repeat.units.map(u => [u.sequence, u.copies])).toEqual([
    ['CAG', 41],
    ['CCG', 18],
  ])
  expect(repeat.alleles.map(a => [a.label, a.bp])).toEqual([
    ['S1 (1)', 78],
    ['S1 (2)', 99],
    ['S2 (1)', 57],
    ['S2 (2)', 78],
  ])
})

test('without MS, a locus of one motif states one run of it', () => {
  const single = (bp: number) => `G${'CCCCGTGAGC'.repeat(bp / 10)}`
  const { line } = convertRecord(
    [
      'chr19',
      '100',
      '.',
      single(100),
      `${single(250)},${single(40)}`,
      '.',
      '.',
      'TRID=VNTR;END=200;MOTIFS=CCCCGTGAGC',
      'GT:AL',
      '1/2:250,40',
    ].join('\t'),
  )
  const f = line!.split('\t')
  expect(f[7]).toContain('RN=1,1;RUS=CCCCGTGAGC,CCCCGTGAGC')
  expect(f[7]).toContain('RUC=25,4;RB=250,40')
  expect(f[2]).toBe('VNTR')
})

test('a locus of several motifs with no MS is skipped', () => {
  expect(convertRecord(record(['GT:AL', '1/2:84,105']))).toEqual({
    skipped: 'alleles state no runs (2 motifs, no MS)',
  })
})

test('a record with no ALT allele is skipped', () => {
  const line = [
    'chr4',
    '10',
    '.',
    'GCAG',
    '.',
    '.',
    '.',
    'TRID=X;MOTIFS=CAG',
    'GT',
    '0/0',
  ].join('\t')
  expect(convertRecord(line)).toEqual({ skipped: 'no ALT allele' })
})
