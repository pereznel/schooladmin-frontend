<template>
  <div>
    <h1 class="text-2xl font-bold text-gray-900 mb-6">Recursos</h1>

    <!-- Reading list -->
    <section>
      <h2 class="text-base font-semibold text-gray-700 mb-4 flex items-center gap-2">
        <Icon name="heroicons:book-open" class="w-5 h-5 text-primary" />
        Lista de lectura
      </h2>

      <div v-if="pending" class="mb-8">
        <div class="h-4 w-24 bg-gray-200 rounded-full animate-pulse mb-3" />
        <div class="grid grid-cols-1 lg:grid-cols-3 gap-4">
          <div
            v-for="i in 6"
            :key="i"
            class="bg-white rounded-xl border border-gray-200 p-4 flex flex-col gap-3"
          >
            <!-- Icon + title block -->
            <div class="flex items-start gap-3">
              <div class="w-10 h-10 rounded-lg bg-gray-200 animate-pulse shrink-0" />
              <div class="flex-1 flex flex-col gap-2 pt-1">
                <div class="h-3.5 bg-gray-200 rounded-full animate-pulse w-full" />
                <div class="h-3.5 bg-gray-200 rounded-full animate-pulse w-3/4" />
                <div class="h-3 bg-gray-100 rounded-full animate-pulse w-1/2 mt-0.5" />
              </div>
            </div>
            <!-- Teacher -->
            <div class="h-3 bg-gray-100 rounded-full animate-pulse w-2/5" />
            <!-- Button -->
            <div class="h-8 bg-gray-100 rounded-lg animate-pulse mt-auto" />
          </div>
        </div>
      </div>

      <div v-else-if="books?.length" class="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <div
          v-for="book in books"
          :key="book.id"
          class="bg-white rounded-xl border border-gray-200 p-4 flex flex-col gap-3 hover:border-primary/40 hover:shadow-sm transition-all"
        >
          <div class="flex items-start gap-3">
            <div class="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
              <Icon name="heroicons:book-open" class="w-5 h-5 text-primary" />
            </div>
            <div class="min-w-0 flex-1">
              <div class="flex items-start justify-between gap-2">
                <p class="font-semibold text-gray-900 leading-snug line-clamp-2">{{ book.title }}</p>
                <span class="shrink-0 text-[10px] font-semibold text-amber-700 bg-amber-100 px-1.5 py-0.5 rounded-full">
                  {{ book.month_display }}
                </span>
              </div>
              <p class="text-sm text-gray-500 mt-0.5">{{ book.author }}</p>
            </div>
          </div>

          <div class="flex items-center gap-1.5 text-xs text-gray-400">
            <Icon name="heroicons:user" class="w-3.5 h-3.5 shrink-0" />
            <span class="truncate">{{ book.teacher_name }}</span>
          </div>

          <a
            :href="book.pdf_url"
            target="_blank"
            rel="noopener noreferrer"
            class="mt-auto flex items-center justify-center gap-1.5 px-3 py-2 rounded-lg bg-gray-100 text-gray-600 text-xs font-medium hover:bg-gray-200 transition-colors"
          >
            <Icon name="heroicons:document-arrow-down" class="w-4 h-4" />
            Ver PDF
          </a>
        </div>
      </div>

      <UiEmptyState v-else title="Sin libros" description="Aún no hay libros en la lista de lectura" icon="heroicons:book-open" />
    </section>
  </div>
</template>

<script setup lang="ts">
import { useResources } from '../composables/useResources'

const { fetchReadingList } = useResources()

const { data: books, pending } = useAsyncData('reading-list', () => fetchReadingList())
</script>
