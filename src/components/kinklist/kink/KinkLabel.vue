<script setup lang="ts">
import { useI18n } from 'vue-i18n'
import { useKinkListState } from '../../../composables/useKinkList'

// New is decided by the projection and arrives on the row, so the label never
// re-derives it from a timestamp: a New badge cannot disagree with the New
// filter or the New count.
const props = defineProps<{
  label: string
  tooltip: string
  isNew: boolean
  positionLabel?: string
}>()

const { openKinkModal } = useKinkListState()
const { t } = useI18n()

function handleClick() {
  openKinkModal(props.label, props.tooltip)
}
</script>

<template>
  <div class="min-w-0 max-w-full">
    <div class="w-fit max-w-full">
      <UTooltip
        :text="tooltip"
        :delay-duration="200"
        :content="{
          side: 'bottom',
          align: 'center',
          sideOffset: 4,
        }"
        arrow
      >
        <div class="flex items-center cursor-pointer" @click="handleClick">
          <span class="text-[0.875rem] md:text-[0.8rem] break-all hyphens-auto">
            <span data-kink-label>{{ label }}<span v-if="positionLabel" class="text-gray-500 dark:text-gray-400"> ({{ positionLabel }})</span></span>
            <UIcon name="i-heroicons-question-mark-circle-solid" class="inline-block w-3 h-3 text-gray-400 align-middle" />
            <span v-if="isNew" class="inline-flex items-center ml-0.5 px-1.25 py-0.25 rounded-full text-[0.7rem] leading-[1.3] font-medium bg-primary-100 dark:bg-primary-900 text-primary-700 dark:text-primary-300">
              {{ t('app.new') }}
            </span>
          </span>
        </div>
      </UTooltip>
    </div>
  </div>
</template>
