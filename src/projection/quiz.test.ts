import type { RolePerspective } from '../types'
import { describe, expect, it } from 'vitest'
import { category, CREATED_S, generalKink, list, roleSpecificKink } from './__tests__/fixtures'
import { projectQuizRows } from './quiz'

const ALL_PERSPECTIVES: RolePerspective[] = [
  { role: 'dom', perspective: 'self' },
  { role: 'dom', perspective: 'partner' },
  { role: 'sub', perspective: 'self' },
  { role: 'sub', perspective: 'partner' },
]

function ids(rows: ReturnType<typeof projectQuizRows>) {
  return rows.map(row => `${row.kink.key}%${row.position}`)
}

describe('projectQuizRows', () => {
  it('gives the normal quiz every answerable position in catalogue and position order', () => {
    const rows = projectQuizRows({
      catalogue: [
        category('bodies', [generalKink(0, CREATED_S + 1), generalKink(1, CREATED_S - 1)]),
        category('dynamics', [roleSpecificKink(10, ALL_PERSPECTIVES, CREATED_S + 1)]),
      ],
      list: list('both', { '0%general': 2, '10%as_dom': 6 }),
    }, 'all')

    expect(ids(rows)).toEqual([
      '0%general',
      '1%general',
      '10%as_dom',
      '10%for_sub',
      '10%as_sub',
      '10%for_dom',
    ])
  })

  it('keeps answered positions in the normal quiz', () => {
    const rows = projectQuizRows({
      catalogue: [category('bodies', [generalKink(0), generalKink(1)])],
      list: list('dom', { '0%general': 3, '1%general': 4 }),
    }, 'all')

    expect(ids(rows)).toEqual(['0%general', '1%general'])
  })

  it('gives the new-only quiz only unanswered positions of new kinks', () => {
    const rows = projectQuizRows({
      catalogue: [
        category('bodies', [generalKink(0, CREATED_S + 1), generalKink(1, CREATED_S - 1), generalKink(2)]),
        category('dynamics', [roleSpecificKink(10, ALL_PERSPECTIVES, CREATED_S + 1)]),
      ],
      list: list('both', { '0%general': 5, '10%as_dom': 6, '10%for_sub': 1 }),
    }, 'newAndUnanswered')

    expect(ids(rows)).toEqual(['10%as_sub', '10%for_dom'])
  })

  it('gives the new-only quiz no rows when every new position is answered', () => {
    const rows = projectQuizRows({
      catalogue: [
        category('bodies', [generalKink(0, CREATED_S + 1)]),
        category('dynamics', [roleSpecificKink(10, ALL_PERSPECTIVES, CREATED_S - 1)]),
      ],
      list: list('dom', { '0%general': 1 }),
    }, 'newAndUnanswered')

    expect(rows).toEqual([])
  })

  it('gives both scopes no rows without an active list', () => {
    const input = { catalogue: [category('bodies', [generalKink(0)])], list: null }

    expect(projectQuizRows(input, 'all')).toEqual([])
    expect(projectQuizRows(input, 'newAndUnanswered')).toEqual([])
  })

  it('carries the resolved choice and newness of each row', () => {
    const rows = projectQuizRows({
      catalogue: [category('bodies', [generalKink(0, CREATED_S + 1)])],
      list: list('sub', { '0%general': 5 }),
    }, 'all')

    expect(rows[0].choice).toBe(5)
    expect(rows[0].isNew).toBe(true)
    expect(rows[0].categoryId).toBe('bodies')
  })
})
