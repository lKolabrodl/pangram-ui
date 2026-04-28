export type Window = {
  text: string
  label: string
  ai_assistance_score: number
  confidence: string
  start_index: number
  end_index: number
  word_count: number
  token_length: number
}

export type PangramResult = {
  text?: string
  version?: string
  headline?: string
  prediction?: string
  prediction_short?: string
  fraction_ai?: number
  fraction_ai_assisted?: number
  fraction_human?: number
  num_ai_segments?: number
  num_ai_assisted_segments?: number
  num_human_segments?: number
  windows?: Window[]
  [key: string]: unknown
}

const ENDPOINT = '/api/pangram'

export async function detectText(apiKey: string, text: string): Promise<PangramResult> {
  const response = await fetch(ENDPOINT, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-api-key': apiKey,
    },
    body: JSON.stringify({ text }),
  })

  if (!response.ok) {
    const errorText = await response.text().catch(() => '')
    throw new Error(`API ${response.status}: ${errorText || response.statusText}`)
  }

  return (await response.json()) as PangramResult
}

export type Category = 'ai' | 'assisted' | 'human'

export function categoryFromLabel(label: string): Category {
  const l = label.toLowerCase()
  if (l.includes('human')) return 'human'
  if (l.includes('assist')) return 'assisted'
  return 'ai'
}

export function categoryFromShort(short: string | undefined): Category {
  if (!short) return 'ai'
  const s = short.toLowerCase()
  if (s.includes('human')) return 'human'
  if (s.includes('mix') || s.includes('assist')) return 'assisted'
  return 'ai'
}

export function formatPercent(value: number): string {
  const pct = value * 100
  if (pct === 0) return '0%'
  if (pct < 0.01) return '< 0.01%'
  if (pct < 1) return `${pct.toFixed(2)}%`
  if (pct < 10) return `${pct.toFixed(1)}%`
  return `${Math.round(pct)}%`
}

// === Plagiarism ===

export type PlagiarismMatch = {
  source_url: string
  matched_text: string
  similarity_score: number
}

export type PlagiarismResult = {
  text?: string
  plagiarism_detected: boolean
  plagiarized_content?: PlagiarismMatch[]
  total_sentences?: number
  plagiarized_sentences?: number
  percent_plagiarized?: number
  [key: string]: unknown
}

const PLAGIARISM_ENDPOINT = '/api/plagiarism'

export async function detectPlagiarism(
  apiKey: string,
  text: string,
): Promise<PlagiarismResult> {
  const response = await fetch(PLAGIARISM_ENDPOINT, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-api-key': apiKey,
    },
    body: JSON.stringify({ text }),
  })

  if (!response.ok) {
    const errorText = await response.text().catch(() => '')
    throw new Error(`API ${response.status}: ${errorText || response.statusText}`)
  }

  return (await response.json()) as PlagiarismResult
}
