import { NavLink, Navigate, Route, Routes } from 'react-router-dom';
import ErrorBoundary from './components/ErrorBoundary';
import DashboardPage from './pages/DashboardPage';
import ResumeDetailPage from './pages/ResumeDetailPage';
import ResumeListPage from './pages/ResumeListPage';
import UploadPage from './pages/UploadPage';

const TABS = [
  { to: '/upload', label: 'Upload' },
  { to: '/resumes', label: 'Resumes' },
  { to: '/dashboard', label: 'Dashboard' },
];

export default function App() {
  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white border-b sticky top-0 z-30 shadow-sm">
        <div className="max-w-6xl mx-auto px-6">
          <div className="flex items-center h-14">
            <h1 className="font-semibold text-gray-900">Resume Parser &amp; Insight Dashboard</h1>
          </div>

          <nav className="flex gap-1">
            {TABS.map((tab) => (
              <NavLink
                key={tab.to}
                to={tab.to}
                className={({ isActive }) =>
                  `px-4 py-2 text-sm border-b-2 -mb-px transition-colors ${
                    isActive
                      ? 'border-blue-600 text-blue-700 font-medium'
                      : 'border-transparent text-gray-600 hover:text-gray-900'
                  }`
                }
              >
                {tab.label}
              </NavLink>
            ))}
          </nav>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-6 py-8">
        {/* Keeps the shell usable if a page crashes while rendering */}
        <ErrorBoundary>
          <Routes>
            <Route path="/" element={<Navigate to="/upload" replace />} />
            <Route path="/upload" element={<UploadPage />} />
            <Route path="/resumes" element={<ResumeListPage />} />
            <Route path="/resumes/:id" element={<ResumeDetailPage />} />
            <Route path="/dashboard" element={<DashboardPage />} />
            <Route path="*" element={<Navigate to="/upload" replace />} />
          </Routes>
        </ErrorBoundary>
      </main>
    </div>
  );
}
