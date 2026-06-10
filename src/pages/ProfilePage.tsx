import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import api from '../api/axios'

interface Profile {
  userId: number
  firstName: string
  lastName: string
  email: string
  role: string
  skills: string
  experience: string
  education: string
  resumeText: string
}

export default function ProfilePage() {
  const navigate = useNavigate()
  const [profile, setProfile] = useState<Profile | null>(null)
  const [form, setForm] = useState({
    firstName: '', lastName: '', skills: '',
    experience: '', education: '', resumeText: ''
  })
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [success, setSuccess] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    if (!localStorage.getItem('token')) { navigate('/login'); return }
    api.get('/api/profile').then(res => {
      setProfile(res.data)
      setForm({
        firstName: res.data.firstName,
        lastName: res.data.lastName,
        skills: res.data.skills,
        experience: res.data.experience,
        education: res.data.education,
        resumeText: res.data.resumeText
      })
    }).finally(() => setLoading(false))
  }, [])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSaving(true)
    setSuccess(false)
    setError('')
    try {
      const res = await api.put('/api/profile', form)
      // Оновлюємо localStorage
      const user = JSON.parse(localStorage.getItem('user') || '{}')
      user.firstName = form.firstName
      user.lastName = form.lastName
      localStorage.setItem('user', JSON.stringify(user))
      setProfile(res.data)
      setSuccess(true)
      setTimeout(() => setSuccess(false), 3000)
    } catch {
      setError('Помилка при збереженні')
    } finally {
      setSaving(false)
    }
  }

  if (loading) return <div style={styles.center}>Завантаження...</div>

  const isEmployer = profile?.role === 'EMPLOYER'

  return (
    <div style={styles.page}>
      <nav style={styles.nav}>
        <span style={styles.logo}>💼 Job Platform</span>
        <button style={styles.backBtn} onClick={() => navigate('/vacancies')}>← Назад</button>
      </nav>

      <div style={styles.container}>
        {/* Шапка профілю */}
        <div style={styles.headerCard}>
          <div style={styles.avatar}>
            {form.firstName?.[0]}{form.lastName?.[0]}
          </div>
          <div>
            <h2 style={styles.name}>{form.firstName} {form.lastName}</h2>
            <p style={styles.email}>{profile?.email}</p>
            <span style={styles.badge}>
              {isEmployer ? '🏢 Роботодавець' : '👤 Шукач роботи'}
            </span>
          </div>
        </div>

        {/* Форма */}
        <div style={styles.card}>
          <h3 style={styles.sectionTitle}>✏️ Редагувати профіль</h3>

          {success && <div style={styles.success}>✅ Профіль збережено!</div>}
          {error && <div style={styles.error}>{error}</div>}

          <form onSubmit={handleSubmit}>
            {/* Основні дані */}
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

            {/* Тільки для кандидата */}
            {!isEmployer && (
              <>
                <div style={styles.field}>
                  <label style={styles.label}>🛠 Навички (через кому)</label>
                  <input style={styles.input}
                    placeholder="Kotlin, React, Spring Boot, SQL..."
                    value={form.skills}
                    onChange={e => setForm({...form, skills: e.target.value})} />
                  {form.skills && (
                    <div style={styles.tags}>
                      {form.skills.split(',').map((s, i) => (
                        <span key={i} style={styles.tag}>{s.trim()}</span>
                      ))}
                    </div>
                  )}
                </div>

                <div style={styles.field}>
                  <label style={styles.label}>💼 Досвід роботи</label>
                  <textarea style={styles.textarea} rows={4}
                    placeholder="Опишіть ваш досвід роботи..."
                    value={form.experience}
                    onChange={e => setForm({...form, experience: e.target.value})} />
                </div>

                <div style={styles.field}>
                  <label style={styles.label}>🎓 Освіта</label>
                  <textarea style={styles.textarea} rows={3}
                    placeholder="Університет, спеціальність, рік закінчення..."
                    value={form.education}
                    onChange={e => setForm({...form, education: e.target.value})} />
                </div>

                <div style={styles.field}>
                  <label style={styles.label}>📝 Про себе</label>
                  <textarea style={styles.textarea} rows={3}
                    placeholder="Короткий опис — хто ви і чого шукаєте..."
                    value={form.resumeText}
                    onChange={e => setForm({...form, resumeText: e.target.value})} />
                </div>
              </>
            )}

            <button style={styles.button} type="submit" disabled={saving}>
              {saving ? 'Збереження...' : '💾 Зберегти зміни'}
            </button>
          </form>
        </div>
      </div>
    </div>
  )
}

const styles: Record<string, React.CSSProperties> = {
  page: { minHeight: '100vh', background: '#f5f5f5' },
  center: { display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' },
  nav: { background: 'white', padding: '1rem 2rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', boxShadow: '0 2px 8px rgba(0,0,0,0.08)' },
  logo: { fontSize: '1.25rem', fontWeight: 700, color: '#4f46e5' },
  backBtn: { padding: '0.4rem 1rem', background: '#f3f4f6', border: 'none', borderRadius: '6px', cursor: 'pointer' },
  container: { maxWidth: '700px', margin: '2rem auto', padding: '0 1rem' },
  headerCard: { background: 'white', borderRadius: '12px', padding: '1.5rem', marginBottom: '1.5rem', boxShadow: '0 2px 8px rgba(0,0,0,0.08)', display: 'flex', alignItems: 'center', gap: '1.5rem' },
  avatar: { width: '70px', height: '70px', borderRadius: '50%', background: '#4f46e5', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.5rem', fontWeight: 700, flexShrink: 0 },
  name: { fontSize: '1.3rem', fontWeight: 700, color: '#1a1a2e', marginBottom: '0.25rem' },
  email: { color: '#888', fontSize: '0.9rem', marginBottom: '0.5rem' },
  badge: { background: '#ede9fe', color: '#4f46e5', padding: '0.2rem 0.75rem', borderRadius: '999px', fontSize: '0.8rem', fontWeight: 600 },
  card: { background: 'white', borderRadius: '12px', padding: '2rem', boxShadow: '0 2px 8px rgba(0,0,0,0.08)' },
  sectionTitle: { fontSize: '1.1rem', fontWeight: 700, marginBottom: '1.5rem', color: '#1a1a2e' },
  success: { background: '#d1fae5', color: '#065f46', padding: '0.75rem', borderRadius: '8px', marginBottom: '1rem' },
  error: { background: '#fee2e2', color: '#dc2626', padding: '0.75rem', borderRadius: '8px', marginBottom: '1rem' },
  row: { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' },
  field: { marginBottom: '1.25rem' },
  label: { display: 'block', marginBottom: '0.5rem', fontWeight: 500, color: '#555', fontSize: '0.9rem' },
  input: { width: '100%', padding: '0.75rem', border: '1px solid #ddd', borderRadius: '8px', fontSize: '1rem', boxSizing: 'border-box' },
  textarea: { width: '100%', padding: '0.75rem', border: '1px solid #ddd', borderRadius: '8px', fontSize: '1rem', boxSizing: 'border-box', resize: 'vertical', fontFamily: 'inherit' },
  tags: { display: 'flex', flexWrap: 'wrap', gap: '0.5rem', marginTop: '0.5rem' },
  tag: { background: '#ede9fe', color: '#4f46e5', padding: '0.2rem 0.75rem', borderRadius: '999px', fontSize: '0.8rem', fontWeight: 500 },
  button: { width: '100%', padding: '0.75rem', background: '#4f46e5', color: 'white', border: 'none', borderRadius: '8px', fontSize: '1rem', cursor: 'pointer', fontWeight: 600 },
}