import type { ComputedRef, Ref } from 'vue'
import type { ProjectedRow } from '../../../projection/types'
import type { KinkChoice, KinkDefinition, KinkPosition } from '../../../types'
import { computed, ref } from 'vue'

// Interaction state for one flat projected Position sequence. Choice remains
// owned by the active List: projected rows are only the traversal snapshot.
export interface QuizSessionOptions {
  allRows: () => ProjectedRow[]
  newOnlyRows: () => ProjectedRow[]
  readChoice: (kink: KinkDefinition, position: KinkPosition) => KinkChoice
  writeChoice: (kink: KinkDefinition, position: KinkPosition, choice: KinkChoice) => void
}

export interface QuizSession {
  hasStarted: Ref<boolean>
  isNewKinksOnly: Ref<boolean>
  completed: Ref<boolean>
  currentRow: ComputedRef<ProjectedRow | null>
  currentValue: ComputedRef<KinkChoice>
  totalPositions: ComputedRef<number>
  currentPositionNumber: ComputedRef<number>
  progress: ComputedRef<number>
  newOnlyQuestionCount: ComputedRef<number>
  newOnlyAvailable: ComputedRef<boolean>
  canGoBack: ComputedRef<boolean>
  startQuiz: () => void
  startNewKinksQuiz: () => void
  answer: (choice: KinkChoice) => void
  next: () => void
  back: () => void
}

export function useQuizSession(options: QuizSessionOptions): QuizSession {
  const rows = ref<ProjectedRow[]>([])
  const cursor = ref(0)
  const completed = ref(false)
  const hasStarted = ref(false)
  const isNewKinksOnly = ref(false)
  const visitedCursors = ref<number[]>([])

  const currentRow = computed(() => rows.value[cursor.value] ?? null)
  const totalPositions = computed(() => rows.value.length)
  const currentPositionNumber = computed(() => Math.min(cursor.value + 1, totalPositions.value))
  const progress = computed(() => totalPositions.value === 0
    ? 0
    : Math.round(cursor.value / totalPositions.value * 100))
  const currentValue = computed((): KinkChoice => {
    const row = currentRow.value
    return row ? options.readChoice(row.kink, row.position) : 0
  })
  const newOnlyQuestionCount = computed(() => options.newOnlyRows().length)
  const newOnlyAvailable = computed(() => newOnlyQuestionCount.value > 0)
  const canGoBack = computed(() => visitedCursors.value.length > 0)

  function start(rowsToAsk: ProjectedRow[], scope: 'all' | 'new') {
    rows.value = rowsToAsk
    hasStarted.value = true
    isNewKinksOnly.value = scope === 'new'
    cursor.value = 0
    completed.value = rows.value.length === 0
    visitedCursors.value = []
  }

  function startQuiz() {
    start(options.allRows(), 'all')
  }

  function startNewKinksQuiz() {
    start(options.newOnlyRows(), 'new')
  }

  function next() {
    if (!currentRow.value)
      return

    visitedCursors.value.push(cursor.value)
    cursor.value++
    if (cursor.value >= rows.value.length)
      completed.value = true
  }

  function back() {
    const previous = visitedCursors.value.pop()
    if (previous === undefined)
      return

    cursor.value = previous
    completed.value = false
  }

  function answer(choice: KinkChoice) {
    const row = currentRow.value
    if (!row)
      return

    options.writeChoice(row.kink, row.position, choice)
    next()
  }

  return {
    hasStarted,
    isNewKinksOnly,
    completed,
    currentRow,
    currentValue,
    totalPositions,
    currentPositionNumber,
    progress,
    newOnlyQuestionCount,
    newOnlyAvailable,
    canGoBack,
    startQuiz,
    startNewKinksQuiz,
    answer,
    next,
    back,
  }
}

