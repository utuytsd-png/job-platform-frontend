import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import api from '../api/axios'

export default function CreateVacancyPage() {
  const navigate = useNavigate()
  const [form, setForm] = useState({
    title: '', description: '', company: '', location: '', salary: ''
  })
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')
    try {
      await api.post('/api/vacancies', form)
      navigate('/vacancies')
    } catch {
      setError('Помилка при створенні вакансії')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div style={styles.page}>
      <nav style={styles.nav}>
        <span style={styles.logo}>💼 Job Platform</span>
        <button style={styles.backBtn} onClick={() => navigate('/vacancies')}>← Назад</button>
      </nav>
      <div style={styles.container}>
        <div style={styles.card}>
          <h2 style={styles.title}>Нова вакансія</h2>
          {error && <div style={styles.error}>{error}</div>}
          <form onSubmit={handleSubmit}>
            <div style={styles.field}>
              <label style={styles.label}>Назва посади</label>
              <input style={styles.input} value={form.title} placeholder="Junior Kotlin Developer"
                onChange={e => setForm({...form, title: e.target.value})} required />
            </div>
            <div style={styles.field}>
              <label style={styles.label}>Компанія</label>
              <input style={styles.input} value={form.company} placeholder="Tech UA"
                onChange={e => setForm({...form, company: e.target.value})} required />
            </div>
            <div style={styles.row}>
              <div style={styles.field}>
                <label style={styles.label}>Місто</label>
                <input style={styles.input} value={form.location} placeholder="Київ"
                  onChange={e => setForm({...form, location: e.target.value})} required />
              </div>
              <div style={styles.field}>
                <label style={styles.label}>Зарплата</label>
                <input style={styles.input} value={form.salary} placeholder="1000-2000$"
                  onChange={e => setForm({...form, salary: e.target.value})} />
              </div>
            </div>
            <div style={styles.field}>
              <label style={styles.label}>Опис вакансії</label>
              <textarea style={styles.textarea} value={form.description}
                placeholder="Опишіть вимоги, обов'язки та умови роботи..."
                onChange={e => setForm({...form, description: e.target.value})}
                required rows={6} />
            </div>
            <button style={styles.button} type="submit" disabled={loading}>
              {loading ? 'Публікація...' : 'Опублікувати вакансію'}
            </button>
          </form>
        </div>
      </div>
    </div>
  )
}

const styles: Record<string, React.CSSProperties> = {
  page: { minHeight: '100vh', background: '#f5f5f5' },
  nav: { background: 'white', padding: '1rem 2rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', boxShadow: '0 2px 8px rgba(0,0,0,0.08)' },
  logo: { fontSize: '1.25rem', fontWeight: 700, color: '#4f46e5' },
  backBtn: { padding: '0.4rem 1rem', background: '#f3f4f6', border: 'none', borderRadius: '6px', cursor: 'pointer' },
  container: { maxWidth: '700px', margin: '2rem auto', padding: '0 1rem' },
  card: { background: 'white', borderRadius: '12px', padding: '2rem', boxShadow: '0 2px 8px rgba(0,0,0,0.08)' },
  title: { marginBottom: '1.5rem', color: '#333' },
  row: { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' },
  field: { marginBottom: '1rem' },
  label: { display: 'block', marginBottom: '0.5rem', fontWeight: 500, color: '#555' },
  input: { width: '100%', padding: '0.75rem', border: '1px solid #ddd', borderRadius: '8px', fontSize: '1rem', boxSizing: 'border-box' },
  textarea: { width: '100%', padding: '0.75rem', border: '1px solid #ddd', borderRadius: '8px', fontSize: '1rem', boxSizing: 'border-box', resize: 'vertical' },
  button: { width: '100%', padding: '0.75rem', background: '#4f46e5', color: 'white', border: 'none', borderRadius: '8px', fontSize: '1rem', cursor: 'pointer', marginTop: '0.5rem' },
  error: { background: '#fee2e2', color: '#dc2626', padding: '0.75rem', borderRadius: '8px', marginBottom: '1rem' },
}