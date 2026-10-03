import type { KinkDefinition } from '../types'
import { describe, expect, it, vi } from 'vitest'
import { category, CREATED_S, filters, generalKink, list, NOW_S, roleSpecificKink } from './__tests__/fixtures'
import { projectList } from './projectList'

const ALL_PERSPECTIVES = [
  { role: 'dom', perspective: 'self' },
  { role: 'dom', perspective: 'partner' },
  { role: 'sub', perspective: 'self' },
  { role: 'sub', perspective: 'partner' },
] as const

describe('projectList', () => {
  it('projects empty values for a null list instead of throwing', () => {
    const projection = projectList({
      catalogue: [category('bodies', [generalKink(0)])],
      list: null,
      now: NOW_S,
      filters: filters(),
    })

    expect(projection.categories).toEqual([])
    expect(projection.rows).toEqual([])
    expect(projection.progress).toEqual({ completed: 0, total: 0, percentage: 0 })
    expect(projection.unanswerable).toEqual([])
  })

  it('gives a general kink exactly one general row', () => {
    const projection = projectList({
      catalogue: [category('bodies', [generalKink(0)])],
      list: list('both'),
      now: NOW_S,
      filters: filters(),
    })

    expect(projection.rows.map(row => row.position)).toEqual(['general'])
    expect(projection.categories.map(entry => entry.categoryId)).toEqual(['bodies'])
    expect(projection.categories[0].general.map(row => row.position)).toEqual(['general'])
    expect(projection.categories[0].roleSpecific).toEqual([])
  })

  it('expands a role-specific kink into the canonical positions of a dom list', () => {
    const projection = projectList({
      catalogue: [category('dynamics', [roleSpecificKink(10, [...ALL_PERSPECTIVES])])],
      list: list('dom'),
      now: NOW_S,
      filters: filters(),
    })

    expect(projection.rows.map(row => row.position)).toEqual(['as_dom', 'for_sub'])
    expect(projection.categories[0].general).toEqual([])
    expect(projection.categories[0].roleSpecific.map(row => row.position)).toEqual(['as_dom', 'for_sub'])
  })

  it('expands a role-specific kink into the canonical positions of a sub list', () => {
    const projection = projectList({
      catalogue: [category('dynamics', [roleSpecificKink(10, [...ALL_PERSPECTIVES])])],
      list: list('sub'),
      now: NOW_S,
      filters: filters(),
    })

    expect(projection.rows.map(row => row.position)).toEqual(['as_sub', 'for_dom'])
  })

  it('gives a both list all four positions derived from the declared perspectives', () => {
    const projection = projectList({
      catalogue: [category('dynamics', [roleSpecificKink(10, [...ALL_PERSPECTIVES])])],
      list: list('both'),
      now: NOW_S,
      filters: filters(),
    })

    expect(projection.rows.map(row => row.position)).toEqual(['as_dom', 'for_sub', 'as_sub', 'for_dom'])
  })

  it('keeps only the positions a dominant kink actually declares', () => {
    const projection = projectList({
      catalogue: [category('dynamics', [roleSpecificKink(10, [
        { role: 'dom', perspective: 'self' },
        { role: 'dom', perspective: 'partner' },
      ])])],
      list: list('both'),
      now: NOW_S,
      filters: filters(),
    })

    expect(projection.rows.map(row => row.position)).toEqual(['as_dom', 'for_sub'])
  })

  it('keeps only the positions a submissive kink actually declares', () => {
    const projection = projectList({
      catalogue: [category('dynamics', [roleSpecificKink(10, [
        { role: 'sub', perspective: 'self' },
        { role: 'sub', perspective: 'partner' },
      ])])],
      list: list('sub'),
      now: NOW_S,
      filters: filters(),
    })

    expect(projection.rows.map(row => row.position)).toEqual(['as_sub', 'for_dom'])
  })

  it('carries the category, kink and position on every row', () => {
    const kink = roleSpecificKink(10, [...ALL_PERSPECTIVES])
    const projection = projectList({
      catalogue: [category('dynamics', [kink])],
      list: list('dom'),
      now: NOW_S,
      filters: filters(),
    })

    expect(projection.rows[0].categoryId).toEqual('dynamics')
    expect(projection.rows[0].kink).toEqual(kink)
  })

  it('resolves the stored choice of each row by kink key and position', () => {
    const projection = projectList({
      catalogue: [category('bodies', [generalKink(0), generalKink(1)])],
      list: list('both', { '0%general': 6, '1%general': 3 }),
      now: NOW_S,
      filters: filters(),
    })

    expect(projection.rows.map(row => row.choice)).toEqual([6, 3])
  })

  it('treats a row without a stored choice as unanswered', () => {
    const projection = projectList({
      catalogue: [category('dynamics', [roleSpecificKink(10, [...ALL_PERSPECTIVES])])],
      list: list('dom', { '10%as_dom': 2 }),
      now: NOW_S,
      filters: filters(),
    })

    expect(projection.rows.map(row => row.choice)).toEqual([2, 0])
  })

  it('marks a kink added after the list creation as new on every one of its rows', () => {
    const projection = projectList({
      catalogue: [category('dynamics', [roleSpecificKink(10, [...ALL_PERSPECTIVES], CREATED_S + 1)])],
      list: list('dom'),
      now: NOW_S,
      filters: filters(),
    })

    expect(projection.rows.map(row => row.isNew)).toEqual([true, true])
  })

  it('does not mark a kink added exactly at the list creation as new', () => {
    const projection = projectList({
      catalogue: [category('bodies', [generalKink(0, CREATED_S)])],
      list: list('both'),
      now: NOW_S,
      filters: filters(),
    })

    expect(projection.rows.map(row => row.isNew)).toEqual([false])
  })

  it('does not mark a kink added before the list creation as new', () => {
    const projection = projectList({
      catalogue: [category('bodies', [generalKink(0, CREATED_S - 1)])],
      list: list('both'),
      now: NOW_S,
      filters: filters(),
    })

    expect(projection.rows.map(row => row.isNew)).toEqual([false])
  })

  it('does not mark an undated kink as new', () => {
    const projection = projectList({
      catalogue: [category('bodies', [generalKink(0)])],
      list: list('both'),
      now: NOW_S,
      filters: filters(),
    })

    expect(projection.rows.map(row => row.isNew)).toEqual([false])
  })

  it('reads newness from the list creation time, never from the injected clock', () => {
    const catalogue = [category('bodies', [generalKink(0, CREATED_S + 1), generalKink(1, CREATED_S - 1)])]

    const atCreation = projectList({ catalogue, list: list('both'), now: CREATED_S, filters: filters() })
    const farLater = projectList({ catalogue, list: list('both'), now: CREATED_S + 10 * 365 * 24 * 3_600, filters: filters() })

    expect(atCreation.rows.map(row => row.isNew)).toEqual([true, false])
    expect(farLater.rows.map(row => row.isNew)).toEqual(atCreation.rows.map(row => row.isNew))
  })

  it('does not read the system clock when projecting', () => {
    const systemNow = vi.spyOn(Date, 'now').mockReturnValue(4_000_000_000_000)

    try {
      const projection = projectList({
        catalogue: [category('bodies', [generalKink(0, CREATED_S - 1)])],
        list: list('both'),
        now: NOW_S,
        filters: filters({ showOnlyNew: true }),
      })

      expect(projection.rows).toEqual([])
    }
    finally {
      systemNow.mockRestore()
    }
  })

  it('admits no row when only some rows of a kink satisfy the active filters', () => {
    const projection = projectList({
      catalogue: [category('dynamics', [roleSpecificKink(10, [...ALL_PERSPECTIVES])])],
      list: list('both', { '10%as_dom': 5, '10%for_sub': 2 }),
      now: NOW_S,
      filters: filters({ showOnlyUnfilled: true, choiceFilters: [5] }),
    })

    expect(projection.rows.map(row => row.position)).toEqual([])
  })

  it('judges every active filter against the same row', () => {
    const projection = projectList({
      catalogue: [category('dynamics', [roleSpecificKink(10, [...ALL_PERSPECTIVES])])],
      list: list('both', { '10%as_dom': 5, '10%for_sub': 2 }),
      now: NOW_S,
      filters: filters({ showOnlyUnfilled: true, choiceFilters: [0] }),
    })

    expect(projection.rows.map(row => row.position)).toEqual(['as_sub', 'for_dom'])
  })

  it('yields no rows for unanswered-only combined with a nonzero choice filter', () => {
    const projection = projectList({
      catalogue: [category('bodies', [generalKink(0), generalKink(1)])],
      list: list('both', { '0%general': 4 }),
      now: NOW_S,
      filters: filters({ showOnlyUnfilled: true, choiceFilters: [4, 6] }),
    })

    expect(projection.rows.map(row => row.position)).toEqual([])
  })

  it('treats an empty choice filter list as inactive', () => {
    const projection = projectList({
      catalogue: [category('bodies', [generalKink(0)])],
      list: list('both', { '0%general': 4 }),
      now: NOW_S,
      filters: filters({ showOnlyUnfilled: true, choiceFilters: [] }),
    })

    expect(projection.rows.map(row => row.position)).toEqual([])
  })

  it('keeps only rows whose kink is new when filtering by new', () => {
    const projection = projectList({
      catalogue: [category('bodies', [
        generalKink(0, CREATED_S + 1),
        generalKink(1, CREATED_S - 1),
        generalKink(2),
      ])],
      list: list('both'),
      now: NOW_S,
      filters: filters({ showOnlyNew: true }),
    })

    expect(projection.rows.map(row => row.kink.key)).toEqual([0])
  })

  it('keeps only unanswered rows when filtering for unfilled rows', () => {
    const projection = projectList({
      catalogue: [category('bodies', [generalKink(0), generalKink(1)])],
      list: list('both', { '0%general': 2 }),
      now: NOW_S,
      filters: filters({ showOnlyUnfilled: true }),
    })

    expect(projection.rows.map(row => row.kink.key)).toEqual([1])
  })

  it('keeps only rows carrying one of the selected choices', () => {
    const projection = projectList({
      catalogue: [category('bodies', [generalKink(0), generalKink(1), generalKink(2)])],
      list: list('both', { '0%general': 1, '1%general': 3 }),
      now: NOW_S,
      filters: filters({ choiceFilters: [3] }),
    })

    expect(projection.rows.map(row => row.kink.key)).toEqual([1])
  })

  it('filters general rows by the same conjunction as role-specific rows', () => {
    const projection = projectList({
      catalogue: [category('bodies', [generalKink(0), generalKink(1)])],
      list: list('both', { '0%general': 1 }),
      now: NOW_S,
      filters: filters({ showOnlyUnfilled: true, choiceFilters: [0] }),
    })

    expect(projection.rows.map(row => row.kink.key)).toEqual([1])
    expect(projection.categories[0].general.map(row => row.kink.key)).toEqual([1])
  })

  it('applies new, unfilled and choice filters together', () => {
    const projection = projectList({
      catalogue: [category('bodies', [
        generalKink(0, CREATED_S + 1),
        generalKink(1, CREATED_S + 1),
        generalKink(2, CREATED_S + 1),
      ])],
      list: list('both', { '1%general': 6 }),
      now: NOW_S,
      filters: filters({ showOnlyNew: true, showOnlyUnfilled: true, choiceFilters: [0] }),
    })

    expect(projection.rows.map(row => row.kink.key)).toEqual([0, 2])
  })

  it('measures progress over every answerable position of the list', () => {
    const projection = projectList({
      catalogue: [category('bodies', [generalKink(0), generalKink(1)])],
      list: list('both', { '0%general': 2 }),
      now: NOW_S,
      filters: filters(),
    })

    expect(projection.progress).toEqual({ completed: 1, total: 2, percentage: 50 })
  })

  it('rounds the progress percentage like the rest of the application', () => {
    const projection = projectList({
      catalogue: [category('bodies', [generalKink(0), generalKink(1), generalKink(2)])],
      list: list('both', { '0%general': 1 }),
      now: NOW_S,
      filters: filters(),
    })

    expect(projection.progress.percentage).toBe(33)
  })

  it('counts one answered position per answered row of a multi-position kink', () => {
    const projection = projectList({
      catalogue: [category('dynamics', [roleSpecificKink(10, [...ALL_PERSPECTIVES])])],
      list: list('both', { '10%as_dom': 3, '10%for_sub': 4 }),
      now: NOW_S,
      filters: filters(),
    })

    expect(projection.progress).toEqual({ completed: 2, total: 4, percentage: 50 })
  })

  it('keeps progress identical while the filters change the visible rows', () => {
    const catalogue = [
      category('bodies', [generalKink(0, CREATED_S + 1), generalKink(1, CREATED_S - 1), generalKink(2)]),
      category('dynamics', [roleSpecificKink(10, [...ALL_PERSPECTIVES], CREATED_S + 1)]),
    ]
    const kinkList = list('both', { '0%general': 2, '10%as_dom': 6, '10%for_sub': 1 })

    const unfiltered = projectList({ catalogue, list: kinkList, filters: filters(), now: NOW_S })
    const onlyNew = projectList({ catalogue, list: kinkList, filters: filters({ showOnlyNew: true }), now: NOW_S })
    const onlyUnfilled = projectList({ catalogue, list: kinkList, filters: filters({ showOnlyUnfilled: true }), now: NOW_S })
    const onlyChoice = projectList({ catalogue, list: kinkList, filters: filters({ choiceFilters: [6] }), now: NOW_S })
    const contradictory = projectList({
      catalogue,
      list: kinkList,
      now: NOW_S,
      filters: filters({ showOnlyUnfilled: true, choiceFilters: [6] }),
    })

    expect(unfiltered.rows.length).not.toEqual(onlyNew.rows.length)
    expect(unfiltered.rows.length).not.toEqual(onlyChoice.rows.length)
    expect(contradictory.rows.length).toBe(0)
    expect(unfiltered.progress).toEqual({ completed: 3, total: 7, percentage: 43 })
    for (const projection of [onlyNew, onlyUnfilled, onlyChoice, contradictory])
      expect(projection.progress).toEqual(unfiltered.progress)
  })

  it('uses the unfiltered row count as the progress denominator', () => {
    const catalogue = [category('dynamics', [roleSpecificKink(10, [...ALL_PERSPECTIVES])])]
    const kinkList = list('both')

    const unfiltered = projectList({ catalogue, list: kinkList, filters: filters(), now: NOW_S })
    const onlyUnfilled = projectList({ catalogue, list: kinkList, filters: filters({ showOnlyUnfilled: true }), now: NOW_S })

    expect(unfiltered.progress.total).toBe(unfiltered.rows.length)
    expect(unfiltered.progress.total).toBe(4)
    expect(onlyUnfilled.progress.total).toEqual(unfiltered.progress.total)
  })

  it('reports zero progress for an empty catalogue', () => {
    const projection = projectList({
      catalogue: [],
      list: list('both'),
      now: NOW_S,
      filters: filters(),
    })

    expect(projection.rows).toEqual([])
    expect(projection.categories).toEqual([])
    expect(projection.progress).toEqual({ completed: 0, total: 0, percentage: 0 })
  })

  it('keeps catalogue order for categories and kinks in both outputs', () => {
    const projection = projectList({
      catalogue: [
        category('service', [generalKink(20), generalKink(21)]),
        category('bodies', [generalKink(0), generalKink(1)]),
      ],
      list: list('both'),
      now: NOW_S,
      filters: filters(),
    })

    expect(projection.categories.map(entry => entry.categoryId)).toEqual(['service', 'bodies'])
    expect(projection.rows.map(row => row.kink.key)).toEqual([20, 21, 0, 1])
  })

  it('keeps canonical position order inside one kink', () => {
    const projection = projectList({
      catalogue: [category('dynamics', [
        roleSpecificKink(10, [...ALL_PERSPECTIVES]),
        roleSpecificKink(11, [...ALL_PERSPECTIVES]),
      ])],
      list: list('both'),
      now: NOW_S,
      filters: filters(),
    })

    expect(projection.rows.map(row => `${row.kink.key}%${row.position}`)).toEqual([
      '10%as_dom',
      '10%for_sub',
      '10%as_sub',
      '10%for_dom',
      '11%as_dom',
      '11%for_sub',
      '11%as_sub',
      '11%for_dom',
    ])
  })

  it('flattens the grouped rows in the same order', () => {
    const projection = projectList({
      catalogue: [
        category('bodies', [generalKink(0), roleSpecificKink(10, [...ALL_PERSPECTIVES])]),
        category('service', [generalKink(20)]),
      ],
      list: list('both'),
      now: NOW_S,
      filters: filters(),
    })

    const grouped = projection.categories.flatMap(entry => [...entry.general, ...entry.roleSpecific])
    expect(grouped).toEqual(projection.rows)
  })

  it('omits a category left without any visible row', () => {
    const projection = projectList({
      catalogue: [
        category('bodies', [generalKink(0, CREATED_S + 1)]),
        category('service', [generalKink(20, CREATED_S - 1)]),
      ],
      list: list('both'),
      now: NOW_S,
      filters: filters({ showOnlyNew: true }),
    })

    expect(projection.categories.map(entry => entry.categoryId)).toEqual(['bodies'])
    expect(projection.rows.map(row => row.kink.key)).toEqual([0])
  })

  it('keeps the general and role-specific split when only one side survives filtering', () => {
    const projection = projectList({
      catalogue: [category('bodies', [
        generalKink(0, CREATED_S - 1),
        roleSpecificKink(10, [...ALL_PERSPECTIVES], CREATED_S + 1),
      ])],
      list: list('dom'),
      now: NOW_S,
      filters: filters({ showOnlyNew: true }),
    })

    expect(projection.categories[0].general).toEqual([])
    expect(projection.categories[0].roleSpecific.map(row => row.position)).toEqual(['as_dom', 'for_sub'])
  })

  it('reports a role-specific kink with no position for this role as unanswerable', () => {
    const kink = roleSpecificKink(10, [{ role: 'dom', perspective: 'self' }])
    const projection = projectList({
      catalogue: [category('dynamics', [kink]), category('bodies', [generalKink(0)])],
      list: list('sub'),
      now: NOW_S,
      filters: filters(),
    })

    expect(projection.unanswerable).toEqual([{ categoryId: 'dynamics', kink, role: 'sub' }])
    expect(projection.rows.map(row => row.kink.key)).toEqual([0])
  })

  it('reports a role-specific kink without declared perspectives as unanswerable', () => {
    const kink: KinkDefinition = { id: 'no_perspectives', format: 'role_specific', key: 11 }
    const projection = projectList({
      catalogue: [category('dynamics', [kink])],
      list: list('both'),
      now: NOW_S,
      filters: filters(),
    })

    expect(projection.unanswerable).toEqual([{ categoryId: 'dynamics', kink, role: 'both' }])
    expect(projection.rows).toEqual([])
  })

  it('never reports answerable or general kinks as unanswerable', () => {
    const answerable = roleSpecificKink(10, [...ALL_PERSPECTIVES])
    const projection = projectList({
      catalogue: [category('bodies', [generalKink(0), answerable])],
      list: list('both'),
      now: NOW_S,
      filters: filters(),
    })

    expect(projection.unanswerable).toEqual([])
  })

  it('reports unanswerable kinks independently of the active filters', () => {
    const kink = roleSpecificKink(10, [{ role: 'dom', perspective: 'self' }])
    const projection = projectList({
      catalogue: [category('dynamics', [kink])],
      list: list('sub'),
      now: NOW_S,
      filters: filters({ showOnlyNew: true, showOnlyUnfilled: true }),
    })

    expect(projection.rows).toEqual([])
    expect(projection.categories).toEqual([])
    expect(projection.unanswerable).toEqual([{ categoryId: 'dynamics', kink, role: 'sub' }])
  })

  it('reports unanswerable kinks without logging', () => {
    const originalWarn = console.warn
    const originalError = console.error
    const logged: unknown[] = []
    console.warn = (...args: unknown[]) => {
      logged.push(args)
    }
    console.error = (...args: unknown[]) => {
      logged.push(args)
    }

    try {
      projectList({
        catalogue: [category('dynamics', [roleSpecificKink(10, [{ role: 'dom', perspective: 'self' }])])],
        list: list('sub'),
        now: NOW_S,
        filters: filters(),
      })
    }
    finally {
      console.warn = originalWarn
      console.error = originalError
    }

    expect(logged).toEqual([])
  })

  it('reports zero progress when every kink is unanswerable', () => {
    const projection = projectList({
      catalogue: [category('dynamics', [roleSpecificKink(10, [{ role: 'dom', perspective: 'self' }])])],
      list: list('sub'),
      now: NOW_S,
      filters: filters(),
    })

    expect(projection.progress).toEqual({ completed: 0, total: 0, percentage: 0 })
  })

  it('traverses every answerable position for the normal quiz, ignoring display filters', () => {
    const catalogue = [
      category('bodies', [generalKink(0, CREATED_S + 1), generalKink(1, CREATED_S - 1)]),
      category('dynamics', [roleSpecificKink(10, [...ALL_PERSPECTIVES], CREATED_S + 1)]),
    ]
    const kinkList = list('both', { '0%general': 2, '10%as_dom': 6 })

    const normalQuiz = projectList({ catalogue, list: kinkList, filters: filters(), now: NOW_S })
    const filteredView = projectList({
      catalogue,
      list: kinkList,
      now: NOW_S,
      filters: filters({ showOnlyNew: true, choiceFilters: [6] }),
    })

    expect(filteredView.rows.length).toBe(1)
    expect(normalQuiz.rows.map(row => `${row.kink.key}%${row.position}`)).toEqual([
      '0%general',
      '1%general',
      '10%as_dom',
      '10%for_sub',
      '10%as_sub',
      '10%for_dom',
    ])
  })

  it('takes only unanswered positions of new kinks for the new-only quiz', () => {
    const projection = projectList({
      catalogue: [
        category('bodies', [generalKink(0, CREATED_S + 1), generalKink(1, CREATED_S - 1), generalKink(2)]),
        category('dynamics', [roleSpecificKink(10, [...ALL_PERSPECTIVES], CREATED_S + 1)]),
      ],
      list: list('both', { '0%general': 5, '10%as_dom': 6, '10%for_sub': 1 }),
      now: NOW_S,
      filters: filters({ showOnlyNew: true, showOnlyUnfilled: true }),
    })

    expect(projection.rows.map(row => `${row.kink.key}%${row.position}`)).toEqual([
      '10%as_sub',
      '10%for_dom',
    ])
  })

  it('gives the new-only quiz an empty row set when no new position is unanswered', () => {
    const projection = projectList({
      catalogue: [
        category('bodies', [generalKink(0, CREATED_S + 1)]),
        category('dynamics', [roleSpecificKink(10, [...ALL_PERSPECTIVES], CREATED_S - 1)]),
      ],
      list: list('dom', { '0%general': 1 }),
      now: NOW_S,
      filters: filters({ showOnlyNew: true, showOnlyUnfilled: true }),
    })

    expect(projection.rows.length).toBe(0)
    expect(projection.categories).toEqual([])
  })
})
