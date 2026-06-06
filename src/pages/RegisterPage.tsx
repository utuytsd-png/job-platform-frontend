import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import api from '../api/axios'

export default function RegisterPage() {
  const navigate = useNavigate()
  const [form, setForm] = useState({
    email: '', password: '', firstName: '', lastName: '', role: 'JOB_SEEKER'
  })
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')
    try {
      const res = await api.post('/api/auth/register', form)
      localStorage.setItem('token', res.data.token)
      localStorage.setItem('user', JSON.stringify(res.data))
      navigate('/vacancies')
    } catch {
      setError('Помилка реєстрації. Можливо email вже використовується')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div style={styles.container}>
      <div style={styles.card}>
        <h2 style={styles.title}>Реєстрація</h2>
        {error && <div style={styles.error}>{error}</div>}
        <form onSubmit={handleSubmit}>
          <div style={styles.row}>
            <div style={styles.field}>
              <label style={styles.label}>Ім'я</label>
              <input style={styles.input} value={form.firstName}
                onChange={e => setForm({...form, firstName: e.target.value})} required />
            </div>
            <div style={styles.field}>
              <label style={styles.label}>Прізвище</label>
              <input style={styles.input} value={form.lastName}
                onChange={e => setForm({...form, lastName: e.target.value})} required />
            </div>
          </div>
          <div style={styles.field}>
            <label style={styles.label}>Email</label>
            <input style={styles.input} type="email" value={form.email}
              onChange={e => setForm({...form, email: e.target.value})} required />
          </div>
          <div style={styles.field}>
            <label style={styles.label}>Пароль</label>
            <input style={styles.input} type="password" value={form.password}
              onChange={e => setForm({...form, password: e.target.value})} required />
          </div>
          <div style={styles.field}>
            <label style={styles.label}>Я є</label>
            <select style={styles.input} value={form.role}
              onChange={e => setForm({...form, role: e.target.value})}>
              <option value="JOB_SEEKER">Шукач роботи</option>
              <option value="EMPLOYER">Роботодавець</option>
            </select>
          </div>
          <button style={styles.button} type="submit" disabled={loading}>
            {loading ? 'Завантаження...' : 'Зареєструватись'}
          </button>
        </form>
        <p style={styles.link}>
          Вже є акаунт? <Link to="/login">Увійти</Link>
        </p>
      </div>
    </div>
  )
}

const styles: Record<string, React.CSSProperties> = {
  container: { minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#f5f5f5' },
  card: { background: 'white', padding: '2rem', borderRadius: '12px', boxShadow: '0 2px 16px rgba(0,0,0,0.1)', width: '100%', maxWidth: '450px' },
  title: { textAlign: 'center', marginBottom: '1.5rem', color: '#333' },
  row: { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' },
  field: { marginBottom: '1rem' },
  label: { display: 'block', marginBottom: '0.5rem', fontWeight: 500, color: '#555' },
  input: { width: '100%', padding: '0.75rem', border: '1px solid #ddd', borderRadius: '8px', fontSize: '1rem', boxSizing: 'border-box' },
  button: { width: '100%', padding: '0.75rem', background: '#4f46e5', color: 'white', border: 'none', borderRadius: '8px', fontSize: '1rem', cursor: 'pointer', marginTop: '0.5rem' },
  error: { background: '#fee2e2', color: '#dc2626', padding: '0.75rem', borderRadius: '8px', marginBottom: '1rem' },
  link: { textAlign: 'center', marginTop: '1rem', color: '#666' }
}