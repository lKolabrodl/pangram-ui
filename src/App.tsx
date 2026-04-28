import { useState } from 'react'
import { ApiKeyGate } from './components/ApiKeyGate'
import { Detector } from './components/Detector'
import { PlagiarismChecker } from './components/PlagiarismChecker'
import { clearApiKey, getApiKey } from './lib/storage'
import './App.css'

type Mode = 'ai' | 'plagiarism'

export default function App() {
  const [apiKey, setApiKeyState] = useState<string | null>(() => getApiKey())
  const [mode, setMode] = useState<Mode>('ai')

  const handleLogout = () => {
    clearApiKey()
    setApiKeyState(null)
  }

  return (
    <div className="app">
      <header className="app__header">
        <div className="brand">
          <span className="brand__dot" />
          <span className="brand__name">Pangram UI</span>
        </div>
        {apiKey && (
          <button className="link" onClick={handleLogout}>
            Сменить ключ
          </button>
        )}
      </header>

      <main className="app__main">
        {apiKey ? (
          <>
            <div className="tabs">
              <button
                type="button"
                className={`tab ${mode === 'ai' ? 'tab--active' : ''}`}
                onClick={() => setMode('ai')}
              >
                AI-детектор
              </button>
              <button
                type="button"
                className={`tab ${mode === 'plagiarism' ? 'tab--active' : ''}`}
                onClick={() => setMode('plagiarism')}
              >
                Плагиат
              </button>
            </div>
            {mode === 'ai' ? (
              <Detector apiKey={apiKey} />
            ) : (
              <PlagiarismChecker apiKey={apiKey} />
            )}
          </>
        ) : (
          <ApiKeyGate onSaved={setApiKeyState} />
        )}
      </main>

      <footer className="app__footer">
        <span>Ключ хранится локально в вашем браузере.</span>
      </footer>
    </div>
  )
}
