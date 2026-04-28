import { useState, type FormEvent } from 'react'
import { setApiKey } from '../lib/storage'

type Props = {
  onSaved: (key: string) => void
}

export function ApiKeyGate({ onSaved }: Props) {
  const [value, setValue] = useState('')
  const [show, setShow] = useState(false)

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault()
    const trimmed = value.trim()
    if (!trimmed) return
    setApiKey(trimmed)
    onSaved(trimmed)
  }

  return (
    <form className="card gate" onSubmit={handleSubmit}>
      <h1 className="gate__title">Введите ваш Pangram API-ключ</h1>
      <p className="gate__hint">
        Ключ сохранится локально в вашем браузере и не уходит ни на какие
        сервера, кроме официального API Pangram Labs.
      </p>

      <div className="input-wrap">
        <input
          className="input"
          type={show ? 'text' : 'password'}
          placeholder="pangram_xxx..."
          value={value}
          onChange={(e) => setValue(e.target.value)}
          autoFocus
        />
        <button
          type="button"
          className="input-toggle"
          onClick={() => setShow((s) => !s)}
          aria-label={show ? 'Скрыть ключ' : 'Показать ключ'}
        >
          {show ? 'Скрыть' : 'Показать'}
        </button>
      </div>

      <button className="button button--primary" type="submit" disabled={!value.trim()}>
        Продолжить
      </button>
    </form>
  )
}
