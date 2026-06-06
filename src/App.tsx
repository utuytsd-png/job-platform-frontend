import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import LoginPage from './pages/LoginPage'
import RegisterPage from './pages/RegisterPage'
import VacanciesPage from './pages/VacanciesPage'
import VacancyDetailPage from './pages/VacancyDetailPage'
import CreateVacancyPage from './pages/CreateVacancyPage'
import MyApplicationsPage from './pages/MyApplicationsPage'
import VacancyApplicationsPage from './pages/VacancyApplicationsPage'

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Navigate to="/login" />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />
        <Route path="/vacancies" element={<VacanciesPage />} />
        <Route path="/vacancies/create" element={<CreateVacancyPage />} />
        <Route path="/vacancies/:id" element={<VacancyDetailPage />} />
        <Route path="/my-applications" element={<MyApplicationsPage />} />
        <Route path="/vacancies/:id/applications" element={<VacancyApplicationsPage />} />
      </Routes>
    </BrowserRouter>
  )
}

export default App