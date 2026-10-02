<script setup lang="ts">
import type { KinkDefinition, KinkPosition } from '../../../types'
import { computed } from 'vue'
import { useI18n } from 'vue-i18n'
import { useKinkListState } from '../../../composables/useKinkList'
import KinkRow from './KinkRow.vue'
import KinkSectionContainer from './KinkSectionContainer.vue'
import KinkSectionHeader from './KinkSectionHeader.vue'

const props = defineProps<{
  categoryId: string
  kinks: KinkDefinition[]
}>()
const { t } = useI18n()
const { activeList, isKinkVisibleForRole, getKinkPositions } = useKinkListState()

// Filter kinks to only show those that are applicable to the user's role
const visibleKinks = computed(() => {
  if (!activeList.value)
    return []

  return props.kinks.filter(kink =>
    isKinkVisibleForRole(kink, activeList.value!.role),
  )
})

// Separate kinks by format
const generalKinks = computed(() => {
  return visibleKinks.value.filter(kink => kink.format === 'general')
})

const roleSpecificKinks = computed(() => {
  return visibleKinks.value.filter(kink => kink.format === 'role_specific')
})

// Check if this subcategory has any visible kinks
const isVisible = computed(() => visibleKinks.value.length > 0)

// Expand kinks into one entry per position. A kink the list answers for twice
// becomes two rows, each stating one position.
const roleSpecificRows = computed(() => {
  if (!activeList.value)
    return []

  const rows: Array<{ kink: KinkDefinition, position: KinkPosition }> = []

  for (const kink of roleSpecificKinks.value) {
    for (const position of getKinkPositions(kink, activeList.value.role)) {
      rows.push({ kink, position })
    }
  }

  return rows
})

const generalRows = computed(() => {
  if (!activeList.value)
    return []

  return generalKinks.value.map(kink => ({ kink, position: 'general' as KinkPosition }))
})
</script>

<template>
  <div v-if="isVisible" class="mb-2">
    <!-- General Format Kinks Table -->
    <KinkSectionContainer
      v-if="generalKinks.length > 0"
      :is-last-section="roleSpecificKinks.length === 0"
    >
      <template #header>
        <KinkSectionHeader
          :title="t(`categories.${categoryId}`)"
          :column-labels="[t('app.general')]"
          :is-general-section="true"
        />
      </template>

      <template #content>
        <KinkRow
          v-for="(row, index) in generalRows"
          :key="`${row.kink.id}_${row.position}`"
          :category-id="categoryId"
          :kink="row.kink"
          :position="row.position"
          :is-last-item="index === generalRows.length - 1"
        />
      </template>
    </KinkSectionContainer>

    <!-- Role-Specific Kinks Table: one row per position -->
    <KinkSectionContainer v-if="roleSpecificRows.length > 0">
      <template #header>
        <KinkSectionHeader
          :title="t(`categories.${categoryId}`)"
          :column-labels="[t('app.preference')]"
          :is-general-section="false"
        />
      </template>

      <template #content>
        <KinkRow
          v-for="(row, index) in roleSpecificRows"
          :key="`${row.kink.key}_${row.position}`"
          :category-id="categoryId"
          :kink="row.kink"
          :position="row.position"
          :is-last-item="index === roleSpecificRows.length - 1"
        />
      </template>
    </KinkSectionContainer>
  </div>
</template>

<style>
/* Remove the text-2xs class definition if it exists */
</style>
