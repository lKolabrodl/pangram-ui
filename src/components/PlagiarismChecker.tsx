import { useState } from 'react'
import {
  detectPlagiarism,
  formatPercent,
  type PlagiarismMatch,
  type PlagiarismResult,
} from '../lib/pangram'

type Props = {
  apiKey: string
}

export function PlagiarismChecker({ apiKey }: Props) {
  const [text, setText] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [result, setResult] = useState<PlagiarismResult | null>(null)
  const [showRaw, setShowRaw] = useState(false)

  const charCount = text.length
  const wordCount = text.trim() ? text.trim().split(/\s+/).length : 0

  const handleSubmit = async () => {
    if (!text.trim()) return
    setLoading(true)
    setError(null)
    setResult(null)
    setShowRaw(false)
    try {
      const data = await detectPlagiarism(apiKey, text)
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
        <label className="label" htmlFor="plagiarism-input">
          Текст для проверки на плагиат
        </label>
        <textarea
          id="plagiarism-input"
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
            {loading ? 'Ищу совпадения…' : 'Проверить'}
          </button>
        </div>
        {error && <div className="alert">{error}</div>}
      </section>

      {result && (
        <PlagiarismResultView
          result={result}
          showRaw={showRaw}
          onToggleRaw={() => setShowRaw((s) => !s)}
        />
      )}
    </div>
  )
}

function PlagiarismResultView({
  result,
  showRaw,
  onToggleRaw,
}: {
  result: PlagiarismResult
  showRaw: boolean
  onToggleRaw: () => void
}) {
  const detected = result.plagiarism_detected
  const cat = detected ? 'ai' : 'human'
  const matches = result.plagiarized_content ?? []

  const percent =
    typeof result.percent_plagiarized === 'number'
      ? result.percent_plagiarized
      : null

  return (
    <section className={`card result result--${cat}`}>
      <div className="result__head">
        <div>
          <div className="headline">
            {detected ? 'Найдены совпадения' : 'Совпадений нет'}
          </div>
          <div className="prediction">
            {detected
              ? 'Часть текста совпадает с публичными источниками.'
              : 'В публичных источниках совпадений не обнаружено.'}
          </div>
        </div>
        <span className={`tag tag--${cat}`}>
          {detected ? 'Плагиат' : 'Чисто'}
        </span>
      </div>

      {percent !== null && (
        <>
          <div className="stacked">
            <div
              className={`stacked__seg stacked__seg--${cat}`}
              style={{ width: `${Math.min(percent, 100)}%` }}
            />
          </div>
          <div className="legend">
            <div className="legend__item">
              <span className={`legend__dot legend__dot--${cat}`} />
              <span className="legend__label">Заимствовано</span>
              <span className="legend__value">{percent.toFixed(1)}%</span>
            </div>
            {result.plagiarized_sentences != null &&
              result.total_sentences != null && (
                <div className="legend__item">
                  <span className="legend__label">Предложений</span>
                  <span className="legend__value">
                    {result.plagiarized_sentences} / {result.total_sentences}
                  </span>
                </div>
              )}
          </div>
        </>
      )}

      {matches.length > 0 && (
        <div className="matches">
          <div className="matches__title">Источники ({matches.length})</div>
          <ul className="matches__list">
            {matches.map((m, i) => (
              <MatchItem key={i} match={m} />
            ))}
          </ul>
        </div>
      )}

      <button type="button" className="link link--inline" onClick={onToggleRaw}>
        {showRaw ? 'Скрыть сырой ответ' : 'Показать сырой ответ API'}
      </button>
      {showRaw && <pre className="raw">{JSON.stringify(result, null, 2)}</pre>}
    </section>
  )
}

function MatchItem({ match }: { match: PlagiarismMatch }) {
  const host = (() => {
    try {
      return new URL(match.source_url).hostname.replace(/^www\./, '')
    } catch {
      return match.source_url
    }
  })()

  return (
    <li className="match">
      <div className="match__head">
        <a
          href={match.source_url}
          target="_blank"
          rel="noopener noreferrer"
          className="match__link"
        >
          {host}
        </a>
        <span className="match__score">
          {formatPercent(match.similarity_score)}
        </span>
      </div>
      <div className="match__text">{match.matched_text}</div>
    </li>
  )
}
