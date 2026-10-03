<script setup lang="ts">
import type { KinkChoice as KinkChoiceType, KinkDefinition, KinkPosition } from '../../../types'
import { computed } from 'vue'
import { useI18n } from 'vue-i18n'
import { useKinkListState } from '../../../composables/useKinkList'
import { KINK_POSITION_DISPLAY } from '../../../types'
import KinkChoice from './KinkChoice.vue'
import KinkLabel from './KinkLabel.vue'
import KinkRowLayout from './KinkRowLayout.vue'

const props = defineProps<{
  categoryId: string
  kink: KinkDefinition
  position: KinkPosition
  choice: KinkChoiceType
  isNew: boolean
  isLastItem?: boolean
}>()
const { t } = useI18n()
const { setKinkChoice } = useKinkListState()

function handleClick(selectedValue: KinkChoiceType) {
  // If user clicks the "Not Entered" (0) button or the currently selected value, set to 0
  const currentValue = props.choice

  // If clicking the same value or explicitly clicking 0, set to 0
  // Otherwise set to the selected value
  const newValue = (currentValue === selectedValue || selectedValue === 0) ? 0 : selectedValue
  setKinkChoice(props.kink, props.position, newValue)
}

// Compute label and tooltip paths based on category and kink ID
const labelPath = `${props.categoryId}.${props.kink.id}.label`
const tooltipPath = `${props.categoryId}.${props.kink.id}.tooltip`

// Each row states one position, so the position is named next to the kink.
// General kinks are role-independent and carry no position label.
const positionLabel = computed(() =>
  props.position === 'general' ? '' : t(KINK_POSITION_DISPLAY[props.position].labelKey),
)
</script>

<template>
  <KinkRowLayout :is-last-item="isLastItem">
    <template #label>
      <KinkLabel
        :label="t(labelPath)"
        :tooltip="t(tooltipPath)"
        :is-new="isNew"
        :position-label="positionLabel"
      />
    </template>

    <template #choices>
      <td class="text-center whitespace-nowrap py-2 px-0 sm:px-1 min-w-[40px] sm:min-w-[50px]">
        <div class="flex justify-center items-center">
          <KinkChoice
            :value="choice"
            :on-click="handleClick"
            :kink-name="positionLabel ? `${t(labelPath)} (${positionLabel})` : t(labelPath)"
            :tooltip="t(tooltipPath)"
          />
        </div>
      </td>
    </template>
  </KinkRowLayout>
</template>
