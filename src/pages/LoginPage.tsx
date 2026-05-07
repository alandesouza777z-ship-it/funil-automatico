import { useState } from 'react'
import { motion } from 'framer-motion'
import { MOCK_LOGIN_EMAIL } from '../utils/storage'

interface LoginPageProps {
  onLogin: (email: string) => void
}

export function LoginPage({ onLogin }: LoginPageProps) {
  const [email, setEmail] = useState(MOCK_LOGIN_EMAIL)
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    if (email.trim().toLowerCase() !== MOCK_LOGIN_EMAIL) {
      setError('Use o e-mail liberado para este acesso local.')
      return
    }
    setError('')
    onLogin(email.trim().toLowerCase())
  }

  return (
    <div className="login-page">
      <div className="login-page__bg" />

      <motion.div
        className="login-card"
        initial={{ opacity: 0, y: 20, scale: 0.98 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.35, ease: 'easeOut' }}
      >
        <div className="login-card__brand">
          <div className="brand-logo brand-logo--lg">
            <svg width="32" height="32" viewBox="0 0 28 28" fill="none">
              <path d="M4 6 L14 22 L24 6 Z" fill="white" opacity="0.9"/>
              <path d="M8 6 L14 16 L20 6 Z" fill="white" opacity="0.5"/>
            </svg>
          </div>
          <div>
            <span className="login-card__tag">Local Access</span>
            <h1 className="login-card__title">Funnelby</h1>
          </div>
        </div>

        <div className="login-card__copy">
          <h2>Entre para abrir o builder.</h2>
          <p>Prototipação local do canvas de funis com foco na UX.</p>
        </div>

        <form className="login-card__form" onSubmit={handleSubmit}>
          <label className="field">
            <span>E-mail</span>
            <input value={email} onChange={(e) => setEmail(e.target.value)} placeholder="seuemail@dominio.com" />
          </label>

          <label className="field">
            <span>Senha</span>
            <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="••••••••" />
          </label>

          {error && <div className="login-card__error">{error}</div>}

          <button type="submit" className="btn btn--primary btn--full btn--lg">
            Entrar no Funnelby
          </button>
        </form>
      </motion.div>
    </div>
  )
}
