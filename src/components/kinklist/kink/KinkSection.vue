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
const { activeList, isKinkVisibleForRole, getKinkPositions, filters, shouldShowKink } = useKinkListState()

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

// Expand kinks into one entry per position. Each row carries exactly one
// position, and filters are evaluated at that level as well so a kink cannot
// leak through just because another of its positions matches.
const roleSpecificRows = computed(() => {
  if (!activeList.value)
    return []

  const rows: Array<{ kink: KinkDefinition, position: KinkPosition }> = []

  for (const kink of roleSpecificKinks.value) {
    const positions = getKinkPositions(kink, activeList.value.role)

    // Kink-level gate first (new / category visibility), then position-level
    // filters (unfilled / choice). Both must agree for the row to appear.
    const passesKinkFilters = shouldShowKink(kink)
    const matchingPositions = passesKinkFilters
      ? positions.filter(position => {
          // "Only unfilled" means this position has no stored choice yet.
          if (filters.value.showOnlyUnfilled)
            return getKinkChoice(kink, position) === 0

          // Choice filters require this position to have one of the selected
          // choices stored; filled positions are still admitted when the
          // filter is inactive.
          if (filters.value.choiceFilters.length > 0) {
            const choice = getKinkChoice(kink, position)
            return filters.value.choiceFilters.includes(choice)
          }

          return true
        })
      : []

    for (const position of matchingPositions) {
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
