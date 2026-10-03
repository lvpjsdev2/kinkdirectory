import type { App as VueApp } from 'vue'
import ui from '@nuxt/ui/vue-plugin'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { createApp, nextTick } from 'vue'
import App from '../App.vue'
import { useKinkListState } from '../composables/useKinkList'
import i18n from '../i18n'

// This is the application-level smoke scenario from the spec: it mounts the real
// application with the application's own plugins and asserts what a person would
// see. The projection's own domain matrix stays in src/projection — nothing here
// re-tests Position expansion, New boundaries or filter semantics on synthetic
// data. What this guards is the adapter wiring: that the screen, Progress, both
// quiz modes and the export all read the same running List.

// What is exported is a DOM tree handed to html2canvas-pro; rasterising it is the
// screenshot pipeline's job, not this scenario's. So the raster step is replaced
// and the built export DOM is captured instead.
const capturedExport: { element: HTMLElement | null } = { element: null }

vi.mock('html2canvas-pro', () => ({
  default: async (element: HTMLElement) => {
    capturedExport.element = element
    return { toDataURL: () => 'data:image/png;base64,smoke' }
  },
}))

// A fixed creation timestamp keeps New deterministic instead of depending on when
// the scenario runs: the List predates the newest catalogue batch.
const LIST_CREATED_MS = Date.UTC(2026, 0, 1)

function label(key: string, named?: Record<string, unknown>): string {
  return i18n.global.t(key, named ?? {}) as string
}

/** Let the mounted application settle after user input. */
async function settle(): Promise<void> {
  for (let i = 0; i < 4; i++)
    await nextTick()
  await new Promise(resolve => setTimeout(resolve, 0))
  await nextTick()
}

/** The innermost element carrying exactly this label, as a person would click. */
function clickableWithText(text: string): HTMLElement {
  const matches = [...document.body.querySelectorAll<HTMLElement>('button, a, [class*="cursor-pointer"]')]
    .filter(element => element.textContent?.trim() === text)
  const found = matches[matches.length - 1]
  if (!found)
    throw new Error(`Nothing on screen is labelled "${text}"`)
  return found
}

/**
 * The new-only quiz is labelled with its own question count, which is what the
 * scenario is checking, so the label is matched by shape: the translated label
 * with any number in place of the count.
 */
function newQuizLabelPattern(): RegExp {
  const escape = (part: string) => part.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
  const [before, after] = (i18n.global.t('app.quiz_new_kinks_count', { count: '\u0001' }) as string).split('\u0001')
  return new RegExp(`^${escape(before)}\\d+${escape(after)}$`)
}

/** The Position rows the List screen currently renders. */
function visibleRows(): HTMLTableRowElement[] {
  return [...document.querySelectorAll<HTMLTableRowElement>('#kink-list-content tbody tr')]
}

function visibleLabels(): string[] {
  return visibleRows().map(row => rowLabel(row))
}

function rowLabel(row: HTMLTableRowElement): string {
  return row.querySelector('[data-kink-label]')?.textContent?.trim() ?? ''
}

/** The Choice shown as selected in a row, or `null` while unanswered. */
function rowChoice(row: HTMLTableRowElement): string | null {
  return row.querySelector('[data-rating-active="true"]')?.getAttribute('data-rating') ?? null
}

/** The Progress the screen shows: answered Positions, whole-List Positions, percentage. */
function shownProgress(): { completed: number, total: number, percentage: number } {
  const match = (document.body.textContent ?? '').match(/(\d+)\/(\d+) \((\d+)%\)/)
  if (!match)
    throw new Error('No Progress shown')
  return { completed: Number(match[1]), total: Number(match[2]), percentage: Number(match[3]) }
}

/** The quiz question counter, e.g. "1 / 42". */
function shownQuizCounter(): { current: number, total: number } {
  const match = (document.body.textContent ?? '').match(/(\d+) \/ (\d+)/)
  if (!match)
    throw new Error('No quiz question shown')
  return { current: Number(match[1]), total: Number(match[2]) }
}

/** Answer a visible Position the way a person does: by pressing its Choice. */
function answerRow(row: HTMLTableRowElement, rating: string): void {
  const button = row.querySelector<HTMLButtonElement>(`button[data-rating="${rating}"]`)
  if (!button)
    throw new Error(`Row "${rowLabel(row)}" offers no Choice ${rating}`)
  button.click()
}

describe('application smoke: the running List', () => {
  let app: VueApp<Element>

  beforeEach(async () => {
    const host = document.createElement('div')
    document.body.appendChild(host)

    app = createApp(App)
    app.use(i18n)
    app.use(ui)
    app.mount(host)
    await settle()

    const { createList, updateList } = useKinkListState()
    const listId = createList('Smoke List', 'both')
    updateList(listId, { created: LIST_CREATED_MS })
    await settle()
  })

  afterEach(() => {
    app.unmount()
    document.body.innerHTML = ''
    capturedExport.element = null
    // The Display filters are persisted state, so each scenario starts unfiltered.
    useKinkListState().clearAllFilters()
  })

  it('renders every answerable Position once and Progress over the whole List', async () => {
    const rows = visibleRows()
    expect(rows.length).toBeGreaterThan(0)

    // Progress is measured over the whole List, so an unfiltered List renders
    // exactly as many rows as Progress counts.
    const progress = shownProgress()
    expect(rows.length).toBe(progress.total)
    expect(progress.completed).toBe(0)

    // One row per Position: each row offers exactly one set of Choices.
    for (const row of rows)
      expect(row.querySelectorAll('[data-rating-group]').length).toBe(1)
  })

  it('applies combined filters per row while Progress keeps measuring the whole List', async () => {
    // Answer one visible Position, so the Choice filter below matches something.
    const answeredLabel = rowLabel(visibleRows()[0])
    answerRow(visibleRows()[0], '1')
    await settle()
    expect(shownProgress().completed).toBe(1)

    const progress = shownProgress()
    // The Filter control edits this state, so setting it applies the filters the
    // way choosing them in the control does.
    const { filters, clearAllFilters } = useKinkListState()

    // Each filter on its own, so the combined result can be checked against them.
    filters.value.showOnlyNew = true
    await settle()
    const newOnly = visibleLabels()

    filters.value.showOnlyNew = false
    filters.value.choiceFilters = [1]
    await settle()
    const choiceOnly = visibleLabels()

    // Combined: every visible row has to satisfy both filters itself.
    filters.value.showOnlyNew = true
    await settle()
    const combined = visibleLabels()

    expect(newOnly.length).toBeGreaterThan(0)
    expect(choiceOnly).toContain(answeredLabel)
    expect(combined.length).toBeGreaterThan(0)
    expect(combined.length).toBeLessThan(progress.total)
    // No Position is admitted because a *sibling* Position of its Kink matched:
    // the combined view is exactly the rows that pass both filters themselves.
    const favourite = new Set(choiceOnly)
    expect(combined).toEqual(newOnly.filter(rowLabel => favourite.has(rowLabel)))
    for (const row of visibleRows())
      expect(rowChoice(row)).toBe('1')

    // Progress is filter-independent: it still measures the whole List.
    expect(shownProgress()).toEqual(progress)

    // Clearing the filters brings the whole List back.
    clearAllFilters()
    await settle()
    expect(visibleLabels().length).toBe(progress.total)
  })

  it('quizzes every Position in the normal mode and only New ones in the new mode', async () => {
    answerRow(visibleRows()[0], '1')
    await settle()

    // Filters stay on: the quizzes must not inherit them.
    const { filters } = useKinkListState()
    filters.value.showOnlyNew = true
    filters.value.choiceFilters = [1]
    await settle()

    const visibleRowCount = visibleRows().length
    const progress = shownProgress()

    // Normal quiz: every answerable Position, not only the visible ones.
    clickableWithText(label('app.quiz')).click()
    await settle()
    clickableWithText(label('app.start_quiz')).click()
    await settle()

    const normal = shownQuizCounter()
    expect(normal.current).toBe(1)
    expect(normal.total).toBe(progress.total)
    expect(normal.total).toBeGreaterThan(visibleRowCount)

    clickableWithText(label('app.close')).click()
    await settle()

    // New-only quiz: only unanswered Positions of New Kinks, so fewer than the
    // normal quiz and announced as the New flow.
    clickableWithText(label('app.quiz')).click()
    await settle()
    const newQuiz = [...document.body.querySelectorAll('button')]
      .find(button => newQuizLabelPattern().test(button.textContent?.trim() ?? ''))
    expect(newQuiz, 'the new-only quiz is offered while New Kinks await an answer').toBeDefined()
    newQuiz!.click()
    await settle()

    const scoped = shownQuizCounter()
    expect(scoped.current).toBe(1)
    expect(scoped.total).toBeGreaterThan(0)
    expect(scoped.total).toBeLessThan(normal.total)
  })

  it('exports the currently visible List', async () => {
    // Answer one visible Position, then filter: the export must follow the view,
    // not the whole List.
    answerRow(visibleRows()[0], '1')
    await settle()

    const { filters } = useKinkListState()
    filters.value.showOnlyNew = true
    filters.value.choiceFilters = [1]
    await settle()

    const visible = visibleLabels()
    expect(visible.length).toBeGreaterThan(0)
    expect(visible.length).toBeLessThan(shownProgress().total)

    capturedExport.element = null
    clickableWithText(label('app.screenshot')).click()
    await settle()
    await settle()

    expect(capturedExport.element).not.toBeNull()

    // The exported image is the visible List: the same rows, in the same order,
    // with nothing the filters hid.
    const exported = [...capturedExport.element!.querySelectorAll('tbody tr')]
    expect(exported.length).toBe(visible.length)
    expect(exported.map(row => row.querySelector('td')?.textContent?.trim())).toEqual(visible)
  })
})
