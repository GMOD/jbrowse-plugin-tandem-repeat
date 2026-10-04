#!/usr/bin/env node
//
// Opens the hosted HPRC demo on a released JBrowse with this checkout's dist/
// standing in for the published bundle, right-clicks a repeat record, chooses
// the menu item, and shoots the view it opens. Every figure in img/ comes from
// here.
//
//   node scripts/shoot-figures.mjs [kiv2_copies ...] [--version main] [--out img]
//     [--width 1400] [--config candidate.json] [--store]
//
// --config serves a local file as the demo config, to boot a candidate before
// deploying it; a config that does not name this plugin gets a plugins entry.
// --store loads the published bundle rather than the local dist.
import fs from 'node:fs'
import path from 'node:path'
import { parseArgs } from 'node:util'

import puppeteer from 'puppeteer'

const CONFIG = 'https://jbrowse.org/demos/hprc/config.json'
const PLUGIN_BASE =
  'https://jbrowse.org/plugins/jbrowse-plugin-tandem-repeat/latest/dist/'
const DIST = path.resolve('dist')

const FIGURES = {
  kiv2_copies: {
    loc: 'chr6:160,596,000-160,666,000',
    trackId: 'hprc_kiv2_copies',
    display: 'LinearVariantDisplay',
    at: 160631000,
  },
  kiv2_copies_all: {
    loc: 'chr6:160,596,000-160,666,000',
    trackId: 'hprc_kiv2_copies_all',
    display: 'LinearVariantDisplay',
    at: 160631000,
  },
  kiv2_copies_multisample: {
    loc: 'chr6:160,596,000-160,666,000',
    trackId: 'hprc_kiv2_copies',
    display: 'LinearMultiSampleVariantDisplay',
    at: 160631000,
  },
}

const { values, positionals } = parseArgs({
  allowPositionals: true,
  options: {
    version: { type: 'string', default: 'main' },
    out: { type: 'string', default: 'img' },
    // the plugin store's cards want an 800 px image
    width: { type: 'string', default: '1400' },
    config: { type: 'string' },
    store: { type: 'boolean', default: false },
  },
})

const sleep = ms => new Promise(r => setTimeout(r, ms))

const config = values.config
  ? JSON.parse(fs.readFileSync(values.config, 'utf8'))
  : await (await fetch(CONFIG)).json()
if (!config.plugins?.some(p => p.name === 'TandemRepeat')) {
  config.plugins = [
    ...(config.plugins ?? []),
    {
      name: 'TandemRepeat',
      esmUrl: `${PLUGIN_BASE}jbrowse-plugin-tandem-repeat.esm.js`,
    },
  ]
}
const configBody = Buffer.from(JSON.stringify(config))

function bodyFor(url) {
  if (url.split('?')[0] === CONFIG) {
    return { body: configBody, type: 'application/json' }
  }
  if (!values.store && url.startsWith(PLUGIN_BASE)) {
    const file = path.join(DIST, url.slice(PLUGIN_BASE.length).split('?')[0])
    return fs.existsSync(file)
      ? { body: fs.readFileSync(file), type: 'application/javascript' }
      : undefined
  }
  return undefined
}

// CDP Fetch on the page and each worker, since the RPC worker imports the
// plugin too and page.setRequestInterception never resumes a worker's requests
async function serveOn(client) {
  client.on('Fetch.requestPaused', async ({ requestId, request }) => {
    const answer = bodyFor(request.url)
    await (
      answer
        ? client.send('Fetch.fulfillRequest', {
            requestId,
            responseCode: 200,
            responseHeaders: [
              { name: 'Content-Type', value: answer.type },
              { name: 'Access-Control-Allow-Origin', value: '*' },
            ],
            body: answer.body.toString('base64'),
          })
        : client.send('Fetch.continueRequest', { requestId })
    ).catch(() => {})
  })
  await client.send('Fetch.enable', {
    patterns: [{ urlPattern: `${CONFIG}*` }, { urlPattern: `${PLUGIN_BASE}*` }],
  })
}

async function shoot(browser, name, figure) {
  const page = await browser.newPage()
  await page.setViewport({ width: Number(values.width), height: 900 })
  const errors = []
  page.on('pageerror', e => errors.push(String(e)))
  page.on('workercreated', w => {
    serveOn(w.client).catch(() => {})
  })
  await serveOn(await page.createCDPSession())
  const session = {
    views: [
      {
        type: 'LinearGenomeView',
        assembly: 'hg38',
        loc: figure.loc,
        tracks: [{ trackId: figure.trackId, type: figure.display }],
      },
    ],
  }
  await page.goto(
    `https://jbrowse.org/code/jb2/${values.version}/?config=${encodeURIComponent(CONFIG)}&session=spec-${encodeURIComponent(JSON.stringify(session))}`,
    { waitUntil: 'networkidle0', timeout: 120_000 },
  )
  const container = `[data-testid$="-${figure.trackId}"][data-testid^="trackRenderingContainer"]`
  await page.waitForSelector(container, { timeout: 60_000 })
  await sleep(4000)
  const point = await page.evaluate(
    (selector, coord) => {
      const view = window.JBrowseSession.views[0]
      const r = document.querySelector(selector).getBoundingClientRect()
      const [region] = view.displayedRegions
      const offsetPx = (coord - region.start) / view.bpPerPx
      return { x: r.left + offsetPx - view.offsetPx, y: r.top + 8 }
    },
    container,
    figure.at,
  )
  await page.mouse.click(point.x, point.y, { button: 'right' })
  const item = await page.waitForSelector('::-p-text(Show repeat copies)', {
    timeout: 15_000,
  })
  await item.click()
  const view = await page.waitForSelector(
    '[data-testid="tandem-repeat-view"]',
    {
      timeout: 15_000,
    },
  )
  await sleep(500)
  const panel = await view.evaluateHandle(el => el.parentElement)
  const file = path.join(values.out, `${name}.png`)
  await panel.asElement().screenshot({ path: file })
  const rows = await page.$$eval(
    '[data-testid="tandem-repeat-row"]',
    els => els.length,
  )
  console.log(
    `${file}: ${rows} rows${errors.length ? `, errors: ${errors.join('; ')}` : ''}`,
  )
  await page.close()
}

fs.mkdirSync(values.out, { recursive: true })
const browser = await puppeteer.launch({
  args: ['--no-sandbox', '--enable-unsafe-swiftshader'],
})
try {
  for (const name of positionals.length ? positionals : Object.keys(FIGURES)) {
    await shoot(browser, name, FIGURES[name])
  }
} finally {
  await browser.close()
}
