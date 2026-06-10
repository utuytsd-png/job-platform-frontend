import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import api from '../api/axios'

interface User {
  id: number
  email: string
  firstName: string
  lastName: string
  role: string
}

interface Vacancy {
  id: number
  title: string
  company: string
  location: string
  employerEmail: string
  createdAt: string
}

interface Stats {
  totalUsers: number
  totalVacancies: number
  jobSeekers: number
  employers: number
}

export default function AdminPage() {
  const navigate = useNavigate()
  const [tab, setTab] = useState<'stats' | 'users' | 'vacancies'>('stats')
  const [users, setUsers] = useState<User[]>([])
  const [vacancies, setVacancies] = useState<Vacancy[]>([])
  const [stats, setStats] = useState<Stats | null>(null)
  const [loading, setLoading] = useState(true)
  const user = JSON.parse(localStorage.getItem('user') || '{}')

  useEffect(() => {
    if (!localStorage.getItem('token')) { navigate('/login'); return }
    if (user.role !== 'ADMIN') { navigate('/vacancies'); return }
    loadAll()
  }, [])

  const loadAll = async () => {
    setLoading(true)
    try {
      const [s, u, v] = await Promise.all([
        api.get('/api/admin/stats'),
        api.get('/api/admin/users'),
        api.get('/api/admin/vacancies')
      ])
      setStats(s.data)
      setUsers(u.data)
      setVacancies(v.data)
    } finally {
      setLoading(false)
    }
  }

  const deleteUser = async (id: number) => {
    if (!confirm('Видалити користувача?')) return
    await api.delete(`/api/admin/users/${id}`)
    setUsers(prev => prev.filter(u => u.id !== id))
    setStats(prev => prev ? { ...prev, totalUsers: prev.totalUsers - 1 } : prev)
  }

  const deleteVacancy = async (id: number) => {
    if (!confirm('Видалити вакансію?')) return
    await api.delete(`/api/admin/vacancies/${id}`)
    setVacancies(prev => prev.filter(v => v.id !== id))
    setStats(prev => prev ? { ...prev, totalVacancies: prev.totalVacancies - 1 } : prev)
  }

  const roleColor = (role: string) =>
    role === 'ADMIN' ? '#7c3aed' : role === 'EMPLOYER' ? '#0369a1' : '#065f46'

  const roleBg = (role: string) =>
    role === 'ADMIN' ? '#ede9fe' : role === 'EMPLOYER' ? '#e0f2fe' : '#d1fae5'

  const roleLabel = (role: string) =>
    role === 'ADMIN' ? '👑 Адмін' : role === 'EMPLOYER' ? '🏢 Роботодавець' : '👤 Кандидат'

  return (
    <div style={styles.page}>
      {/* Navbar */}
      <nav style={styles.nav}>
        <span style={styles.logo}>💼 Job Platform</span>
        <div style={styles.navRight}>
          <span style={styles.adminBadge}>👑 Адмін панель</span>
          <button style={styles.logoutBtn} onClick={() => {
            localStorage.clear(); navigate('/login')
          }}>Вийти</button>
        </div>
      </nav>

      <div style={styles.container}>
        <h1 style={styles.title}>Адміністративна панель</h1>

        {/* Вкладки */}
        <div style={styles.tabs}>
          {(['stats', 'users', 'vacancies'] as const).map(t => (
            <button key={t} style={tab === t ? styles.tabActive : styles.tab}
              onClick={() => setTab(t)}>
              {t === 'stats' ? '📊 Статистика'
             : t === 'users' ? `👥 Користувачі (${users.length})`
             : `📋 Вакансії (${vacancies.length})`}
            </button>
          ))}
        </div>

        {loading ? (
          <p style={styles.center}>Завантаження...</p>
        ) : (
          <>
            {/* СТАТИСТИКА */}
            {tab === 'stats' && stats && (
              <div style={styles.statsGrid}>
                <div style={styles.statCard}>
                  <p style={styles.statNum}>{stats.totalUsers}</p>
                  <p style={styles.statLabel}>👥 Всього користувачів</p>
                </div>
                <div style={styles.statCard}>
                  <p style={styles.statNum}>{stats.jobSeekers}</p>
                  <p style={styles.statLabel}>👤 Кандидатів</p>
                </div>
                <div style={styles.statCard}>
                  <p style={styles.statNum}>{stats.employers}</p>
                  <p style={styles.statLabel}>🏢 Роботодавців</p>
                </div>
                <div style={styles.statCard}>
                  <p style={styles.statNum}>{stats.totalVacancies}</p>
                  <p style={styles.statLabel}>📋 Вакансій</p>
                </div>
              </div>
            )}

            {/* КОРИСТУВАЧІ */}
            {tab === 'users' && (
              <div style={styles.tableWrap}>
                <table style={styles.table}>
                  <thead>
                    <tr style={styles.thead}>
                      <th style={styles.th}>ID</th>
                      <th style={styles.th}>Ім'я</th>
                      <th style={styles.th}>Email</th>
                      <th style={styles.th}>Роль</th>
                      <th style={styles.th}>Дії</th>
                    </tr>
                  </thead>
                  <tbody>
                    {users.map(u => (
                      <tr key={u.id} style={styles.tr}>
                        <td style={styles.td}>#{u.id}</td>
                        <td style={styles.td}>{u.firstName} {u.lastName}</td>
                        <td style={styles.td}>{u.email}</td>
                        <td style={styles.td}>
                          <span style={{
                            padding: '0.2rem 0.6rem',
                            borderRadius: '999px',
                            fontSize: '0.75rem',
                            fontWeight: 600,
                            background: roleBg(u.role),
                            color: roleColor(u.role)
                          }}>
                            {roleLabel(u.role)}
                          </span>
                        </td>
                        <td style={styles.td}>
                          {u.role !== 'ADMIN' && (
                            <button style={styles.delBtn}
                              onClick={() => deleteUser(u.id)}>
                              🗑 Видалити
                            </button>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}

            {/* ВАКАНСІЇ */}
            {tab === 'vacancies' && (
              <div style={styles.tableWrap}>
                <table style={styles.table}>
                  <thead>
                    <tr style={styles.thead}>
                      <th style={styles.th}>ID</th>
                      <th style={styles.th}>Назва</th>
                      <th style={styles.th}>Компанія</th>
                      <th style={styles.th}>Місто</th>
                      <th style={styles.th}>Роботодавець</th>
                      <th style={styles.th}>Дії</th>
                    </tr>
                  </thead>
                  <tbody>
                    {vacancies.map(v => (
                      <tr key={v.id} style={styles.tr}>
                        <td style={styles.td}>#{v.id}</td>
                        <td style={styles.td}>{v.title}</td>
                        <td style={styles.td}>{v.company}</td>
                        <td style={styles.td}>{v.location}</td>
                        <td style={styles.td}>{v.employerEmail}</td>
                        <td style={styles.td}>
                          <button style={styles.delBtn}
                            onClick={() => deleteVacancy(v.id)}>
                            🗑 Видалити
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
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
  adminBadge: { background: '#ede9fe', color: '#7c3aed', padding: '0.3rem 0.8rem', borderRadius: '999px', fontSize: '0.85rem', fontWeight: 600 },
  logoutBtn: { padding: '0.4rem 1rem', background: '#fee2e2', color: '#dc2626', border: 'none', borderRadius: '6px', cursor: 'pointer' },
  container: { maxWidth: '1100px', margin: '2rem auto', padding: '0 1rem' },
  title: { fontSize: '1.75rem', fontWeight: 800, color: '#1a1a2e', marginBottom: '1.5rem' },
  tabs: { display: 'flex', gap: 0, marginBottom: '1.5rem', borderBottom: '2px solid #e5e7eb' },
  tab: { padding: '0.6rem 1.5rem', background: 'none', border: 'none', borderBottom: '3px solid transparent', marginBottom: '-2px', cursor: 'pointer', fontWeight: 500, color: '#6b7280', fontSize: '0.95rem' },
  tabActive: { padding: '0.6rem 1.5rem', background: 'none', border: 'none', borderBottom: '3px solid #4f46e5', marginBottom: '-2px', cursor: 'pointer', fontWeight: 700, color: '#4f46e5', fontSize: '0.95rem' },
  center: { textAlign: 'center', color: '#888', marginTop: '3rem' },
  statsGrid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: '1.5rem' },
  statCard: { background: 'white', borderRadius: '12px', padding: '2rem', textAlign: 'center', boxShadow: '0 2px 8px rgba(0,0,0,0.08)' },
  statNum: { fontSize: '3rem', fontWeight: 800, color: '#4f46e5', marginBottom: '0.5rem' },
  statLabel: { color: '#888', fontSize: '0.9rem' },
  tableWrap: { background: 'white', borderRadius: '12px', overflow: 'hidden', boxShadow: '0 2px 8px rgba(0,0,0,0.08)', overflowX: 'auto' },
  table: { width: '100%', borderCollapse: 'collapse' },
  thead: { background: '#f9fafb' },
  th: { padding: '0.75rem 1rem', textAlign: 'left', fontSize: '0.85rem', fontWeight: 600, color: '#555', borderBottom: '1px solid #e5e7eb' },
  tr: { borderBottom: '1px solid #f3f4f6' },
  td: { padding: '0.75rem 1rem', fontSize: '0.9rem', color: '#333' },
  delBtn: { padding: '0.3rem 0.75rem', background: '#fee2e2', color: '#dc2626', border: 'none', borderRadius: '6px', cursor: 'pointer', fontSize: '0.8rem', fontWeight: 600 },
}