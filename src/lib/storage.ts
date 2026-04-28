const KEY = 'pangram.apiKey'

export const getApiKey = (): string | null => {
  try {
    return localStorage.getItem(KEY)
  } catch {
    return null
  }
}

export const setApiKey = (value: string): void => {
  localStorage.setItem(KEY, value.trim())
}

export const clearApiKey = (): void => {
  localStorage.removeItem(KEY)
}
