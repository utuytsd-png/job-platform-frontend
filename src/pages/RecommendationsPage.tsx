import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import api from '../api/axios'

interface RecommendedVacancy {
  id: number
  title: string
  company: string
  location: string
  salary: string
  employmentType: string
  description: string
  matchScore: number
  matchedSkills: string[]
}

export default function RecommendationsPage() {
  const navigate = useNavigate()
  const [vacancies, setVacancies] = useState<RecommendedVacancy[]>([])
  const [loading, setLoading] = useState(true)
  const [noSkills, setNoSkills] = useState(false)
  const user = JSON.parse(localStorage.getItem('user') || '{}')

  useEffect(() => {
    if (!localStorage.getItem('token')) { navigate('/login'); return }
    api.get('/api/recommendations')
      .then(res => {
        if (res.data.length === 0) setNoSkills(true)
        setVacancies(res.data)
      })
      .finally(() => setLoading(false))
  }, [])

  const getScoreColor = (score: number) => {
    if (score >= 75) return '#10b981'
    if (score >= 40) return '#f59e0b'
    return '#6b7280'
  }

  const getScoreLabel = (score: number) => {
    if (score >= 75) return '🔥 Відмінний збіг'
    if (score >= 40) return '👍 Хороший збіг'
    return '💡 Частковий збіг'
  }

  return (
    <div style={styles.page}>
      <nav style={styles.nav}>
        <span style={styles.logo}>💼 Job Platform</span>
        <div style={styles.navRight}>
          <button style={styles.navBtn} onClick={() => navigate('/vacancies')}>
            🌐 Всі вакансії
          </button>
          <button style={styles.navBtn} onClick={() => navigate('/profile')}>
            👤 Профіль
          </button>
          <button style={styles.logoutBtn} onClick={() => {
            localStorage.removeItem('token')
            localStorage.removeItem('user')
            navigate('/login')
          }}>Вийти</button>
        </div>
      </nav>

      <div style={styles.container}>
        <div style={styles.header}>
          <h1 style={styles.title}>⭐ Рекомендовані вакансії</h1>
          <p style={styles.subtitle}>
            На основі ваших навичок у профілі
          </p>
        </div>

        {loading ? (
          <p style={styles.center}>Аналізуємо ваш профіль...</p>
        ) : noSkills ? (
          <div style={styles.emptyBox}>
            <p style={styles.emptyTitle}>😕 У вас ще немає навичок у профілі</p>
            <p style={styles.emptyText}>
              Додайте навички у профілі — і ми підберемо найкращі вакансії для вас!
            </p>
            <button style={styles.profileBtn} onClick={() => navigate('/profile')}>
              ✏️ Заповнити профіль
            </button>
          </div>
        ) : (
          <>
            <p style={styles.found}>
              Знайдено <strong>{vacancies.length}</strong> вакансій що відповідають вашим навичкам
            </p>
            <div style={styles.grid}>
              {vacancies.map(v => (
                <div key={v.id} style={styles.card}>
                  {/* Шкала збігу */}
                  <div style={styles.scoreRow}>
                    <span style={{
                      ...styles.scoreBadge,
                      background: getScoreColor(v.matchScore) + '20',
                      color: getScoreColor(v.matchScore)
                    }}>
                      {getScoreLabel(v.matchScore)}
                    </span>
                    <span style={{
                      ...styles.scoreNum,
                      color: getScoreColor(v.matchScore)
                    }}>
                      {v.matchScore}%
                    </span>
                  </div>

                  {/* Прогрес бар */}
                  <div style={styles.progressBg}>
                    <div style={{
                      ...styles.progressFill,
                      width: `${v.matchScore}%`,
                      background: getScoreColor(v.matchScore)
                    }} />
                  </div>

                  <h3 style={styles.cardTitle}>{v.title}</h3>
                  <p style={styles.company}>🏢 {v.company}</p>
                  <p style={styles.location}>📍 {v.location}</p>
                  {v.salary && <p style={styles.salary}>💰 {v.salary}</p>}
                  {v.employmentType && <p style={styles.empType}>🕐 {v.employmentType}</p>}

                  {/* Навички що збіглися */}
                  <div style={styles.skillsRow}>
                    <span style={styles.skillsLabel}>Збіг за:</span>
                    {v.matchedSkills.map((skill, i) => (
                      <span key={i} style={styles.skillTag}>{skill}</span>
                    ))}
                  </div>

                  <p style={styles.description}>
                    {v.description.length > 120
                      ? v.description.slice(0, 120) + '...'
                      : v.description}
                  </p>

                  <button
                    style={styles.detailBtn}
                    onClick={() => navigate(`/vacancies/${v.id}`)}>
                    Детальніше →
                  </button>
                </div>
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  )
}

const styles: Record<string, React.CSSProperties> = {
  page: { minHeight: '100vh', background: '#f5f5f5' },
  nav: { background: 'white', padding: '1rem 2rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', boxShadow: '0 2px 8px rgba(0,0,0,0.08)' },
  logo: { fontSize: '1.25rem', fontWeight: 700, color: '#4f46e5' },
  navRight: { display: 'flex', alignItems: 'center', gap: '1rem' },
  navBtn: { padding: '0.4rem 1rem', background: '#ede9fe', color: '#4f46e5', border: 'none', borderRadius: '6px', cursor: 'pointer' },
  logoutBtn: { padding: '0.4rem 1rem', background: '#fee2e2', color: '#dc2626', border: 'none', borderRadius: '6px', cursor: 'pointer' },
  container: { maxWidth: '1100px', margin: '0 auto', padding: '2rem 1rem' },
  header: { textAlign: 'center', marginBottom: '2rem' },
  title: { fontSize: '2rem', fontWeight: 800, color: '#1a1a2e', marginBottom: '0.5rem' },
  subtitle: { color: '#888', fontSize: '1rem' },
  center: { textAlign: 'center', color: '#888', marginTop: '3rem' },
  found: { color: '#555', marginBottom: '1.5rem', fontSize: '0.95rem' },
  emptyBox: { background: 'white', borderRadius: '16px', padding: '3rem', textAlign: 'center', boxShadow: '0 2px 8px rgba(0,0,0,0.08)', maxWidth: '500px', margin: '0 auto' },
  emptyTitle: { fontSize: '1.2rem', fontWeight: 700, marginBottom: '0.75rem', color: '#1a1a2e' },
  emptyText: { color: '#888', marginBottom: '1.5rem', lineHeight: 1.6 },
  profileBtn: { padding: '0.75rem 2rem', background: '#4f46e5', color: 'white', border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: 600, fontSize: '1rem' },
  grid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(340px, 1fr))', gap: '1.5rem' },
  card: { background: 'white', borderRadius: '12px', padding: '1.5rem', boxShadow: '0 2px 8px rgba(0,0,0,0.08)' },
  scoreRow: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' },
  scoreBadge: { padding: '0.2rem 0.75rem', borderRadius: '999px', fontSize: '0.8rem', fontWeight: 600 },
  scoreNum: { fontSize: '1.1rem', fontWeight: 800 },
  progressBg: { height: '6px', background: '#f3f4f6', borderRadius: '999px', marginBottom: '1rem', overflow: 'hidden' },
  progressFill: { height: '100%', borderRadius: '999px', transition: 'width 0.5s ease' },
  cardTitle: { fontSize: '1.1rem', fontWeight: 700, marginBottom: '0.4rem', color: '#1a1a2e' },
  company: { color: '#555', marginBottom: '0.2rem', fontSize: '0.9rem' },
  location: { color: '#555', marginBottom: '0.2rem', fontSize: '0.9rem' },
  salary: { color: '#10b981', fontWeight: 600, marginBottom: '0.2rem', fontSize: '0.9rem' },
  empType: { color: '#6366f1', fontSize: '0.85rem', marginBottom: '0.5rem' },
  skillsRow: { display: 'flex', flexWrap: 'wrap', gap: '0.4rem', marginBottom: '0.75rem', alignItems: 'center' },
  skillsLabel: { fontSize: '0.8rem', color: '#888', marginRight: '0.25rem' },
  skillTag: { background: '#ede9fe', color: '#4f46e5', padding: '0.15rem 0.6rem', borderRadius: '999px', fontSize: '0.75rem', fontWeight: 600 },
  description: { color: '#666', fontSize: '0.9rem', marginBottom: '1rem', lineHeight: 1.5 },
  detailBtn: { width: '100%', padding: '0.6rem', background: '#4f46e5', color: 'white', border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: 600 },
}