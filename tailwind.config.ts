import type { Config } from 'tailwindcss'

export default {
  content: [
    './app/components/**/*.{vue,js,ts}',
    './app/layouts/**/*.vue',
    './app/pages/**/*.vue',
    './app/plugins/**/*.{js,ts}',
    './app/app.vue',
    './app/error.vue',
  ],
  theme: {
    extend: {
      colors: {
        primary: '#C1524A',
        'primary-dark': '#A84040',
        paid: '#16A34A',
        partial: '#D97706',
        overdue: '#C0504D',
        neutral: '#6B7280',
      },
    },
  },
  plugins: [],
} satisfies Config
