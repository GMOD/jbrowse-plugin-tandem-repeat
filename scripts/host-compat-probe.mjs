#!/usr/bin/env node
//
// Boots the built plugin on hosted JBrowse releases through the HPRC demo,
// which names it by its store url, and opens a repeat's copies on each. Fails
// if a host error-pages, never registers the plugin, or cannot open the view
// and draw its rows. The store serves `latest/` with no-cache, so a publish is
// a live change to that config, and what breaks a bundle on a host (a
// re-export the host stopped serving, an API older cores lack) passes tsc,
// eslint and the unit tests. The oldest version listed is the support floor.
//
// Usage:
//   node scripts/host-compat-probe.mjs
//   node scripts/host-compat-probe.mjs --versions v5.0.0-beta.9,main --dist dist
//
import path from 'node:path'
import { parseArgs } from 'node:util'

import puppeteer from 'puppeteer'

import {
  CONFIG,
  ENTRY,
  demoServer,
  demoUrl,
  openRepeatCopies,
  trackSession,
} from './hostedDemo.mjs'

const DEFAULT_VERSIONS = ['v5.0.0-beta.9', 'v5.0.0-beta.11', 'main']
const TRACK = {
  trackId: 'hprc_kiv2_copies_all',
  display: 'LinearVariantDisplay',
}

const { values } = parseArgs({
  options: {
    dist: { type: 'string', default: 'dist' },
    versions: { type: 'string' },
    timeout: { type: 'string', default: '120000' },
  },
})
const versions = values.versions?.split(',') ?? DEFAULT_VERSIONS
const timeout = Number(values.timeout)

async function probeOne(browser, version) {
  const page = await browser.newPage()
  const server = demoServer({ dist: path.resolve(values.dist) })
  await server.serve(page)
  const workers = []
  page.on('workercreated', w => workers.push(w))
  const consoleErrors = []
  page.on('console', m => {
    if (m.type() === 'error') {
      consoleErrors.push(m.text().slice(0, 300))
    }
  })
  page.on('pageerror', e => {
    consoleErrors.push(`pageerror: ${String(e).slice(0, 300)}`)
  })

  const result = { version, consoleErrors, served: server.served }
  try {
    await page.goto(demoUrl(version, trackSession(TRACK)), {
      waitUntil: 'domcontentloaded',
      timeout: 60_000,
    })
    // Readiness is the session global or the error page, not markup: the
    // loading spinner is an svg, so an element wait returns before plugins load
    await page.waitForFunction(
      () =>
        !!window.JBrowseSession ||
        /JBrowse Error|Fatal error/.test(document.body.innerText),
      { timeout },
    )
    result.appError = await page.evaluate(() => {
      const t = document.body.innerText
      return /JBrowse Error|Fatal error/.test(t)
        ? t.split('\n').slice(0, 4).join(' | ').slice(0, 300)
        : undefined
    })
    if (!result.appError) {
      result.registered = await page.evaluate(() => {
        const { pluginManager } = window.JBrowseRootModel
        return (
          pluginManager.plugins.some(p => p.name === 'TandemRepeat') &&
          pluginManager.viewTypes.has('TandemRepeatView')
        )
      })
    }
    if (result.registered) {
      await openRepeatCopies(page, TRACK)
      await page.waitForSelector('[data-testid="tandem-repeat-row"]', {
        timeout: 30_000,
      })
      result.rows = await page.$$eval(
        '[data-testid="tandem-repeat-row"]',
        els => els.length,
      )
      result.workerLoaded = await workerLoadedPlugin(workers)
    }
  } catch (e) {
    result.threw = String(e).slice(0, 300)
  }
  await page.close()
  return result
}

// Resource timing in each worker, since its requests reach the page's Fetch
// session indistinguishable from the page's own
async function workerLoadedPlugin(workers) {
  const loaded = await Promise.all(
    workers.map(w =>
      w
        .evaluate(
          entry =>
            performance
              .getEntriesByType('resource')
              .some(e => e.name.split('?')[0].endsWith(entry)),
          ENTRY,
        )
        .catch(() => false),
    ),
  )
  return loaded.some(Boolean)
}

function failure(r) {
  if (r.appError) {
    return `SESSION FAILED: ${r.appError}`
  }
  if (!r.served.includes(ENTRY)) {
    return `the host never requested ${ENTRY}, so the probe tested nothing`
  }
  if (r.threw) {
    return `probe threw: ${r.threw}`
  }
  if (!r.registered) {
    return 'TandemRepeat never registered (the bundle threw while loading)'
  }
  if (!r.rows) {
    return 'Show repeat copies opened a view with no rows'
  }
  return undefined
}

function servedSummary(r) {
  const chunks = new Set(r.served.filter(f => f !== ENTRY))
  return `served ${chunks.size} chunk(s)${r.workerLoaded ? ', the RPC worker loaded the bundle' : ''}`
}

const browser = await puppeteer.launch({
  headless: true,
  args: ['--no-sandbox', '--enable-unsafe-swiftshader'],
  defaultViewport: { width: 1400, height: 1200 },
})

console.log(
  `serving ${values.dist} to ${CONFIG}\nhosts: ${versions.join(', ')}\n`,
)

const results = []
for (const version of versions) {
  const r = await probeOne(browser, version)
  results.push(r)
  const bad = failure(r)
  console.log(
    `${version.padEnd(15)} ${bad ?? `ok, ${r.rows} rows; ${servedSummary(r)}`}`,
  )
  if (bad) {
    for (const e of [...new Set(r.consoleErrors)].slice(0, 4)) {
      console.log(`                · ${e}`)
    }
  }
}
await browser.close()

const broken = results.filter(r => failure(r)).map(r => r.version)
if (broken.length > 0) {
  console.error(`\nFailed on: ${broken.join(', ')}`)
  process.exit(1)
}
console.log(
  '\nEvery probed host loaded the bundle and opened a repeat with its rows.',
)
