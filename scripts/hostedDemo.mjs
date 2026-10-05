// The hosted HPRC demo on a released JBrowse, with this checkout's dist/
// answering its requests for the published bundle, and the right-click that
// opens a repeat's copies. Shared by shoot-figures.mjs and host-compat-probe.mjs.
import fs from 'node:fs'
import path from 'node:path'

export const CONFIG = 'https://jbrowse.org/demos/hprc/config.json'
export const ENTRY = 'jbrowse-plugin-tandem-repeat.esm.js'
export const STORE_ENTRY = `https://jbrowse.org/plugins/jbrowse-plugin-tandem-repeat/latest/dist/${ENTRY}`
const STORE_DIST = /\/plugins\/jbrowse-plugin-tandem-repeat\/[^/]+\/dist\/(.+)$/

export const KIV2 = { loc: 'chr6:160,596,000-160,666,000', at: 160_631_000 }

export const sleep = ms => new Promise(r => setTimeout(r, ms))

export function demoUrl(version, session) {
  const spec = session
    ? `&session=spec-${encodeURIComponent(JSON.stringify(session))}`
    : ''
  return `https://jbrowse.org/code/jb2/${version}/?config=${encodeURIComponent(CONFIG)}${spec}`
}

// `dist` serves the whole directory by its path under the store url: the
// entry imports its code-split chunks as siblings, and answering those with
// the entry would read as a host incompatibility. A file missing from `dist`
// answers 404 rather than falling through to the store, whose copy of an
// unchanged chunk would otherwise pass for this build's. `configBody` stands
// in for the hosted config. `served` lists each file answered from `dist`.
//
// CDP Fetch on the page's own session: Chrome routes a dedicated worker's
// requests through its frame, so this also answers the RPC worker, which
// imports the plugin too. A worker target has no Fetch domain, and
// page.setRequestInterception never resumes a worker's requests.
export function demoServer({ dist, configBody }) {
  const served = []

  function bodyFor(url) {
    const bare = url.split('?')[0]
    if (configBody && bare === CONFIG) {
      return { status: 200, body: configBody, type: 'application/json' }
    }
    const relative = dist && STORE_DIST.exec(new URL(bare).pathname)?.[1]
    if (!relative) {
      return undefined
    }
    const file = path.join(dist, relative)
    return fs.existsSync(file)
      ? {
          status: 200,
          body: fs.readFileSync(file),
          type: 'application/javascript',
          relative,
        }
      : { status: 404, body: Buffer.from(''), type: 'text/plain' }
  }

  async function serve(page) {
    const client = await page.createCDPSession()
    client.on('Fetch.requestPaused', async ({ requestId, request }) => {
      const answer = bodyFor(request.url)
      if (answer?.relative) {
        served.push(answer.relative)
      }
      await (
        answer
          ? client.send('Fetch.fulfillRequest', {
              requestId,
              responseCode: answer.status,
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
      patterns: [
        { urlPattern: `${CONFIG}*` },
        { urlPattern: '*/plugins/jbrowse-plugin-tandem-repeat/*' },
      ],
    })
  }

  return { serve, served }
}

export function trackSession({ trackId, display }) {
  return {
    views: [
      {
        type: 'LinearGenomeView',
        assembly: 'hg38',
        loc: KIV2.loc,
        tracks: [{ trackId, type: display }],
      },
    ],
  }
}

// Right-clicks the track's record at `at` and chooses the menu item; resolves
// to the view's element
export async function openRepeatCopies(page, { trackId, at = KIV2.at }) {
  const container = `[data-testid$="-${trackId}"][data-testid^="trackRenderingContainer"]`
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
    at,
  )
  await page.mouse.click(point.x, point.y, { button: 'right' })
  const item = await page.waitForSelector('::-p-text(Show repeat copies)', {
    timeout: 15_000,
  })
  await item.click()
  return page.waitForSelector('[data-testid="tandem-repeat-view"]', {
    timeout: 15_000,
  })
}
