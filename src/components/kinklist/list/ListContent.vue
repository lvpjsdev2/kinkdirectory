<script setup lang="ts">
import { computed } from 'vue'
import { useI18n } from 'vue-i18n'
import { useKinkListState } from '../../../composables/useKinkList'
import { useListProjection } from '../../../composables/useListProjection'
import KinkSection from '../../kinklist/kink/KinkSection.vue'

const { t } = useI18n()
const {
  activeList,
  kinkModalState,
  closeKinkModal,
  filters,
  hasActiveFilters,
  clearAllFilters,
} = useKinkListState()

// The screen renders exactly the Category groups the projection produced, and
// Progress comes from the same projection. A Category with no visible rows is
// already omitted upstream, and filters were applied per Position row, so no
// Kink is re-expanded or re-filtered here.
const { screen, progress } = useListProjection()

const visibleCategories = computed(() => screen.value.categories)
</script>

<template>
  <div>
    <!-- Progress bar -->
    <div v-if="activeList" class="mb-3">
      <div class="flex items-center justify-between mb-1">
        <div class="flex items-center gap-1">
          <span class="text-xs font-medium text-gray-500 dark:text-gray-400">{{ t('app.progress') }}:</span>
          <span class="text-xs opacity-80" :class="progress.percentage === 100 ? 'text-green-500 dark:text-green-400 font-medium' : 'text-gray-500 dark:text-gray-400'">
            {{ progress.completed }}/{{ progress.total }} ({{ progress.percentage }}%)
          </span>
          <UIcon
            v-if="progress.percentage === 100"
            name="i-lucide-check-circle"
            class="text-green-500 dark:text-green-400 text-sm opacity-80"
          />
        </div>
        <UButton
          v-if="progress.total > progress.completed"
          size="xs"
          color="neutral"
          variant="ghost"
          :icon="filters.showOnlyUnfilled ? 'i-lucide-eye-off' : 'i-lucide-eye'"
          @click="filters.showOnlyUnfilled = !filters.showOnlyUnfilled"
        >
          {{ t(filters.showOnlyUnfilled ? 'app.hide_unfilled' : 'app.show_unfilled') }}
          <span class="ml-1 text-xs text-gray-500">({{ progress.total - progress.completed }})</span>
        </UButton>
      </div>
      <div class="w-full bg-gray-100 dark:bg-gray-800 rounded-full h-1.5">
        <div
          class="h-1.5 rounded-full transition-all duration-500 ease-out"
          :class="progress.percentage === 100 ? 'bg-green-500 dark:bg-green-400' : 'bg-primary-500'"
          :style="{ width: `${progress.percentage}%` }"
        />
      </div>
    </div>

    <!-- Combined filter notice when any filters are active -->

    <!-- List content for screenshot -->
    <div id="kink-list-content" class="max-w-full overflow-x-hidden p-0">
      <!-- Empty state when filters return no results -->
      <div v-if="visibleCategories.length === 0 && hasActiveFilters" class="text-center py-8">
        <UIcon name="i-lucide-filter-x" class="text-4xl text-gray-400 dark:text-gray-600 mx-auto mb-2" />
        <p class="text-gray-500 dark:text-gray-400">
          <template v-if="(filters.showOnlyNew || filters.showOnlyUnfilled) && filters.choiceFilters.length > 0">
            {{ t('app.no_results_with_filters') }}
          </template>
          <template v-else-if="filters.showOnlyNew && filters.showOnlyUnfilled">
            {{ t('app.no_results_with_filters') }}
          </template>
          <template v-else-if="filters.showOnlyNew">
            {{ t('app.no_new_items_found') }}
          </template>
          <template v-else-if="filters.showOnlyUnfilled">
            {{ t('app.no_unfilled_items_found') }}
          </template>
          <template v-else-if="filters.choiceFilters.length > 0">
            {{ t('app.no_results_with_filters') }}
          </template>
        </p>
        <UButton size="sm" color="neutral" class="mt-4" @click="clearAllFilters">
          {{ t('app.clear_all_filters') }}
        </UButton>
      </div>

      <!-- Masonry-style layout for better space filling -->
      <div v-else class="columns-1 md:columns-2 xl:columns-3 gap-6 space-y-6">
        <div
          v-for="category in visibleCategories"
          :key="category.categoryId"
          class="category-container inline-block w-full mb-2"
        >
          <h2 class="text-base font-bold mb-1.5 pb-1.5 border-b-1 border-gray-200 dark:border-gray-700">
            {{ t(`categories.${category.categoryId}`) }}
          </h2>

          <!-- Kinks section -->
          <KinkSection :category="category" />
        </div>
      </div>
    </div>

    <!-- Kink Detail Modal -->
    <UModal v-model:open="kinkModalState.isOpen" :title="kinkModalState.title">
      <template #body>
        <p>{{ kinkModalState.description }}</p>
      </template>

      <template #footer>
        <div class="flex justify-end">
          <UButton color="primary" @click="closeKinkModal">
            Close
          </UButton>
        </div>
      </template>
    </UModal>
  </div>
</template>

<style scoped>
.category-container {
  break-inside: avoid;
  page-break-inside: avoid;
}
</style>
