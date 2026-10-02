// Removes locale entries whose kink is no longer in the catalog.
//
//   node src/scripts/prune-locale-orphans.mjs [--dry-run]
//
// A locale label is addressed as `<category>.<id>`, so when a kink is renamed or
// removed its label stays behind and keeps showing up in typechecking and diffs.
// Some of those leftovers are machine translations nobody would want a reader to
// see, so this prunes them.
//
// Only sections named after a catalog category are touched. Interface sections
// (app chrome, theme, roles, choices) are left alone: they are not categories.

import fs from 'node:fs'
import path from 'node:path'
import process from 'node:process'
import { fileURLToPath } from 'node:url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const CATALOG_PATH = path.join(__dirname, '..', 'data', 'kinks.ts')
const LOCALES_DIR = path.join(__dirname, '..', 'locales')

function readCatalog() {
  const lines = fs.readFileSync(CATALOG_PATH, 'utf8').split('\n')
  const categories = new Set()
  const kinks = new Set()
  let category = null

  for (const line of lines) {
    const categoryMatch = line.match(/^ {4}id: '([a-z_0-9]+)',$/)
    if (categoryMatch) {
      category = categoryMatch[1]
      categories.add(category)
      continue
    }
    const kinkMatch = line.match(/^ {8}id: '([a-z_0-9]+)',$/)
    if (kinkMatch && category)
      kinks.add(`${category}/${kinkMatch[1]}`)
  }

  return { categories, kinks }
}

function prune(localeData, catalog) {
  const removed = []

  for (const [section, entries] of Object.entries(localeData)) {
    // Interface sections and the category-name map are not catalog categories.
    if (!catalog.categories.has(section) || !entries || typeof entries !== 'object')
      continue

    for (const id of Object.keys(entries)) {
      if (catalog.kinks.has(`${section}/${id}`))
        continue
      removed.push({ section, id, label: entries[id]?.label ?? '(no label)' })
      delete entries[id]
    }
  }

  return removed
}

function main() {
  const dryRun = process.argv.includes('--dry-run')
  const catalog = readCatalog()
  const localeFiles = fs.readdirSync(LOCALES_DIR).filter(f => f.endsWith('.json'))

  let total = 0
  for (const file of localeFiles) {
    const localePath = path.join(LOCALES_DIR, file)
    const data = JSON.parse(fs.readFileSync(localePath, 'utf8'))
    const removed = prune(data, catalog)

    if (!removed.length) {
      console.log(`${file}: nothing to prune`)
      continue
    }

    total += removed.length
    console.log(`\n${file}: ${removed.length} orphaned entr${removed.length === 1 ? 'y' : 'ies'}`)
    for (const entry of removed)
      console.log(`  ${entry.section}/${entry.id}  "${entry.label}"`)

    if (!dryRun)
      fs.writeFileSync(localePath, `${JSON.stringify(data, null, 2)}\n`)
  }

  console.log(`\ncatalog: ${catalog.kinks.size} kinks in ${catalog.categories.size} categories`)
  console.log(total ? (dryRun ? `would remove ${total} entries` : `removed ${total} entries`) : 'no orphans found')
  if (dryRun && total)
    console.log('nothing was written')
}

main()