import { useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import api from '../api/axios'

export default function EditVacancyPage() {
  const { id } = useParams()
  const navigate = useNavigate()
  const [form, setForm] = useState({
    title: '', description: '', company: '', location: '', salary: ''
  })
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    api.get(`/api/vacancies/${id}`).then(res => {
      const v = res.data
      setForm({
        title: v.title,
        description: v.description,
        company: v.company,
        location: v.location,
        salary: v.salary
      })
    })
  }, [id])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    try {
      await api.put(`/api/vacancies/${id}`, form)
      navigate('/vacancies')
    } catch {
      setError('Помилка при оновленні вакансії')
    } finally {
      setLoading(false)
    }
  }

const handleDelete = async () => {
  console.log('handleDelete викликано, id:', id)
  if (!window.confirm('Видалити вакансію?')) return
  console.log('Відправляємо DELETE на:', `/api/vacancies/${id}`)
  try {
    const res = await api.delete(`/api/vacancies/${id}`)
    console.log('Відповідь:', res)
    navigate('/vacancies')
  } catch (err: any) {
    console.error('Помилка:', err)
    setError(err.response?.data?.error || 'Помилка при видаленні')
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
          <div style={styles.cardHeader}>
            <h2 style={styles.title}>Редагувати вакансію</h2>
            <button style={styles.deleteBtn} onClick={handleDelete}>🗑 Видалити</button>
          </div>
          {error && <div style={styles.error}>{error}</div>}
          <form onSubmit={handleSubmit}>
            <div style={styles.field}>
              <label style={styles.label}>Назва посади</label>
              <input style={styles.input} value={form.title}
                onChange={e => setForm({...form, title: e.target.value})} required />
            </div>
            <div style={styles.field}>
              <label style={styles.label}>Компанія</label>
              <input style={styles.input} value={form.company}
                onChange={e => setForm({...form, company: e.target.value})} required />
            </div>
            <div style={styles.row}>
              <div style={styles.field}>
                <label style={styles.label}>Місто</label>
                <input style={styles.input} value={form.location}
                  onChange={e => setForm({...form, location: e.target.value})} required />
              </div>
              <div style={styles.field}>
                <label style={styles.label}>Зарплата</label>
                <input style={styles.input} value={form.salary}
                  onChange={e => setForm({...form, salary: e.target.value})} />
              </div>
            </div>
            <div style={styles.field}>
              <label style={styles.label}>Опис вакансії</label>
              <textarea style={styles.textarea} value={form.description} rows={6}
                onChange={e => setForm({...form, description: e.target.value})} required />
            </div>
            <button style={styles.button} type="submit" disabled={loading}>
              {loading ? 'Збереження...' : 'Зберегти зміни'}
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
  cardHeader: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' },
  title: { color: '#333' },
  deleteBtn: { padding: '0.5rem 1rem', background: '#fee2e2', color: '#dc2626', border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: 600 },
  row: { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' },
  field: { marginBottom: '1rem' },
  label: { display: 'block', marginBottom: '0.5rem', fontWeight: 500, color: '#555' },
  input: { width: '100%', padding: '0.75rem', border: '1px solid #ddd', borderRadius: '8px', fontSize: '1rem', boxSizing: 'border-box' },
  textarea: { width: '100%', padding: '0.75rem', border: '1px solid #ddd', borderRadius: '8px', fontSize: '1rem', boxSizing: 'border-box', resize: 'vertical' },
  button: { width: '100%', padding: '0.75rem', background: '#4f46e5', color: 'white', border: 'none', borderRadius: '8px', fontSize: '1rem', cursor: 'pointer' },
  error: { background: '#fee2e2', color: '#dc2626', padding: '0.75rem', borderRadius: '8px', marginBottom: '1rem' },
}