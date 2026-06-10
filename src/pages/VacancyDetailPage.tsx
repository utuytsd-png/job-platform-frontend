import { useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import api from '../api/axios'

interface Vacancy {
  id: number
  title: string
  description: string
  company: string
  location: string
  salary: string
  employerFirstName: string
  employerLastName: string
  createdAt: string
}

export default function VacancyDetailPage() {
  const { id } = useParams()
  const navigate = useNavigate()
  const [vacancy, setVacancy] = useState<Vacancy | null>(null)
  const [coverLetter, setCoverLetter] = useState('')
  const [message, setMessage] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [applied, setApplied] = useState(false)
  const user = JSON.parse(localStorage.getItem('user') || '{}')

  useEffect(() => {
    api.get(`/api/vacancies/${id}`).then(res => setVacancy(res.data))
  }, [id])

  const handleApply = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')
    setMessage('')
    try {
      await api.post('/api/applications', {
        vacancyId: Number(id),
        coverLetter
      })
      setApplied(true)
      setMessage('✅ Ваш відгук успішно надіслано!')
      setCoverLetter('')
    } catch (err: any) {
      setError(err.response?.data?.error || 'Помилка при відправці відгуку')
    } finally {
      setLoading(false)
    }
  }

  if (!vacancy) return <div style={{ textAlign: 'center', marginTop: '3rem' }}>Завантаження...</div>

  return (
    <div style={styles.page}>
      <nav style={styles.nav}>
        <span style={styles.logo}>💼 Job Platform</span>
        <button style={styles.backBtn} onClick={() => navigate('/vacancies')}>← До вакансій</button>
      </nav>

      <div style={styles.container}>
        {/* Вакансія */}
        <div style={styles.card}>
          <h1 style={styles.title}>{vacancy.title}</h1>
          <div style={styles.meta}>
            <span style={styles.metaItem}>🏢 {vacancy.company}</span>
            <span style={styles.metaItem}>📍 {vacancy.location}</span>
            {vacancy.salary && <span style={styles.salary}>💰 {vacancy.salary}</span>}
          </div>
          <div style={styles.divider} />
          <h3 style={styles.sectionTitle}>Опис вакансії</h3>
          <p style={styles.description}>{vacancy.description}</p>
          <div style={styles.divider} />
          <p style={styles.author}>
            Опублікував: {vacancy.employerFirstName} {vacancy.employerLastName}
          </p>
        </div>

        {/* Форма відгуку — тільки для JOB_SEEKER */}
        {user.role === 'JOB_SEEKER' && (
          <div style={styles.card}>
            <h2 style={styles.sectionTitle}>Відгукнутись на вакансію</h2>

            {message && <div style={styles.success}>{message}</div>}
            {error && <div style={styles.error}>{error}</div>}

            {!applied && (
              <form onSubmit={handleApply}>
                <div style={styles.field}>
                  <label style={styles.label}>Супровідний лист</label>
                  <textarea
                    style={styles.textarea}
                    value={coverLetter}
                    onChange={e => setCoverLetter(e.target.value)}
                    placeholder="Розкажіть чому ви підходите для цієї позиції..."
                    rows={5}
                    required
                  />
                </div>
                <button style={styles.button} type="submit" disabled={loading}>
                  {loading ? 'Надсилання...' : 'Надіслати відгук'}
                </button>
              </form>
            )}
          </div>
        )}

{user.role === 'EMPLOYER' && (
  <div style={styles.card}>
    <h2 style={styles.sectionTitle}>Керування вакансією</h2>
    <div style={{ display: 'flex', gap: '1rem' }}>
      <button style={styles.button} onClick={() => navigate(`/vacancies/${id}/edit`)}>
        ✏️ Редагувати вакансію
      </button>
      <button style={{...styles.button, background: '#ef4444'}}
        onClick={() => navigate(`/vacancies/${id}/applications`)}>
        📋 Переглянути заявки
      </button>
    </div>
  </div>
)}
      </div>
    </div>
  )
}

const styles: Record<string, React.CSSProperties> = {
  page: { minHeight: '100vh', background: '#f5f5f5' },
  nav: { background: 'white', padding: '1rem 2rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', boxShadow: '0 2px 8px rgba(0,0,0,0.08)' },
  logo: { fontSize: '1.25rem', fontWeight: 700, color: '#4f46e5' },
  backBtn: { padding: '0.4rem 1rem', background: '#f3f4f6', border: 'none', borderRadius: '6px', cursor: 'pointer' },
  container: { maxWidth: '800px', margin: '2rem auto', padding: '0 1rem', display: 'flex', flexDirection: 'column', gap: '1.5rem' },
  card: { background: 'white', borderRadius: '12px', padding: '2rem', boxShadow: '0 2px 8px rgba(0,0,0,0.08)' },
  title: { fontSize: '1.75rem', fontWeight: 700, color: '#1a1a2e', marginBottom: '1rem' },
  meta: { display: 'flex', gap: '1.5rem', flexWrap: 'wrap', marginBottom: '0.5rem' },
  metaItem: { color: '#555', fontSize: '1rem' },
  salary: { color: '#10b981', fontWeight: 600, fontSize: '1rem' },
  divider: { height: '1px', background: '#f0f0f0', margin: '1.5rem 0' },
  sectionTitle: { fontSize: '1.1rem', fontWeight: 600, marginBottom: '1rem', color: '#333' },
  description: { color: '#444', lineHeight: 1.8, whiteSpace: 'pre-wrap' },
  author: { color: '#999', fontSize: '0.85rem' },
  field: { marginBottom: '1rem' },
  label: { display: 'block', marginBottom: '0.5rem', fontWeight: 500, color: '#555' },
  textarea: { width: '100%', padding: '0.75rem', border: '1px solid #ddd', borderRadius: '8px', fontSize: '1rem', boxSizing: 'border-box', resize: 'vertical' },
  button: { width: '100%', padding: '0.75rem', background: '#4f46e5', color: 'white', border: 'none', borderRadius: '8px', fontSize: '1rem', cursor: 'pointer' },
  success: { background: '#d1fae5', color: '#065f46', padding: '0.75rem', borderRadius: '8px', marginBottom: '1rem' },
  error: { background: '#fee2e2', color: '#dc2626', padding: '0.75rem', borderRadius: '8px', marginBottom: '1rem' },
}