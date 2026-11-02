<template>
  <div>
    <div v-if="pendingBanks" class="grid grid-cols-1 lg:grid-cols-2 gap-4">
      <div v-for="i in 3" :key="i" class="h-44 rounded-xl bg-gray-100 animate-pulse" />
    </div>

    <div v-else-if="bankAccounts?.length" class="grid grid-cols-1 lg:grid-cols-2 gap-4">
      <div
        v-for="account in bankAccounts"
        :key="account.id"
        class="bg-white rounded-xl border border-gray-200 p-5 flex flex-col gap-4 hover:border-primary/30 hover:shadow-sm transition-all"
      >
        <!-- Header: bank + favorite badge -->
        <div class="flex items-start justify-between gap-2">
          <div class="flex items-center gap-2">
            <div class="w-9 h-9 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
              <Icon name="heroicons:building-library" class="w-5 h-5 text-primary" />
            </div>
            <div>
              <p class="font-semibold text-gray-900 text-sm">{{ account.bank }}</p>
              <p class="text-xs text-gray-500">{{ account.account_type_display }}</p>
            </div>
          </div>
          <span
            v-if="account.is_favorite"
            class="shrink-0 flex items-center gap-1 text-[10px] font-semibold px-2 py-0.5 rounded-full bg-amber-100 text-amber-700"
          >
            <Icon name="heroicons:star-solid" class="w-3 h-3" />
            Favorita
          </span>
        </div>

        <!-- Account details -->
        <dl class="grid grid-cols-2 gap-x-4 gap-y-2.5 text-sm">
          <div>
            <dt class="text-xs text-gray-400 mb-0.5">Titular</dt>
            <dd class="font-medium text-gray-800">{{ account.name }}</dd>
          </div>
          <div>
            <dt class="text-xs text-gray-400 mb-0.5">RUT</dt>
            <dd class="font-medium text-gray-800">{{ account.rut }}</dd>
          </div>
          <div>
            <dt class="text-xs text-gray-400 mb-0.5">N° de cuenta</dt>
            <dd class="font-medium text-gray-800 font-mono">{{ account.account_number }}</dd>
          </div>
          <div>
            <dt class="text-xs text-gray-400 mb-0.5">Correo</dt>
            <dd class="font-medium text-gray-800 truncate">{{ account.email }}</dd>
          </div>
        </dl>

        <!-- Copy button -->
        <button
          class="w-full flex items-center justify-center gap-2 py-2 rounded-lg border text-sm font-medium transition-all duration-200"
          :class="copiedId === account.id
            ? 'border-green-200 bg-green-50 text-green-600'
            : 'border-gray-200 bg-gray-50 text-gray-500 hover:border-primary/40 hover:bg-primary/5 hover:text-primary'"
          @click="copyAccount(account)"
        >
          <Icon
            :name="copiedId === account.id ? 'heroicons:check' : 'heroicons:clipboard-document'"
            class="w-4 h-4 transition-all duration-200"
            :class="copiedId === account.id ? 'scale-110' : 'scale-100'"
          />
          {{ copiedId === account.id ? 'Datos copiados' : 'Copiar datos bancarios' }}
        </button>
      </div>
    </div>

    <UiEmptyState v-else title="Sin cuentas bancarias" icon="heroicons:building-library" />
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { useFinance, type BankAccount } from '../../composables/useFinance'

const copiedId = ref<number | null>(null)

function copyAccount(account: BankAccount) {
  const text = [
    `Nombre: ${account.name}`,
    `RUT: ${account.rut}`,
    `Banco: ${account.bank}`,
    `Tipo de cuenta: ${account.account_type_display}`,
    `Número de cuenta: ${account.account_number}`,
    `Correo: ${account.email}`,
  ].join('\n')
  navigator.clipboard.writeText(text).then(() => {
    copiedId.value = account.id
    setTimeout(() => { copiedId.value = null }, 2000)
  })
}

const { fetchBankAccounts } = useFinance()

const { data: bankAccounts, pending: pendingBanks } = useAsyncData(
  'finance-bank-accounts',
  () => fetchBankAccounts()
)
</script>
