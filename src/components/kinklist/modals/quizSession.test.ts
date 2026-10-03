import type { KinkChoice } from '../../../types'
import { describe, expect, it } from 'vitest'
import { ref } from 'vue'
import { category, generalKink, list, NOW_S } from '../../../projection/__tests__/fixtures'
import { projectQuizRows } from '../../../projection/quiz'
import { useQuizSession } from './quizSession'

function rowKey(kinkId: string, position: string): string {
  return `${kinkId}:${position}`
}

describe('useQuizSession', () => {
  it('reads the live List Choice when returning to an answered question', () => {
    const kink = generalKink(0)
    const rows = projectQuizRows({
      catalogue: [category('bodies', [kink])],
      list: list('both', {}),
      now: NOW_S,
    }, 'all')
    const choices = ref<Record<string, KinkChoice>>({})
    const session = useQuizSession({
      allRows: () => rows,
      newOnlyRows: () => rows,
      readChoice: (currentKink, position) => choices.value[rowKey(currentKink.id, position)] ?? 0,
      writeChoice: (currentKink, position, choice) => {
        choices.value[rowKey(currentKink.id, position)] = choice
      },
    })

    session.startQuiz()
    expect(session.currentValue.value).toBe(0)

    session.answer(4)
    expect(session.completed.value).toBe(true)

    session.back()
    expect(session.currentValue.value).toBe(4)
  })
})
