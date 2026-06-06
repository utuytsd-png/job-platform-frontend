import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import api from '../api/axios'

interface Application {
  id: number
  vacancyTitle: string
  vacancyCompany: string
  coverLetter: string
  status: string
  appliedAt: string
}

export default function MyApplicationsPage() {
  const navigate = useNavigate()
  const [applications, setApplications] = useState<Application[]>([])
  const [loading, setLoading] = useState(true)
  const user = JSON.parse(localStorage.getItem('user') || '{}')

  useEffect(() => {
    if (!localStorage.getItem('token')) { navigate('/login'); return }
    api.get('/api/applications/my')
      .then(res => setApplications(res.data))
      .finally(() => setLoading(false))
  }, [])

  const statusLabel: Record<string, { label: string; color: string }> = {
    PENDING:  { label: '⏳ На розгляді', color: '#f59e0b' },
    ACCEPTED: { label: '✅ Прийнято',    color: '#10b981' },
    REJECTED: { label: '❌ Відхилено',   color: '#ef4444' },
  }

  return (
    <div style={styles.page}>
      <nav style={styles.nav}>
        <span style={styles.logo}>💼 Job Platform</span>
        <div style={styles.navRight}>
          <span style={styles.userName}>{user.firstName} {user.lastName}</span>
          <button style={styles.navBtn} onClick={() => navigate('/vacancies')}>Вакансії</button>
          <button style={styles.logoutBtn} onClick={() => {
            localStorage.clear(); navigate('/login')
          }}>Вийти</button>
        </div>
      </nav>

      <div style={styles.container}>
        <h2 style={styles.title}>Мої відгуки</h2>

        {loading ? (
          <p style={{ textAlign: 'center' }}>Завантаження...</p>
        ) : applications.length === 0 ? (
          <div style={styles.empty}>
            <p style={{ fontSize: '3rem' }}>📭</p>
            <p>Ви ще не відгукнулись на жодну вакансію</p>
            <button style={styles.button} onClick={() => navigate('/vacancies')}>
              Переглянути вакансії
            </button>
          </div>
        ) : (
          <div style={styles.list}>
            {applications.map(app => (
              <div key={app.id} style={styles.card}>
                <div style={styles.cardHeader}>
                  <div>
                    <h3 style={styles.cardTitle}>{app.vacancyTitle}</h3>
                    <p style={styles.company}>🏢 {app.vacancyCompany}</p>
                  </div>
                  <span style={{
                    ...styles.status,
                    color: statusLabel[app.status]?.color || '#666'
                  }}>
                    {statusLabel[app.status]?.label || app.status}
                  </span>
                </div>
                <div style={styles.divider} />
                <p style={styles.letter}>{app.coverLetter}</p>
                <p style={styles.date}>
                  Подано: {new Date(app.appliedAt).toLocaleDateString('uk-UA')}
                </p>
              </div>
            ))}
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
  navRight: { display: 'flex', alignItems: 'center', gap: '0.75rem' },
  userName: { color: '#555', fontSize: '0.9rem' },
  navBtn: { padding: '0.4rem 1rem', background: '#ede9fe', color: '#4f46e5', border: 'none', borderRadius: '6px', cursor: 'pointer' },
  logoutBtn: { padding: '0.4rem 1rem', background: '#fee2e2', color: '#dc2626', border: 'none', borderRadius: '6px', cursor: 'pointer' },
  container: { maxWidth: '800px', margin: '2rem auto', padding: '0 1rem' },
  title: { marginBottom: '1.5rem', color: '#333' },
  list: { display: 'flex', flexDirection: 'column', gap: '1rem' },
  card: { background: 'white', borderRadius: '12px', padding: '1.5rem', boxShadow: '0 2px 8px rgba(0,0,0,0.08)' },
  cardHeader: { display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' },
  cardTitle: { fontSize: '1.1rem', fontWeight: 700, color: '#1a1a2e', marginBottom: '0.25rem' },
  company: { color: '#666', fontSize: '0.9rem' },
  status: { fontWeight: 600, fontSize: '0.9rem', whiteSpace: 'nowrap' },
  divider: { height: '1px', background: '#f0f0f0', margin: '1rem 0' },
  letter: { color: '#444', lineHeight: 1.6, fontSize: '0.95rem' },
  date: { color: '#999', fontSize: '0.8rem', marginTop: '0.75rem' },
  empty: { textAlign: 'center', padding: '4rem 2rem', color: '#888', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '1rem' },
  button: { padding: '0.75rem 2rem', background: '#4f46e5', color: 'white', border: 'none', borderRadius: '8px', cursor: 'pointer', fontSize: '1rem' },
}