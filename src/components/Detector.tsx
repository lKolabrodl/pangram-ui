import { useMemo, useState, type ReactNode } from 'react'
import {
  categoryFromLabel,
  categoryFromShort,
  detectText,
  formatPercent,
  type PangramResult,
  type Window,
} from '../lib/pangram'

type Props = {
  apiKey: string
}

export function Detector({ apiKey }: Props) {
  const [text, setText] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [result, setResult] = useState<PangramResult | null>(null)
  const [showSegments, setShowSegments] = useState(false)
  const [showRaw, setShowRaw] = useState(false)

  const charCount = text.length
  const wordCount = text.trim() ? text.trim().split(/\s+/).length : 0

  const handleSubmit = async () => {
    if (!text.trim()) return
    setLoading(true)
    setError(null)
    setResult(null)
    setShowSegments(false)
    setShowRaw(false)
    try {
      const data = await detectText(apiKey, text)
      setResult(data)
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Неизвестная ошибка')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="detector">
      <section className="card">
        <label className="label" htmlFor="text-input">
          Текст для проверки
        </label>
        <textarea
          id="text-input"
          className="textarea"
          placeholder="Вставьте сюда текст..."
          value={text}
          onChange={(e) => setText(e.target.value)}
          rows={12}
        />
        <div className="row">
          <div className="meta">
            <span>{wordCount} слов</span>
            <span className="dot" />
            <span>{charCount} символов</span>
          </div>
          <button
            className="button button--primary"
            disabled={!text.trim() || loading}
            onClick={handleSubmit}
          >
            {loading ? 'Анализирую…' : 'Проверить'}
          </button>
        </div>
        {error && <div className="alert">{error}</div>}
      </section>

      {result && (
        <ResultView
          result={result}
          submittedText={text}
          showSegments={showSegments}
          onToggleSegments={() => setShowSegments((s) => !s)}
          showRaw={showRaw}
          onToggleRaw={() => setShowRaw((s) => !s)}
        />
      )}
    </div>
  )
}

type ResultProps = {
  result: PangramResult
  submittedText: string
  showSegments: boolean
  onToggleSegments: () => void
  showRaw: boolean
  onToggleRaw: () => void
}

function ResultView({
  result,
  submittedText,
  showSegments,
  onToggleSegments,
  showRaw,
  onToggleRaw,
}: ResultProps) {
  const tagCategory = categoryFromShort(result.prediction_short)
  const fractions = {
    ai: result.fraction_ai ?? 0,
    assisted: result.fraction_ai_assisted ?? 0,
    human: result.fraction_human ?? 0,
  }
  const hasFractions =
    fractions.ai + fractions.assisted + fractions.human > 0

  const sourceText = result.text ?? submittedText
  const windows = result.windows ?? []

  return (
    <section className={`card result result--${tagCategory}`}>
      <div className="result__head">
        <div>
          {result.headline && <div className="headline">{result.headline}</div>}
          {result.prediction && (
            <div className="prediction">{result.prediction}</div>
          )}
        </div>
        {result.prediction_short && (
          <span className={`tag tag--${tagCategory}`}>
            {result.prediction_short}
          </span>
        )}
      </div>

      {hasFractions && (
        <>
          <div className="stacked">
            <div
              className="stacked__seg stacked__seg--ai"
              style={{ width: `${fractions.ai * 100}%` }}
            />
            <div
              className="stacked__seg stacked__seg--assisted"
              style={{ width: `${fractions.assisted * 100}%` }}
            />
            <div
              className="stacked__seg stacked__seg--human"
              style={{ width: `${fractions.human * 100}%` }}
            />
          </div>
          <div className="legend">
            <Legend cat="ai" label="AI" value={fractions.ai} />
            <Legend cat="assisted" label="С помощью AI" value={fractions.assisted} />
            <Legend cat="human" label="Человек" value={fractions.human} />
          </div>
        </>
      )}

      {(result.num_ai_segments != null ||
        result.num_ai_assisted_segments != null ||
        result.num_human_segments != null) && (
        <div className="counts">
          {result.num_ai_segments != null && (
            <span>
              <b>{result.num_ai_segments}</b> AI
            </span>
          )}
          {result.num_ai_assisted_segments != null && (
            <span>
              <b>{result.num_ai_assisted_segments}</b> с помощью AI
            </span>
          )}
          {result.num_human_segments != null && (
            <span>
              <b>{result.num_human_segments}</b> человек
            </span>
          )}
        </div>
      )}

      {windows.length > 0 && (
        <HighlightedText text={sourceText} windows={windows} />
      )}

      {windows.length > 0 && (
        <>
          <button
            type="button"
            className="link link--inline"
            onClick={onToggleSegments}
          >
            {showSegments
              ? 'Скрыть сегменты'
              : `Показать сегменты (${windows.length})`}
          </button>
          {showSegments && <SegmentList windows={windows} />}
        </>
      )}

      <button type="button" className="link link--inline" onClick={onToggleRaw}>
        {showRaw ? 'Скрыть сырой ответ' : 'Показать сырой ответ API'}
      </button>
      {showRaw && <pre className="raw">{JSON.stringify(result, null, 2)}</pre>}
    </section>
  )
}

function Legend({
  cat,
  label,
  value,
}: {
  cat: 'ai' | 'assisted' | 'human'
  label: string
  value: number
}) {
  return (
    <div className="legend__item">
      <span className={`legend__dot legend__dot--${cat}`} />
      <span className="legend__label">{label}</span>
      <span className="legend__value">{formatPercent(value)}</span>
    </div>
  )
}

function HighlightedText({ text, windows }: { text: string; windows: Window[] }) {
  const parts = useMemo(() => {
    const sorted = [...windows].sort((a, b) => a.start_index - b.start_index)
    const out: ReactNode[] = []
    let cursor = 0
    sorted.forEach((w, i) => {
      const start = Math.max(w.start_index, cursor)
      const end = Math.max(w.end_index, start)
      if (start > cursor) {
        out.push(<span key={`gap-${i}`}>{text.slice(cursor, start)}</span>)
      }
      const cat = categoryFromLabel(w.label)
      out.push(
        <mark
          key={i}
          className={`hl hl--${cat}`}
          title={`${w.label} · ${formatPercent(w.ai_assistance_score)} · ${w.confidence}`}
        >
          {text.slice(start, end)}
        </mark>,
      )
      cursor = end
    })
    if (cursor < text.length) {
      out.push(<span key="tail">{text.slice(cursor)}</span>)
    }
    return out
  }, [text, windows])

  return <div className="highlighted">{parts}</div>
}

function SegmentList({ windows }: { windows: Window[] }) {
  return (
    <ol className="windows">
      {windows.map((w, i) => {
        const cat = categoryFromLabel(w.label)
        return (
          <li key={i} className={`window window--${cat}`}>
            <div className="window__head">
              <span className={`tag tag--${cat} tag--sm`}>{w.label}</span>
              <span className="window__meta">
                {formatPercent(w.ai_assistance_score)} · {w.confidence} ·{' '}
                {w.word_count} сл.
              </span>
            </div>
            <div className="window__text">{w.text}</div>
          </li>
        )
      })}
    </ol>
  )
}
