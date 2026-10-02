// Validates a catalog batch file and prints the insertion plan.
//
//   node src/scripts/add-kinks.mjs src/data/batches/<batch>.json [--dry-run]
//
// Plain ESM on purpose: the repo has no TypeScript runner configured, and this
// script must run through `npm run` without pulling anything at execution time.
//
// This pass only reads. Writing the catalog, the locale stubs and the review
// report is a separate step, gated on a clean validation.

import fs from 'node:fs'
import path from 'node:path'
import process from 'node:process'
import { fileURLToPath } from 'node:url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const CATALOG_PATH = path.join(__dirname, '..', 'data', 'kinks.ts')

const ROLES = new Set(['dom', 'sub'])
const PERSPECTIVES = new Set(['self', 'partner'])
const FORMATS = new Set(['general', 'role_specific'])

function readCatalog() {
  const source = fs.readFileSync(CATALOG_PATH, 'utf8')
  const existingIds = new Set()
  const categories = new Set()
  let maxKey = -1

  // Category blocks sit two levels shallower than kink entries, which is what
  // separates them without a full parser.
  for (const match of source.matchAll(/^ {2}\{\n {4}id: '([a-z_0-9]+)',$/gm))
    categories.add(match[1])
  for (const match of source.matchAll(/^ {6}\{\n {8}id: '([a-z_0-9]+)',$/gm))
    existingIds.add(match[1])
  for (const match of source.matchAll(/key: (\d+),$/gm))
    maxKey = Math.max(maxKey, Number(match[1]))

  return { source, existingIds, categories, maxKey }
}

function validate(batch, catalog) {
  const errors = []
  const warnings = []
  const declaredCategories = new Map(
    (batch.newCategories ?? []).map(c => [typeof c === 'string' ? c : c.id, c]),
  )

  for (const id of declaredCategories.keys()) {
    if (catalog.categories.has(id))
      errors.push(`new category "${id}" already exists in the catalog`)
  }

  const seenInBatch = new Map()

  batch.items.forEach((item, index) => {
    const where = `items[${index}] ${item.category}/${item.id}`

    if (!item.id || !/^[a-z_0-9]+$/.test(item.id))
      errors.push(`${where}: id must be snake_case`)
    if (seenInBatch.has(item.id))
      errors.push(`${where}: id repeated inside the batch (first at items[${seenInBatch.get(item.id)}])`)
    seenInBatch.set(item.id, index)

    if (catalog.existingIds.has(item.id))
      errors.push(`${where}: id already exists in the catalog`)

    if (!catalog.categories.has(item.category) && !declaredCategories.has(item.category))
      errors.push(`${where}: category "${item.category}" is neither in the catalog nor declared as new`)

    if (!FORMATS.has(item.format))
      errors.push(`${where}: format must be one of ${[...FORMATS].join(', ')}`)

    if (item.format === 'general' && item.allowedPerspectives)
      errors.push(`${where}: general kinks must not carry allowedPerspectives`)
    if (item.format === 'role_specific') {
      const perspectives = item.allowedPerspectives
      if (!Array.isArray(perspectives) || perspectives.length === 0) {
        // Default per spec: all four role x perspective combinations.
        item.allowedPerspectives = [
          { role: 'dom', perspective: 'self' },
          { role: 'dom', perspective: 'partner' },
          { role: 'sub', perspective: 'self' },
          { role: 'sub', perspective: 'partner' },
        ]
      }
      else {
        for (const entry of item.allowedPerspectives) {
          if (!ROLES.has(entry.role))
            errors.push(`${where}: perspective role must be dom or sub, got "${entry.role}"`)
          if (!PERSPECTIVES.has(entry.perspective))
            errors.push(`${where}: perspective must be self or partner, got "${entry.perspective}"`)
        }
      }
    }

    for (const locale of ['en', 'nl']) {
      if (!item[locale] || !String(item[locale]).trim())
        errors.push(`${where}: missing ${locale} label`)
    }
    if (!item.ru)
      warnings.push(`${where}: no ru label — Russian users will see the English fallback`)
  })

  return { errors, warnings, declaredCategories }
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

  const batch = JSON.parse(fs.readFileSync(batchPath, 'utf8'))
  const catalog = readCatalog()
  const { errors, warnings, declaredCategories } = validate(batch, catalog)

  if (errors.length) {
    console.error(`\n${errors.length} error(s):`)
    for (const error of errors)
      console.error(`  ✗ ${error}`)
    process.exit(1)
  }

  const planned = batch.items.map((item, index) => ({
    ...item,
    key: catalog.maxKey + 1 + index,
  }))

  console.log(`\nbatch ${batch.id}`)
  console.log(`  release ${batch.addedAt} (${new Date(batch.addedAt * 1000).toISOString()})`)
  console.log(`  items ${planned.length} (${planned.filter(i => i.format === 'role_specific').length} role-specific, ${planned.filter(i => i.format === 'general').length} general)`)
  console.log(`  new categories ${declaredCategories.size ? [...declaredCategories.keys()].join(', ') : 'none'}`)
  console.log(`  keys ${catalog.maxKey + 1}–${catalog.maxKey + planned.length} (next free after ${catalog.maxKey})`)
  console.log(`  catalog has ${catalog.existingIds.size} ids in ${catalog.categories.size} categories`)

  if (warnings.length) {
    console.log(`\n${warnings.length} warning(s):`)
    for (const warning of warnings.slice(0, 10))
      console.log(`  ! ${warning}`)
    if (warnings.length > 10)
      console.log(`  … and ${warnings.length - 10} more`)
  }

  console.log('\nplan (nothing written):')
  for (const item of planned)
    console.log(`  ${String(item.key).padStart(4)}  ${item.category}/${item.id}  [${item.format}]  ${item.en}`)
  console.log(`\nwould update: ${path.relative(process.cwd(), CATALOG_PATH)}, src/locales/en.json, src/locales/ru.json`)
  if (!dryRun)
    console.log('\nthis pass validates only — writing is a separate step')
}

main()