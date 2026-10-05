#!/usr/bin/env node
//
// Opens the hosted HPRC demo on a released JBrowse with this checkout's dist/
// standing in for the published bundle, right-clicks a repeat record, chooses
// the menu item, picks a figure's Group by… column from the view's menu, and
// shoots the view. Every figure in img/ comes from here.
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

import {
  CONFIG,
  STORE_ENTRY,
  demoServer,
  demoUrl,
  openRepeatCopies,
  sleep,
  trackSession,
} from './hostedDemo.mjs'

const FIGURES = {
  kiv2_copies: {
    trackId: 'hprc_kiv2_copies',
    display: 'LinearVariantDisplay',
  },
  kiv2_copies_all: {
    trackId: 'hprc_kiv2_copies_all',
    display: 'LinearVariantDisplay',
  },
  kiv2_copies_all_by_superpopulation: {
    trackId: 'hprc_kiv2_copies_all',
    display: 'LinearVariantDisplay',
    groupBy: 'superpopulation',
  },
  kiv2_copies_multisample: {
    trackId: 'hprc_kiv2_copies',
    display: 'LinearMultiSampleVariantDisplay',
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

const config = values.config
  ? JSON.parse(fs.readFileSync(values.config, 'utf8'))
  : await (await fetch(CONFIG)).json()
if (!config.plugins?.some(p => p.name === 'TandemRepeat')) {
  config.plugins = [
    ...(config.plugins ?? []),
    { name: 'TandemRepeat', esmUrl: STORE_ENTRY },
  ]
}
const server = demoServer({
  dist: values.store ? undefined : path.resolve('dist'),
  configBody: Buffer.from(JSON.stringify(config)),
})

async function shoot(browser, name, figure) {
  const page = await browser.newPage()
  await page.setViewport({ width: Number(values.width), height: 1200 })
  const errors = []
  page.on('pageerror', e => errors.push(String(e)))
  await server.serve(page)
  await page.goto(demoUrl(values.version, trackSession(figure)), {
    waitUntil: 'networkidle0',
    timeout: 120_000,
  })
  const view = await openRepeatCopies(page, figure)
  if (figure.groupBy) {
    const menus = await page.$$('[data-testid="view_menu_icon"]')
    await menus.at(-1).click()
    await (await page.waitForSelector('::-p-text(Group by…)')).click()
    await (await page.waitForSelector(`::-p-text(${figure.groupBy})`)).click()
    await page.waitForSelector('[data-testid="tandem-repeat-section"]', {
      timeout: 15_000,
    })
    while (await page.$('[role="menu"]')) {
      await page.keyboard.press('Escape')
      await sleep(300)
    }
    await page.evaluate(() => document.activeElement?.blur())
    await page.mouse.move(0, 0)
  }
  await sleep(500)
  const panel = await view.evaluateHandle(el => el.parentElement)
  const file = path.join(values.out, `${name}.png`)
  await panel.asElement().screenshot({ path: file })
  const rows = await page.$$eval(
    '[data-testid="tandem-repeat-row"]',
    els => els.length,
  )
  const sections = await page.$$eval(
    '[data-testid="tandem-repeat-section"]',
    els => els.map(el => el.textContent),
  )
  console.log(
    `${file}: ${rows} rows${sections.length ? ` in ${sections.join(', ')}` : ''}${errors.length ? `, errors: ${errors.join('; ')}` : ''}`,
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
