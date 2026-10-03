<script setup lang="ts">
import type { ProjectedCategory } from '../../../projection/types'
import { computed } from 'vue'
import { useI18n } from 'vue-i18n'
import KinkRow from './KinkRow.vue'
import KinkSectionContainer from './KinkSectionContainer.vue'
import KinkSectionHeader from './KinkSectionHeader.vue'

// The section renders one projected Category exactly as it arrives: the general
// table and the role-specific table are two lists of Position rows, already
// filtered, so no Position expansion or filter is repeated here.
const props = defineProps<{
  category: ProjectedCategory
}>()
const { t } = useI18n()

const generalRows = computed(() => props.category.general)
const roleSpecificRows = computed(() => props.category.roleSpecific)
const isVisible = computed(() => generalRows.value.length > 0 || roleSpecificRows.value.length > 0)
</script>

<template>
  <div v-if="isVisible" class="mb-2">
    <!-- General Format Kinks Table -->
    <KinkSectionContainer
      v-if="generalRows.length > 0"
      :is-last-section="roleSpecificRows.length === 0"
    >
      <template #header>
        <KinkSectionHeader
          :title="t(`categories.${category.categoryId}`)"
          :column-labels="[t('app.general')]"
          :is-general-section="true"
        />
      </template>

      <template #content>
        <KinkRow
          v-for="(row, index) in generalRows"
          :key="`${row.kink.id}_${row.position}`"
          :category-id="category.categoryId"
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
          :title="t(`categories.${category.categoryId}`)"
          :column-labels="[t('app.preference')]"
          :is-general-section="false"
        />
      </template>

      <template #content>
        <KinkRow
          v-for="(row, index) in roleSpecificRows"
          :key="`${row.kink.key}_${row.position}`"
          :category-id="category.categoryId"
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
