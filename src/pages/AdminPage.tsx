import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api/axios';

interface User {
  id: number;
  email: string;
  firstName: string;
  lastName: string;
  role: string;
}

interface Vacancy {
  id: number;
  title: string;
  company: string;
  location: string;
  employerEmail: string;
}

interface Stats {
  totalUsers: number;
  totalVacancies: number;
  jobSeekers: number;
  employers: number;
}

export default function AdminPage() {
  const navigate = useNavigate();
  const [tab, setTab] = useState<'stats' | 'users' | 'vacancies'>('stats');
  const [users, setUsers] = useState<User[]>([]);
  const [vacancies, setVacancies] = useState<Vacancy[]>([]);
  const [stats, setStats] = useState<Stats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadAll();
  }, []);

  const loadAll = async () => {
    setLoading(true);
    try {
      const [s, u, v] = await Promise.all([
        api.get('/api/admin/stats'),
        api.get('/api/admin/users'),
        api.get('/api/admin/vacancies')
      ]);
      setStats(s.data);
      setUsers(u.data);
      setVacancies(v.data);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const deleteUser = async (id: number) => {
    if (!window.confirm('Ви впевнені, що хочете видалити цього користувача?')) return;
    try {
      await api.delete(`/api/admin/users/${id}`);
      setUsers(prev => prev.filter(u => u.id !== id));
      if (stats) setStats({ ...stats, totalUsers: stats.totalUsers - 1 });
    } catch (e) {
      alert('Помилка видалення');
    }
  };

  const deleteVacancy = async (id: number) => {
    if (!window.confirm('Ви впевнені, що хочете видалити цю вакансію?')) return;
    try {
      await api.delete(`/api/admin/vacancies/${id}`);
      setVacancies(prev => prev.filter(v => v.id !== id));
      if (stats) setStats({ ...stats, totalVacancies: stats.totalVacancies - 1 });
    } catch (e) {
      alert('Помилка видалення');
    }
  };

  const getRoleBadge = (role: string) => {
    switch(role) {
      case 'ADMIN': return { label: '👑 Адміністратор', bg: '#f3e8ff', color: '#7e22ce' };
      case 'EMPLOYER': return { label: '🏢 Роботодавець', bg: '#dbeafe', color: '#1e40af' };
      default: return { label: '👤 Кандидат', bg: '#dcfce7', color: '#166534' };
    }
  };

  return (
    <div style={s.page}>
      <div style={s.container}>
        <div style={s.header}>
          <h1 style={s.title}>Панель адміністратора</h1>
          <p style={s.subtitle}>Керуйте користувачами, вакансіями та переглядайте статистику платформи.</p>
        </div>

        <div style={s.tabsWrap}>
          <div style={s.tabs}>
            <button style={{ ...s.tab, ...(tab === 'stats' ? s.tabActive : {}) }} onClick={() => setTab('stats')}>
              <span style={s.tabIcon}>📊</span> Огляд платформи
            </button>
            <button style={{ ...s.tab, ...(tab === 'users' ? s.tabActive : {}) }} onClick={() => setTab('users')}>
              <span style={s.tabIcon}>👥</span> Всі користувачі
              <span style={s.tabBadge}>{users.length}</span>
            </button>
            <button style={{ ...s.tab, ...(tab === 'vacancies' ? s.tabActive : {}) }} onClick={() => setTab('vacancies')}>
              <span style={s.tabIcon}>📋</span> Всі вакансії
              <span style={s.tabBadge}>{vacancies.length}</span>
            </button>
          </div>
        </div>

        {loading ? (
          <div style={s.center}>
            <div style={s.spinner} />
            <p style={{ color: '#6b7280', marginTop: '1rem' }}>Завантажуємо дані...</p>
          </div>
        ) : (
          <div style={s.contentArea}>
            {tab === 'stats' && stats && (
              <div style={s.statsGrid}>
                <div style={s.statCard}>
                  <div style={{ ...s.statIconWrap, background: '#eef2ff', color: '#4f46e5' }}>👥</div>
                  <div style={s.statInfo}>
                    <p style={s.statLabel}>Всього користувачів</p>
                    <p style={s.statNum}>{stats.totalUsers}</p>
                  </div>
                </div>
                <div style={s.statCard}>
                  <div style={{ ...s.statIconWrap, background: '#dcfce7', color: '#166534' }}>👤</div>
                  <div style={s.statInfo}>
                    <p style={s.statLabel}>Кандидати</p>
                    <p style={s.statNum}>{stats.jobSeekers}</p>
                  </div>
                </div>
                <div style={s.statCard}>
                  <div style={{ ...s.statIconWrap, background: '#dbeafe', color: '#1e40af' }}>🏢</div>
                  <div style={s.statInfo}>
                    <p style={s.statLabel}>Роботодавці</p>
                    <p style={s.statNum}>{stats.employers}</p>
                  </div>
                </div>
                <div style={s.statCard}>
                  <div style={{ ...s.statIconWrap, background: '#fef3c7', color: '#b45309' }}>📋</div>
                  <div style={s.statInfo}>
                    <p style={s.statLabel}>Активні вакансії</p>
                    <p style={s.statNum}>{stats.totalVacancies}</p>
                  </div>
                </div>
              </div>
            )}

            {tab === 'users' && (
              <div style={s.tableCard}>
                <div style={s.tableHeader}>
                  <h3 style={s.tableTitle}>Управління користувачами</h3>
                </div>
                <div style={s.tableResponsive}>
                  <table style={s.table}>
                    <thead>
                      <tr>
                        <th style={s.th}>Користувач</th>
                        <th style={s.th}>Email</th>
                        <th style={s.th}>Роль</th>
                        <th style={{...s.th, width: '100px', textAlign: 'right'}}>Дії</th>
                      </tr>
                    </thead>
                    <tbody>
                      {users.map(u => {
                        const rb = getRoleBadge(u.role);
                        return (
                          <tr key={u.id} style={s.tr}>
                            <td style={s.td}>
                              <div style={s.tdUserBox}>
                                <div style={s.tdAvatar}>{u.firstName?.[0] || 'U'}</div>
                                <div style={s.tdUserName}>{u.firstName} {u.lastName}</div>
                              </div>
                            </td>
                            <td style={s.td}>{u.email}</td>
                            <td style={s.td}>
                              <span style={{ ...s.roleBadge, background: rb.bg, color: rb.color }}>{rb.label}</span>
                            </td>
                            <td style={{...s.td, textAlign: 'right'}}>
                              {u.role !== 'ADMIN' && (
                                <button style={s.delBtn} onClick={() => deleteUser(u.id)}>🗑</button>
                              )}
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {tab === 'vacancies' && (
              <div style={s.tableCard}>
                <div style={s.tableHeader}>
                  <h3 style={s.tableTitle}>Управління вакансіями</h3>
                </div>
                <div style={s.tableResponsive}>
                  <table style={s.table}>
                    <thead>
                      <tr>
                        <th style={s.th}>Посада</th>
                        <th style={s.th}>Компанія</th>
                        <th style={s.th}>Місто</th>
                        <th style={s.th}>Автор (Email)</th>
                        <th style={{...s.th, width: '100px', textAlign: 'right'}}>Дії</th>
                      </tr>
                    </thead>
                    <tbody>
                      {vacancies.map(v => (
                        <tr key={v.id} style={s.tr}>
                          <td style={s.td}>
                            <div style={s.tdJobTitle}>{v.title}</div>
                          </td>
                          <td style={s.td}>{v.company}</td>
                          <td style={s.td}>{v.location}</td>
                          <td style={s.td}>{v.employerEmail}</td>
                          <td style={{...s.td, textAlign: 'right'}}>
                            <button style={s.delBtn} onClick={() => deleteVacancy(v.id)}>🗑</button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

const s: Record<string, React.CSSProperties> = {
  page: { minHeight: 'calc(100vh - 4rem)', background: '#f8fafc', padding: '3rem 1.5rem' },
  container: { maxWidth: '1200px', margin: '0 auto' },
  center: { textAlign: 'center', minHeight: '40vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' },
  spinner: { width: '40px', height: '40px', border: '3px solid #e5e7eb', borderTop: '3px solid #4f46e5', borderRadius: '50%', animation: 'spin 0.8s linear infinite' },

  header: { marginBottom: '2.5rem' },
  title: { fontSize: '2.25rem', fontWeight: 800, color: '#111827', margin: '0 0 0.5rem', letterSpacing: '-0.02em' },
  subtitle: { color: '#6b7280', fontSize: '1.05rem', margin: 0 },

  tabsWrap: { marginBottom: '2rem', borderBottom: '1px solid #e5e7eb' },
  tabs: { display: 'flex', gap: '2rem', overflowX: 'auto', paddingBottom: '1px' },
  tab: { 
    background: 'none', border: 'none', borderBottom: '2px solid transparent', 
    padding: '0.75rem 0', fontWeight: 600, fontSize: '1rem', color: '#6b7280', 
    cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.5rem', transition: 'all 0.2s', whiteSpace: 'nowrap'
  },
  tabActive: { color: '#4f46e5', borderBottomColor: '#4f46e5' },
  tabIcon: { fontSize: '1.2rem' },
  tabBadge: { background: '#f1f5f9', color: '#475569', fontSize: '0.75rem', padding: '0.15rem 0.6rem', borderRadius: '999px' },

  contentArea: {},

  // Stats
  statsGrid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '1.5rem' },
  statCard: { background: 'white', borderRadius: '16px', padding: '1.5rem', display: 'flex', alignItems: 'center', gap: '1.25rem', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.05)', border: '1px solid #e5e7eb' },
  statIconWrap: { width: '60px', height: '60px', borderRadius: '14px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.75rem' },
  statInfo: { display: 'flex', flexDirection: 'column' },
  statLabel: { margin: '0 0 0.25rem', color: '#6b7280', fontSize: '0.9rem', fontWeight: 500 },
  statNum: { margin: 0, fontSize: '1.75rem', fontWeight: 800, color: '#111827', lineHeight: 1 },

  // Tables
  tableCard: { background: 'white', borderRadius: '16px', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.05)', border: '1px solid #e5e7eb', overflow: 'hidden' },
  tableHeader: { padding: '1.5rem', borderBottom: '1px solid #e5e7eb', background: '#fafafa' },
  tableTitle: { margin: 0, fontSize: '1.15rem', fontWeight: 700, color: '#111827' },
  tableResponsive: { overflowX: 'auto' },
  table: { width: '100%', borderCollapse: 'collapse', textAlign: 'left' },
  th: { padding: '1rem 1.5rem', fontSize: '0.8rem', fontWeight: 700, color: '#6b7280', textTransform: 'uppercase', letterSpacing: '0.05em', borderBottom: '1px solid #e5e7eb' },
  tr: { borderBottom: '1px solid #f1f5f9', transition: 'background-color 0.15s' },
  td: { padding: '1rem 1.5rem', fontSize: '0.95rem', color: '#374151', verticalAlign: 'middle' },
  
  tdUserBox: { display: 'flex', alignItems: 'center', gap: '0.75rem' },
  tdAvatar: { width: '36px', height: '36px', borderRadius: '50%', background: '#e0e7ff', color: '#4f46e5', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, fontSize: '0.9rem' },
  tdUserName: { fontWeight: 600, color: '#111827' },
  
  roleBadge: { padding: '0.3rem 0.75rem', borderRadius: '999px', fontSize: '0.8rem', fontWeight: 700 },
  
  tdJobTitle: { fontWeight: 600, color: '#111827' },
  
  delBtn: { background: '#fef2f2', color: '#dc2626', border: '1px solid #fecaca', width: '36px', height: '36px', borderRadius: '8px', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', transition: 'all 0.2s', fontSize: '1.1rem' },
};