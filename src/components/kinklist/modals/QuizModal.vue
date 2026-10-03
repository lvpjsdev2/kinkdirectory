<script setup lang="ts">
import type { KinkChoice as KinkChoiceType } from '../../../types'
import { computed } from 'vue'
import { useI18n } from 'vue-i18n'
import { getDisplayValue } from '../../../composables/kink.helpers'
import { currentUnixSeconds } from '../../../composables/listAdapters'
import { useKinkListState } from '../../../composables/useKinkList'
import { useSettings } from '../../../composables/useSettings'
import { kinkList } from '../../../data/kinks'
import { projectQuizRows } from '../../../projection/quiz'
import { KINK_POSITION_DISPLAY } from '../../../types'
import { useQuizSession } from './quizSession'

defineProps<{
  listId: string
}>()
const emit = defineEmits<{
  (e: 'close'): void
}>()
const { t } = useI18n()
const {
  activeList,
  getKinkChoice,
  setKinkChoice,
} = useKinkListState()
const { kinkChoiceOrder, settings } = useSettings()

// The quiz traverses the flat projected Position-row sequence with a single
// cursor; the session holds that state and reads the highlighted rating from the
// active List, which stays the single owner of Choice reads and writes.
const {
  hasStarted,
  isNewKinksOnly,
  completed: quizCompleted,
  currentRow,
  currentValue,
  totalPositions,
  currentPositionNumber,
  progress,
  newOnlyQuestionCount: newQuizQuestionCount,
  newOnlyAvailable: newKinksAvailable,
  canGoBack,
  startQuiz,
  startNewKinksQuiz,
  answer,
  next: nextQuestion,
  back: previousQuestion,
} = useQuizSession({
  allRows: () => projectQuizRows(
    { catalogue: kinkList, list: activeList.value, now: currentUnixSeconds() },
    'all',
  ),
  newOnlyRows: () => projectQuizRows(
    { catalogue: kinkList, list: activeList.value, now: currentUnixSeconds() },
    'newAndUnanswered',
  ),
  readChoice: getKinkChoice,
  writeChoice: setKinkChoice,
})

// Active color classes (selected)
const activeColorClasses = {
  0: 'border-gray-400 dark:border-gray-500 bg-gray-300 dark:bg-gray-600',
  1: 'border-blue-500 dark:border-blue-400 bg-blue-500 dark:bg-blue-400',
  2: 'border-green-500 dark:border-green-400 bg-green-500 dark:bg-green-400',
  3: 'border-yellow-500 dark:border-yellow-400 bg-yellow-500 dark:bg-yellow-400',
  4: 'border-orange-500 dark:border-orange-400 bg-orange-500 dark:bg-orange-400',
  5: 'border-red-500 dark:border-red-400 bg-red-500 dark:bg-red-400',
  6: 'border-purple-500 dark:border-purple-400 bg-purple-500 dark:bg-purple-400',
}

// Text color classes
const textColorClasses = {
  0: 'text-gray-500 dark:text-gray-400',
  1: 'text-blue-500 dark:text-blue-400',
  2: 'text-green-500 dark:text-green-400',
  3: 'text-yellow-500 dark:text-yellow-400',
  4: 'text-orange-500 dark:text-orange-400',
  5: 'text-red-500 dark:text-red-400',
  6: 'text-purple-500 dark:text-purple-400',
}

// Combined values with 0 at the end for the quiz modal
const quizValues = computed(() => {
  const reversedOrder = [...kinkChoiceOrder.value].reverse()
  return [...reversedOrder, 0] as KinkChoiceType[]
})

// Get the Position the current row names
const currentPosition = computed(() => currentRow.value?.position ?? null)

// Get description text for a rating value
function getRatingDescription(rating: KinkChoiceType): string {
  if (rating === 0)
    return t('choices.not_entered')
  if (rating === 6)
    return t('choices.curious')
  if (rating === 5)
    return t('choices.limit')
  if (rating === 4)
    return t('choices.maybe')
  if (rating === 3)
    return t('choices.indifferent')
  if (rating === 2)
    return t('choices.like')
  if (rating === 1)
    return t('choices.favorite')
  return t('choices.favorite')
}

// Position wording is shared with the list table so a position is named the
// same way everywhere. See KINK_POSITION_DISPLAY.
const positionDisplay = computed(() =>
  currentPosition.value
    ? { ...KINK_POSITION_DISPLAY[currentPosition.value], label: t(KINK_POSITION_DISPLAY[currentPosition.value].labelKey) }
    : null,
)

// Provide haptic feedback on mobile devices
function triggerHapticFeedback() {
  if (window.navigator && window.navigator.vibrate) {
    window.navigator.vibrate(50) // Short 50ms vibration
  }
}

// Handle user selecting a rating
function handleSelect(rating: KinkChoiceType) {
  if (!currentRow.value)
    return

  // Provide haptic feedback on mobile
  triggerHapticFeedback()

  // Store the selection and move on. List state still owns the write.
  answer(rating)
}

// Handle cancel (close modal)
function handleCancel() {
  emit('close')
}

// Show tooltip for the current kink
function getKinkTooltip(): string {
  if (!currentRow.value)
    return ''

  return t(`${currentRow.value.categoryId}.${currentRow.value.kink.id}.tooltip`, '')
}

// Get a pretty name for the current kink
function getKinkLabel(): string {
  if (!currentRow.value)
    return ''

  const kinkId = currentRow.value.kink.id

  return t(`${currentRow.value.categoryId}.${kinkId}.label`, kinkId)
}

// Get the appropriate title based on quiz state
const quizTitle = computed(() => {
  if (quizCompleted.value)
    return t('app.quiz_completed')
  return t('app.quiz')
})
</script>

<template>
  <UModal
    :title="quizTitle"
  >
    <template #title>
      <div class="flex items-center gap-2">
        {{ quizTitle }}
        <UBadge v-if="hasStarted && !quizCompleted && isNewKinksOnly" size="sm" color="primary" variant="soft" class="font-normal">
          <div class="flex items-center gap-1">
            <UIcon name="i-lucide-star" class="text-xs" />
            {{ t('app.new') }}
          </div>
        </UBadge>
      </div>
    </template>

    <template #body>
      <!-- Fixed height container to prevent modal jumps -->
      <div class="min-h-[500px] flex flex-col">
        <!-- Start screen -->
        <div v-if="!hasStarted" class="space-y-6 flex-grow flex flex-col justify-center">
          <!-- Introduction -->
          <div class="p-3 bg-gray-50 dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700">
            <div class="flex items-start space-x-3">
              <UIcon name="i-lucide-list-checks" class="flex-shrink-0 text-lg text-primary-500 mt-0.5" />
              <p class="text-sm text-gray-600 dark:text-gray-400">
                {{ t('app.quiz_intro') }}
              </p>
            </div>
          </div>

          <!-- Start buttons -->
          <div class="flex flex-col gap-2 items-center">
            <UButton
              size="lg"
              icon="i-lucide-play"
              color="primary"
              @click="startQuiz"
            >
              {{ t('app.start_quiz') }}
            </UButton>

            <UButton
              v-if="newKinksAvailable"
              size="md"
              icon="i-lucide-star"
              color="primary"
              variant="soft"
              @click="startNewKinksQuiz"
            >
              {{ t('app.quiz_new_kinks_count', { count: newQuizQuestionCount }) }}
            </UButton>
          </div>
        </div>

        <!-- Quiz completed screen -->
        <div v-else-if="quizCompleted" class="space-y-6 flex-grow flex flex-col justify-center">
          <div class="p-3 bg-gray-50 dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700">
            <div class="flex items-start space-x-3">
              <UIcon name="i-lucide-check-circle" class="flex-shrink-0 text-lg text-success-500 mt-0.5" />
              <p class="text-sm text-gray-600 dark:text-gray-400">
                {{ t('app.quiz_completed_message') }}
              </p>
            </div>
          </div>

          <!-- Close button -->
          <div class="flex justify-center">
            <UButton
              size="lg"
              icon="i-lucide-check"
              color="primary"
              @click="handleCancel"
            >
              {{ t('app.done') }}
            </UButton>
          </div>
        </div>

        <!-- Quiz question -->
        <div v-else-if="currentRow" class="flex-grow flex flex-col">
          <!-- Progress bar -->
          <div class="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2 mb-4 overflow-hidden">
            <div class="bg-primary-500 h-2 rounded-full transition-all duration-500 ease-out" :style="{ width: `${progress}%` }" />
          </div>

          <!-- Category and Kink Info -->
          <div class="text-center space-y-1 mb-1">
            <UBadge size="sm" color="neutral" class="mb-0.5">
              <UIcon name="iconamoon:category-fill" class="text-xs" />
              {{ t(`categories.${currentRow.categoryId}`) }}
            </UBadge>

            <h3 class="text-lg font-semibold">
              {{ getKinkLabel() }}
            </h3>

            <div v-if="positionDisplay" class="flex justify-center">
              <UBadge size="md" :color="positionDisplay.color" class="mb-0.5">
                <UIcon :name="positionDisplay.icon" class="text-xs" />
                {{ positionDisplay.label }}
              </UBadge>
            </div>

            <!-- Fixed height tooltip container -->
            <div class="h-12 flex items-center justify-center">
              <p v-if="getKinkTooltip()" class="text-xs text-gray-600 dark:text-gray-400 overflow-y-auto max-h-full">
                {{ getKinkTooltip() }}
              </p>
              <p v-else class="text-xs text-gray-400 dark:text-gray-600 italic">
                {{ t('app.no_description_available') }}
              </p>
            </div>
          </div>

          <!-- Rating options -->
          <div class="flex flex-col space-y-1 flex-grow">
            <div v-for="(rating, index) in quizValues" :key="rating" class="w-full">
              <button
                class="w-full py-2 px-4 text-left rounded-md flex items-center justify-between transition-colors duration-150 hover:bg-gray-100 dark:hover:bg-gray-800"
                :class="[
                  currentValue === rating
                    ? `bg-gray-100 dark:bg-gray-800 font-medium ${textColorClasses[rating]} outline outline-2 outline-current`
                    : 'hover:bg-gray-50 dark:hover:bg-gray-800/50',
                ]"
                :data-rating="rating"
                @click="handleSelect(rating)"
              >
                <div class="flex items-center flex-1 min-w-0 mr-2">
                  <span
                    class="w-5.5 h-5.5 rounded-full inline-flex items-center justify-center mr-2 flex-shrink-0"
                    :class="rating === 0 ? 'border-2 border-gray-300 dark:border-gray-600' : activeColorClasses[rating]"
                    :data-rating="rating"
                  >
                    <span
                      v-if="settings.showNumbersInChoices"
                      class="text-[13px] font-bold text-white flex items-center justify-center w-full h-full leading-none"
                      :class="{ 'dark:text-gray-900': rating === 0 }"
                    >
                      {{ getDisplayValue(rating) }}
                    </span>
                  </span>
                  <span class="text-sm break-words">{{ getRatingDescription(rating) }}</span>
                </div>
              </button>
              <div
                v-if="index !== quizValues.length - 1"
                class="h-px mt-1 bg-gray-200 dark:bg-gray-700"
              />
            </div>
          </div>

          <!-- Navigation buttons -->
          <div class="flex justify-between mt-3">
            <UButton
              v-if="canGoBack"
              variant="ghost"
              icon="i-lucide-arrow-left"
              @click="previousQuestion"
            >
              {{ t('app.back') }}
            </UButton>
            <div v-else /> <!-- Empty div to maintain layout with flexbox justify-between -->

            <UButton
              variant="ghost"
              @click="nextQuestion"
            >
              {{ t('app.skip') }}
            </UButton>
          </div>
        </div>
      </div>
    </template>

    <!-- Action Buttons -->
    <template #footer>
      <div class="flex justify-between w-full">
        <UButton
          variant="ghost"
          @click="handleCancel"
        >
          {{ t('app.close') }}
        </UButton>

        <div v-if="hasStarted && !quizCompleted" class="text-sm text-gray-500">
          {{ currentPositionNumber }} / {{ totalPositions }}
        </div>
      </div>
    </template>
  </UModal>
</template>

<style scoped>
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.3s ease, transform 0.3s ease;
}

.fade-enter-from {
  opacity: 0;
  transform: translateY(10px);
}

.fade-leave-to {
  opacity: 0;
  transform: translateY(-10px);
}

/* Prevent mobile zoom on quick taps */
button {
  touch-action: manipulation;
}
</style>
