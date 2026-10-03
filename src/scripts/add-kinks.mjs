// Validates a catalog batch, then inserts it.
//
//   node src/scripts/add-kinks.mjs <batch.json> [--dry-run]
//
// With --dry-run it prints the plan and writes nothing. Without it, the batch is
// applied: kink entries in the catalog, label stubs in every locale that has
// them, and category names for categories the batch introduces.
//
// Two rules make re-running safe and stopping mistakes visible:
//   - a kink whose id is already in the catalog is skipped, so re-applying a
//     batch is a no-op;
//   - a kink whose label slot is already taken in any locale is refused rather
//     than overwritten, because that usually means the label belongs to a kink
//     that was renamed or removed. Run prune-locale-orphans.mjs first.
//
// Plain ESM on purpose: the repo has no TypeScript runner configured, and this
// must run through `npm run` without pulling anything at execution time.

import fs from 'node:fs'
import path from 'node:path'
import process from 'node:process'
import { fileURLToPath } from 'node:url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const CATALOG_PATH = path.join(__dirname, '..', 'data', 'kinks.ts')
const LOCALES_DIR = path.join(__dirname, '..', 'locales')
const SHIPPED_LOCALES = ['en', 'ru']
const ALL_LOCALES = ['en', 'nl', 'ru']

const ROLES = new Set(['dom', 'sub'])
const PERSPECTIVES = new Set(['self', 'partner'])
const FORMATS = new Set(['general', 'role_specific'])
const ALL_PERSPECTIVES = [
  { role: 'dom', perspective: 'self' },
  { role: 'dom', perspective: 'partner' },
  { role: 'sub', perspective: 'self' },
  { role: 'sub', perspective: 'partner' },
]

function readCatalog() {
  const lines = fs.readFileSync(CATALOG_PATH, 'utf8').split('\n')
  const ids = new Set()
  const categories = new Set()
  let category = null
  let maxKey = -1

  for (const line of lines) {
    const categoryMatch = line.match(/^ {4}id: '([a-z_0-9]+)',$/)
    if (categoryMatch) {
      category = categoryMatch[1]
      categories.add(category)
      continue
    }
    const kinkMatch = line.match(/^ {8}id: '([a-z_0-9]+)',$/)
    if (kinkMatch && category)
      ids.add(`${category}/${kinkMatch[1]}`)
    const keyMatch = line.match(/^ {8}key: (\d+),$/)
    if (keyMatch)
      maxKey = Math.max(maxKey, Number(keyMatch[1]))
  }

  return { lines, ids, categories, maxKey }
}

function readLocales() {
  const locales = {}
  for (const file of ALL_LOCALES) {
    const localePath = path.join(LOCALES_DIR, `${file}.json`)
    locales[file] = {
      path: localePath,
      data: JSON.parse(fs.readFileSync(localePath, 'utf8')),
    }
  }
  return locales
}

// A hand-written label overlay may sit beside the batch; translations are
// authored, so they are kept out of the generated file.
function applyLabelOverlay(batch, batchPath) {
  const overlayPath = batchPath.replace(/\.json$/, '.ru.json')
  if (!fs.existsSync(overlayPath))
    return { batch, overlay: null }

  const overlay = JSON.parse(fs.readFileSync(overlayPath, 'utf8'))
  const labels = overlay.labels ?? {}
  const categoryLabels = overlay.categories ?? {}
  const used = new Set()

  for (const item of batch.items) {
    if (labels[item.id])
      item.ru = labels[item.id]
    used.add(item.id)
  }

  // Category names are authored too, so plain ids become labelled entries.
  batch.newCategories = (batch.newCategories ?? []).map((entry) => {
    if (typeof entry !== 'string')
      return entry
    const names = categoryLabels[entry]
    return names ? { id: entry, labels: names } : { id: entry }
  })

  return {
    batch,
    overlay,
    unused: Object.keys(labels).filter(id => !used.has(id)),
    missing: batch.items.filter(item => !item.ru).map(item => item.id),
    unnamedCategories: batch.newCategories
      .filter(c => !c.labels)
      .map(c => c.id),
  }
}

function normaliseCategories(batch) {
  return (batch.newCategories ?? []).map(entry =>
    (typeof entry === 'string' ? { id: entry } : entry))
}

function validate(batch, catalog, locales, newCategories) {
  const errors = []
  const warnings = []
  const declared = new Map(newCategories.map(c => [c.id, c]))

  // Categories already in the catalog are not an error either: they are simply
  // not created, which is what makes a second run of a batch a no-op.

  const seenInBatch = new Map()

  batch.items.forEach((item, index) => {
    const where = `items[${index}] ${item.category}/${item.id}`

    if (!item.id || !/^[a-z_0-9]+$/.test(item.id))
      errors.push(`${where}: id must be snake_case`)
    if (seenInBatch.has(item.id))
      errors.push(`${where}: id repeated inside the batch (first at items[${seenInBatch.get(item.id)}])`)
    seenInBatch.set(item.id, index)

    // An id already in the catalog is not an error: the batch is skipped, which
    // is what makes re-applying one a no-op.

    if (!catalog.categories.has(item.category) && !declared.has(item.category))
      errors.push(`${where}: category "${item.category}" is neither in the catalog nor declared as new`)

    if (!FORMATS.has(item.format))
      errors.push(`${where}: format must be one of ${[...FORMATS].join(', ')}`)

    if (item.format === 'general' && item.allowedPerspectives)
      errors.push(`${where}: general kinks must not carry allowedPerspectives`)
    if (item.format === 'role_specific') {
      if (!Array.isArray(item.allowedPerspectives) || item.allowedPerspectives.length === 0)
        item.allowedPerspectives = ALL_PERSPECTIVES
      for (const entry of item.allowedPerspectives) {
        if (!ROLES.has(entry.role))
          errors.push(`${where}: perspective role must be dom or sub, got "${entry.role}"`)
        if (!PERSPECTIVES.has(entry.perspective))
          errors.push(`${where}: perspective must be self or partner, got "${entry.perspective}"`)
      }
    }

    for (const locale of ['en', 'nl']) {
      if (!item[locale] || !String(item[locale]).trim())
        errors.push(`${where}: missing ${locale} label`)
    }

    if (!item.tooltip || !Object.keys(item.tooltip).length) {
      if (SHIPPED_LOCALES.some(l => !item.tooltip?.[l]))
        warnings.push(`${where}: no tooltip — the UI would show a raw translation key`)
    }
  })

  // Category names must exist for every locale we ship, or the section header
  // renders as a raw key.
  for (const category of declared.values()) {
    for (const locale of SHIPPED_LOCALES) {
      const name = category.labels?.[locale] ?? (locale === 'en' ? category.label : undefined)
      if (!name)
        errors.push(`new category "${category.id}": no ${locale} display name`)
      else if (!locales[locale].data.categories?.[category.id] && !name)
        warnings.push(`new category "${category.id}": ${locale} name missing`)
    }
  }

  return { errors, warnings }
}

// Decide what will actually be written: skips and refusals included, so the
// operator sees them before anything changes.
function buildPlan(batch, catalog, locales, newCategories) {
  const skipped = []
  const refused = []
  const toInsert = []
  let nextKey = catalog.maxKey + 1

  for (const item of batch.items) {
    const ref = `${item.category}/${item.id}`

    if (catalog.ids.has(ref)) {
      skipped.push({ ref, reason: 'already in the catalog' })
      continue
    }

    const occupied = SHIPPED_LOCALES.filter((locale) => {
      const entry = locales[locale].data[item.category]?.[item.id]
      return entry && typeof entry === 'object'
    })
    if (occupied.length) {
      refused.push({ ref, locales: occupied })
      continue
    }

    toInsert.push({ item, key: nextKey++ })
  }

  const newCategoryIds = newCategories
    .map(c => c.id)
    .filter(id => !catalog.categories.has(id))

  return { skipped, refused, toInsert, newCategoryIds, lastKey: nextKey - 1 }
}

function kinkBlock(item, key, addedAt) {
  const lines = ['      {', `        id: '${item.id}',`, `        format: '${item.format}',`, `        addedAt: ${addedAt},`]

  if (item.format === 'role_specific') {
    lines.push('        allowedPerspectives: [', '')
    for (const entry of item.allowedPerspectives) {
      lines.push(
        '          {',
        `            role: '${entry.role}',`,
        `            perspective: '${entry.perspective}',`,
        '          },',
        '',
      )
    }
    lines.push('        ],')
  }

  lines.push(`        key: ${key},`, '      },')
  return lines
}

function insertIntoCatalog(lines, plan, batch) {
  let working = [...lines]

  // New categories go in as trailing blocks; existing ones get their entries
  // appended just before the closing bracket of their kinks array.
  for (const categoryId of plan.newCategoryIds) {
    const items = plan.toInsert.filter(entry => entry.item.category === categoryId)
    const block = ['', '  {', `    id: '${categoryId}',`, '    kinks: [', '']
    for (const { item, key } of items) {
      block.push(...kinkBlock(item, key, batch.addedAt), '')
    }
    block.push('    ],', '  },')

    const closing = working.lastIndexOf(']')
    working.splice(closing, 0, ...block)
  }

  for (const categoryId of catalogCategoryOrder(working)) {
    const items = plan.toInsert.filter(entry => entry.item.category === categoryId)
    if (!items.length || plan.newCategoryIds.includes(categoryId))
      continue

    const header = working.findIndex((line, index) =>
      line === '  {' && working[index + 1] === `    id: '${categoryId}',`)
    if (header === -1)
      throw new Error(`category "${categoryId}" not found in the catalog file`)

    const kinksClose = working.findIndex((line, index) => index > header && line === '    ],')
    if (kinksClose === -1)
      throw new Error(`could not find the kinks array of "${categoryId}"`)

    const block = []
    for (const { item, key } of items)
      block.push(...kinkBlock(item, key, batch.addedAt), '')

    working.splice(kinksClose, 0, ...block)
  }

  return working
}

function catalogCategoryOrder(lines) {
  const order = []
  for (let i = 0; i < lines.length; i++) {
    if (lines[i] !== '  {')
      continue
    const match = lines[i + 1]?.match(/^ {4}id: '([a-z_0-9]+)',$/)
    if (match)
      order.push(match[1])
  }
  return order
}

// Insert a section right after the last existing catalog category, so category
// data stays grouped and the interface sections keep their place at the end.
function insertSection(data, id, value, categories) {
  const keys = Object.keys(data)
  let lastCategory = -1
  keys.forEach((key, index) => {
    if (categories.has(key))
      lastCategory = index
  })

  if (lastCategory === -1) {
    data[id] = value
    return
  }

  const rebuilt = {}
  keys.forEach((key, index) => {
    rebuilt[key] = data[key]
    if (index === lastCategory)
      rebuilt[id] = value
  })
  for (const key of keys)
    delete data[key]
  Object.assign(data, rebuilt)
}

function writeLocaleStubs(locales, plan, batch, newCategories, categories) {
  const written = []

  for (const [locale, { path: localePath, data }] of Object.entries(locales)) {
    let changed = false

    for (const categoryId of plan.newCategoryIds) {
      const category = newCategories.find(c => c.id === categoryId)
      const name = category?.labels?.[locale] ?? (locale === 'en' ? category?.label : undefined)
      if (!name)
        continue

      data.categories = data.categories ?? {}
      if (!(categoryId in data.categories)) {
        data.categories[categoryId] = name
        changed = true
        written.push(`${locale}: categories/${categoryId}`)
      }
      if (!(categoryId in data)) {
        insertSection(data, categoryId, {}, categories)
        changed = true
      }
    }

    for (const { item } of plan.toInsert) {
      const label = item[locale]
      if (!label)
        continue

      const tooltip = item.tooltip?.[locale]
      const section = data[item.category] ?? (data[item.category] = {})
      if (section[item.id])
        continue

      section[item.id] = tooltip ? { label, tooltip } : { label }
      changed = true
      written.push(`${locale}: ${item.category}/${item.id}`)
    }

    if (changed)
      fs.writeFileSync(localePath, `${JSON.stringify(data, null, 2)}\n`)
  }

  return written
}

function main() {
  const args = process.argv.slice(2)
  const batchPath = args.find(arg => !arg.startsWith('--'))
  const dryRun = args.includes('--dry-run')

  if (!batchPath) {
    console.error('usage: node src/scripts/add-kinks.mjs <batch.json> [--dry-run]')
    process.exit(2)
  }
  if (!fs.existsSync(batchPath)) {
    console.error(`batch file not found: ${batchPath}`)
    process.exit(2)
  }

  const { batch, overlay, unused, missing, unnamedCategories } = applyLabelOverlay(
    JSON.parse(fs.readFileSync(batchPath, 'utf8')),
    batchPath,
  )
  const newCategories = normaliseCategories(batch)
  const catalog = readCatalog()
  const locales = readLocales()

  const { errors, warnings } = validate(batch, catalog, locales, newCategories)
  if (errors.length) {
    console.error(`\n${errors.length} error(s):`)
    for (const error of errors)
      console.error(`  ✗ ${error}`)
    process.exit(1)
  }

  if (overlay) {
    console.log(`\nlabel overlay ${path.basename(batchPath.replace(/\.json$/, '.ru.json'))}`)
    if (unused?.length)
      console.log(`  ${unused.length} label(s) match no item: ${unused.slice(0, 5).join(', ')}`)
    if (missing?.length)
      console.log(`  ${missing.length} item(s) without a ru label: ${missing.slice(0, 5).join(', ')}`)
    if (unnamedCategories?.length)
      console.log(`  category names missing for: ${unnamedCategories.join(', ')}`)
  }

  const plan = buildPlan(batch, catalog, locales, newCategories)

  console.log(`\nbatch ${batch.id}`)
  console.log(`  release ${batch.addedAt} (${new Date(batch.addedAt * 1000).toISOString()})`)
  console.log(`  insert ${plan.toInsert.length} (${plan.toInsert.filter(e => e.item.format === 'role_specific').length} role-specific)`)
  console.log(`  keys ${catalog.maxKey + 1}–${plan.lastKey}`)
  if (plan.newCategoryIds.length)
    console.log(`  new categories ${plan.newCategoryIds.join(', ')}`)
  if (plan.skipped.length)
    console.log(`  skip ${plan.skipped.length} already present`)
  if (plan.refused.length) {
    console.log(`  refuse ${plan.refused.length} with an occupied label slot:`)
    for (const entry of plan.refused)
      console.log(`    ✗ ${entry.ref} — label already exists in ${entry.locales.join(', ')}`)
  }
  if (warnings.length) {
    console.log(`\n${warnings.length} warning(s):`)
    for (const warning of warnings.slice(0, 6))
      console.log(`  ! ${warning}`)
    if (warnings.length > 6)
      console.log(`  … and ${warnings.length - 6} more`)
  }

  if (dryRun) {
    console.log('\nplan (nothing written):')
    for (const { item, key } of plan.toInsert)
      console.log(`  ${String(key).padStart(4)}  ${item.category}/${item.id}  [${item.format}]  ${item.en}`)
    return
  }

  const updated = insertIntoCatalog(catalog.lines, plan, batch)
  fs.writeFileSync(CATALOG_PATH, updated.join('\n'))
  const written = writeLocaleStubs(locales, plan, batch, newCategories, catalog.categories)

  console.log(`\ninserted ${plan.toInsert.length} kink(s) into the catalog`)
  console.log(`wrote ${written.length} locale entries across ${ALL_LOCALES.join(', ')}`)
  if (plan.refused.length)
    console.log(`refused ${plan.refused.length}: run prune-locale-orphans.mjs or edit the batch`)
}

main()
