import { useEffect, useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import api from '../api/axios';

interface RecommendedVacancy {
  id: number;
  title: string;
  company: string;
  location: string;
  salary: string;
  employmentType: string;
  description: string;
  matchScore: number;
  matchedSkills: string[];
}

function getCompanyColor(name: string) {
  const colors = ['#6366f1','#8b5cf6','#ec4899','#f59e0b','#10b981','#3b82f6','#ef4444','#14b8a6'];
  let hash = 0;
  for (const ch of name) hash = ch.charCodeAt(0) + ((hash << 5) - hash);
  return colors[Math.abs(hash) % colors.length];
}

function getCompanyInitials(name: string) {
  return name.split(' ').map(w => w[0]).join('').toUpperCase().slice(0, 2);
}

export default function RecommendationsPage() {
  const navigate = useNavigate();
  const [vacancies, setVacancies] = useState<RecommendedVacancy[]>([]);
  const [loading, setLoading] = useState(true);
  const [noSkills, setNoSkills] = useState(false);

  useEffect(() => {
    api.get('/api/recommendations')
      .then(res => {
        if (res.data.length === 0) setNoSkills(true);
        setVacancies(res.data);
      })
      .catch(err => {
        console.error(err);
      })
      .finally(() => setLoading(false));
  }, []);

  const getScoreColor = (score: number) => {
    if (score >= 75) return '#10b981';
    if (score >= 40) return '#f59e0b';
    return '#6b7280';
  };

  const getScoreLabel = (score: number) => {
    if (score >= 75) return 'Відмінний збіг';
    if (score >= 40) return 'Хороший збіг';
    return 'Частковий збіг';
  };

  if (loading) return (
    <div style={s.center}>
      <div style={s.spinner} />
      <p style={{ color: '#6b7280', marginTop: '1rem' }}>Аналізуємо ваш профіль...</p>
    </div>
  );

  return (
    <div style={s.container}>
      <div style={s.header}>
        <div style={s.headerIcon}>✨</div>
        <h1 style={s.title}>Рекомендовані вакансії</h1>
        <p style={s.subtitle}>Підібрані персонально для вас на основі ваших навичок та досвіду</p>
      </div>

      {noSkills ? (
        <div style={s.emptyBox}>
          <div style={s.emptyIcon}>🎯</div>
          <h2 style={s.emptyTitle}>У вас ще немає навичок у профілі</h2>
          <p style={s.emptyText}>Додайте навички у вашому профілі, і ми автоматично підберемо найкращі пропозиції.</p>
          <button style={s.profileBtn} onClick={() => navigate('/profile')}>
            Заповнити профіль
          </button>
        </div>
      ) : vacancies.length === 0 ? (
        <div style={s.emptyBox}>
          <div style={s.emptyIcon}>🔍</div>
          <h2 style={s.emptyTitle}>Поки нічого не знайдено</h2>
          <p style={s.emptyText}>Ми постійно шукаємо нові вакансії. Зайдіть трохи пізніше або оновіть свій профіль.</p>
          <button style={s.profileBtn} onClick={() => navigate('/profile')}>
            Оновити профіль
          </button>
        </div>
      ) : (
        <>
          <p style={s.foundText}>
            Знайдено <strong style={{ color: '#111827' }}>{vacancies.length}</strong> вакансій, що підходять вам.
          </p>
          <div style={s.grid}>
            {vacancies.map(v => {
              const color = getCompanyColor(v.company);
              const scoreColor = getScoreColor(v.matchScore);
              
              return (
                <div key={v.id} style={s.card}>
                  <div style={s.scoreContainer}>
                    <div style={s.scoreHeader}>
                      <span style={{ ...s.scoreBadge, background: `${scoreColor}15`, color: scoreColor, border: `1px solid ${scoreColor}40` }}>
                        {getScoreScoreIcon(v.matchScore)} {getScoreLabel(v.matchScore)}
                      </span>
                      <span style={{ ...s.scoreNum, color: scoreColor }}>{v.matchScore}%</span>
                    </div>
                    <div style={s.progressBg}>
                      <div style={{ ...s.progressFill, width: `${v.matchScore}%`, background: scoreColor }} />
                    </div>
                  </div>

                  <div style={s.cardTop}>
                    <div style={{ ...s.companyLogo, background: color }}>
                      {getCompanyInitials(v.company)}
                    </div>
                    <div style={s.cardTopInfo}>
                      <h3 style={s.cardTitle}>{v.title}</h3>
                      <p style={s.companyName}>{v.company}</p>
                    </div>
                  </div>

                  <div style={s.metaRow}>
                    {v.location && <span style={s.metaChip}>📍 {v.location}</span>}
                    {v.employmentType && <span style={s.metaChip}>🕒 {v.employmentType}</span>}
                    {v.salary && <span style={{ ...s.metaChip, ...s.salaryChip }}>💰 {v.salary}</span>}
                  </div>

                  {v.matchedSkills.length > 0 && (
                    <div style={s.skillsSection}>
                      <span style={s.skillsLabel}>Збіг за:</span>
                      <div style={s.skillsRow}>
                        {v.matchedSkills.map((skill, i) => (
                          <span key={i} style={{ ...s.skillTag, borderColor: `${scoreColor}40`, color: scoreColor }}>
                            {skill}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}

                  <p style={s.description}>
                    {v.description.length > 110 ? v.description.slice(0, 110) + '…' : v.description}
                  </p>

                  <div style={s.cardFooter}>
                    <Link to={`/vacancies/${v.id}`} style={{ ...s.detailBtn, background: color }}>
                      Переглянути вакансію
                    </Link>
                  </div>
                </div>
              );
            })}
          </div>
        </>
      )}
    </div>
  );
}

function getScoreScoreIcon(score: number) {
  if (score >= 75) return '🔥';
  if (score >= 40) return '👍';
  return '💡';
}

const s: Record<string, React.CSSProperties> = {
  container: { padding: '3rem 1.5rem', maxWidth: '1200px', margin: '0 auto' },
  center: { textAlign: 'center', minHeight: '60vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' },
  spinner: { width: '40px', height: '40px', border: '3px solid #e5e7eb', borderTop: '3px solid #4f46e5', borderRadius: '50%', animation: 'spin 0.8s linear infinite' },
  
  header: { textAlign: 'center', marginBottom: '3rem' },
  headerIcon: { fontSize: '3rem', marginBottom: '1rem', display: 'inline-block', background: '#eef2ff', padding: '1rem', borderRadius: '24px', boxShadow: '0 8px 16px rgba(79,70,229,0.1)' },
  title: { fontSize: '2.5rem', fontWeight: 800, color: '#111827', margin: '0 0 0.5rem', letterSpacing: '-0.02em' },
  subtitle: { color: '#6b7280', fontSize: '1.1rem', maxWidth: '600px', margin: '0 auto' },
  
  foundText: { color: '#6b7280', marginBottom: '1.5rem', fontSize: '1.05rem', textAlign: 'center' },
  
  emptyBox: { background: 'white', borderRadius: '24px', padding: '4rem 2rem', textAlign: 'center', boxShadow: '0 10px 40px -10px rgba(0,0,0,0.08)', border: '1px solid #e5e7eb', maxWidth: '600px', margin: '0 auto' },
  emptyIcon: { fontSize: '4rem', marginBottom: '1.5rem' },
  emptyTitle: { fontSize: '1.5rem', fontWeight: 800, margin: '0 0 0.75rem', color: '#111827' },
  emptyText: { color: '#6b7280', margin: '0 auto 2rem', lineHeight: 1.6, maxWidth: '400px' },
  profileBtn: { display: 'inline-block', padding: '0.875rem 2rem', background: '#4f46e5', color: 'white', border: 'none', borderRadius: '12px', cursor: 'pointer', fontWeight: 700, fontSize: '1rem', transition: 'background-color 0.2s', boxShadow: '0 4px 12px rgba(79,70,229,0.3)' },
  
  grid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(360px, 1fr))', gap: '1.5rem' },
  card: { background: 'white', borderRadius: '20px', padding: '1.5rem', boxShadow: '0 4px 12px -2px rgba(0,0,0,0.05)', border: '1px solid #e5e7eb', display: 'flex', flexDirection: 'column', transition: 'transform 0.2s, box-shadow 0.2s' },
  
  scoreContainer: { background: '#f9fafb', padding: '1rem', borderRadius: '12px', marginBottom: '1.25rem', border: '1px dashed #e5e7eb' },
  scoreHeader: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.75rem' },
  scoreBadge: { padding: '0.3rem 0.75rem', borderRadius: '999px', fontSize: '0.8rem', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '0.25rem' },
  scoreNum: { fontSize: '1.25rem', fontWeight: 800 },
  progressBg: { height: '8px', background: '#e5e7eb', borderRadius: '999px', overflow: 'hidden' },
  progressFill: { height: '100%', borderRadius: '999px', transition: 'width 1s cubic-bezier(0.4, 0, 0.2, 1)' },
  
  cardTop: { display: 'flex', gap: '1rem', alignItems: 'center', marginBottom: '1rem' },
  companyLogo: { width: '48px', height: '48px', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontWeight: 700, fontSize: '1.1rem', flexShrink: 0 },
  cardTopInfo: { display: 'flex', flexDirection: 'column', gap: '0.2rem' },
  cardTitle: { fontSize: '1.15rem', fontWeight: 700, margin: 0, color: '#111827', lineHeight: 1.3 },
  companyName: { color: '#6b7280', fontSize: '0.9rem', margin: 0 },
  
  metaRow: { display: 'flex', gap: '0.5rem', flexWrap: 'wrap', marginBottom: '1rem' },
  metaChip: { background: '#f3f4f6', color: '#4b5563', borderRadius: '6px', padding: '0.25rem 0.6rem', fontSize: '0.8rem', fontWeight: 500 },
  salaryChip: { background: '#f0fdf4', color: '#15803d', fontWeight: 600 },
  
  skillsSection: { marginBottom: '1rem', padding: '0.75rem', background: '#fafaf9', borderRadius: '10px' },
  skillsLabel: { display: 'block', fontSize: '0.75rem', color: '#9ca3af', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '0.5rem', fontWeight: 600 },
  skillsRow: { display: 'flex', flexWrap: 'wrap', gap: '0.4rem' },
  skillTag: { background: 'white', border: '1px solid', borderRadius: '6px', padding: '0.2rem 0.5rem', fontSize: '0.75rem', fontWeight: 600 },
  
  description: { color: '#6b7280', fontSize: '0.9rem', lineHeight: 1.6, margin: '0 0 1.5rem', flex: 1 },
  
  cardFooter: { marginTop: 'auto' },
  detailBtn: { display: 'block', textAlign: 'center', padding: '0.8rem', color: 'white', textDecoration: 'none', border: 'none', borderRadius: '10px', fontWeight: 700, fontSize: '0.95rem', transition: 'opacity 0.2s', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.1)' },
};