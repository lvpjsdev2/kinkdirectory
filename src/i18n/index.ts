/* eslint-disable unused-imports/no-unused-vars */
import type nl from '../locales/nl.json'
import { createI18n } from 'vue-i18n'
import en from '../locales/en.json'
import ru from '../locales/ru.json'

export type MessageSchema = typeof nl

// Locales offered in the UI. Dutch is not offered: it stays as the source of
// the type-safe message schema (`MessageSchema = typeof nl`) and the language new
// labels are authored in. See docs/adr/0001.
const SUPPORTED_LOCALES = ['en', 'ru'] as const
type SupportedLocale = typeof SUPPORTED_LOCALES[number]

// Create a map of all locale messages for type safety
const messages: Record<SupportedLocale, MessageSchema | Partial<MessageSchema>> = {
  en,
  ru,
}

const i18n = createI18n({
  legacy: false,
  locale: 'en',
  fallbackLocale: 'en',
  messages,
  missingWarn: false, // Disable warnings for missing translations
})

export default i18n
