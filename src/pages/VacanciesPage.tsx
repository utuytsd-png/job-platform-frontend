import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
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

export default function VacanciesPage() {
  const navigate = useNavigate()
  const [vacancies, setVacancies] = useState<Vacancy[]>([])
  const [search, setSearch] = useState('')
  const [loading, setLoading] = useState(true)
  const user = JSON.parse(localStorage.getItem('user') || '{}')

  useEffect(() => {
    if (!localStorage.getItem('token')) {
      navigate('/login')
      return
    }
    fetchVacancies()
  }, [])

  const fetchVacancies = async () => {
    try {
      const res = await api.get('/api/vacancies')
      setVacancies(res.data)
    } finally {
      setLoading(false)
    }
  }

  const handleSearch = async () => {
    if (!search.trim()) { fetchVacancies(); return }
    const res = await api.get(`/api/vacancies/search?query=${search}`)
    setVacancies(res.data)
  }

  const handleLogout = () => {
    localStorage.removeItem('token')
    localStorage.removeItem('user')
    navigate('/login')
  }

  return (
    <div style={styles.page}>
      {/* Navbar */}
      <nav style={styles.nav}>
        <span style={styles.logo}>💼 Job Platform</span>
        <div style={styles.navRight}>
  <span style={styles.userName}>
    {user.firstName} {user.lastName} ({user.role === 'EMPLOYER' ? 'Роботодавець' : 'Шукач роботи'})
  </span>
  {user.role === 'JOB_SEEKER' && (
    <button style={styles.navBtn} onClick={() => navigate('/my-applications')}>
      Мої відгуки
    </button>
  )}
  <button style={styles.logoutBtn} onClick={handleLogout}>Вийти</button>
</div>
      </nav>

      <div style={styles.container}>
        {/* Search */}
        <div style={styles.searchRow}>
          <input
            style={styles.searchInput}
            placeholder="Пошук вакансій..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && handleSearch()}
          />
          <button style={styles.searchBtn} onClick={handleSearch}>Знайти</button>
          {user.role === 'EMPLOYER' && (
            <button style={styles.createBtn} onClick={() => navigate('/vacancies/create')}>
              + Додати вакансію
            </button>
          )}
        </div>

        {/* List */}
        {loading ? (
          <p style={{ textAlign: 'center' }}>Завантаження...</p>
        ) : vacancies.length === 0 ? (
          <p style={{ textAlign: 'center', color: '#888' }}>Вакансій поки немає</p>
        ) : (
          <div style={styles.grid}>
            {vacancies.map(v => (
              <div key={v.id} style={styles.card}>
                <h3 style={styles.cardTitle}>{v.title}</h3>
                <p style={styles.company}>🏢 {v.company}</p>
                <p style={styles.location}>📍 {v.location}</p>
                {v.salary && <p style={styles.salary}>💰 {v.salary}</p>}
                <p style={styles.description}>
                  {v.description.length > 150 ? v.description.slice(0, 150) + '...' : v.description}
                </p>
                <div style={styles.cardFooter}>
                  <span style={styles.author}>
                    {v.employerFirstName} {v.employerLastName}
                  </span>
                  <button style={styles.detailBtn} onClick={() => navigate(`/vacancies/${v.id}`)}>
                    Детальніше →
                  </button>
                </div>
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
  navRight: { display: 'flex', alignItems: 'center', gap: '1rem' },
  navBtn: { padding: '0.4rem 1rem', background: '#ede9fe', color: '#4f46e5', border: 'none', borderRadius: '6px', cursor: 'pointer' },
  userName: { color: '#555', fontSize: '0.9rem' },
  logoutBtn: { padding: '0.4rem 1rem', background: '#fee2e2', color: '#dc2626', border: 'none', borderRadius: '6px', cursor: 'pointer' },
  container: { maxWidth: '1100px', margin: '0 auto', padding: '2rem 1rem' },
  searchRow: { display: 'flex', gap: '0.75rem', marginBottom: '2rem', flexWrap: 'wrap' },
  searchInput: { flex: 1, minWidth: '200px', padding: '0.75rem', border: '1px solid #ddd', borderRadius: '8px', fontSize: '1rem' },
  searchBtn: { padding: '0.75rem 1.5rem', background: '#4f46e5', color: 'white', border: 'none', borderRadius: '8px', cursor: 'pointer' },
  createBtn: { padding: '0.75rem 1.5rem', background: '#10b981', color: 'white', border: 'none', borderRadius: '8px', cursor: 'pointer' },
  grid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '1.5rem' },
  card: { background: 'white', borderRadius: '12px', padding: '1.5rem', boxShadow: '0 2px 8px rgba(0,0,0,0.08)' },
  cardTitle: { fontSize: '1.1rem', fontWeight: 700, marginBottom: '0.5rem', color: '#1a1a2e' },
  company: { color: '#555', marginBottom: '0.25rem' },
  location: { color: '#555', marginBottom: '0.25rem' },
  salary: { color: '#10b981', fontWeight: 600, marginBottom: '0.5rem' },
  description: { color: '#666', fontSize: '0.9rem', marginBottom: '1rem', lineHeight: 1.5 },
  cardFooter: { display: 'flex', justifyContent: 'space-between', alignItems: 'center' },
  author: { fontSize: '0.8rem', color: '#999' },
  detailBtn: { padding: '0.4rem 1rem', background: '#ede9fe', color: '#4f46e5', border: 'none', borderRadius: '6px', cursor: 'pointer', fontWeight: 600 },
}