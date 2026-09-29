import { useState } from 'react';
import UploadPage from './pages/UploadPage';
import ResumeListPage from './pages/ResumeListPage';
import DashboardPage from './pages/DashboardPage';

type Tab = 'upload' | 'resumes' | 'dashboard';

const TABS: { id: Tab; label: string }[] = [
  { id: 'upload', label: 'Upload' },
  { id: 'resumes', label: 'Resumes' },
  { id: 'dashboard', label: 'Dashboard' },
];

export default function App() {
  const [tab, setTab] = useState<Tab>('upload');

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white border-b">
        <div className="max-w-6xl mx-auto px-6 py-4">
          <h1 className="text-xl font-semibold text-gray-900">
            Resume Parser &amp; Insight Dashboard
          </h1>

          <nav className="flex gap-1 mt-4">
            {TABS.map((t) => (
              <button
                key={t.id}
                onClick={() => setTab(t.id)}
                className={`px-4 py-2 text-sm rounded-t ${
                  tab === t.id ? 'bg-blue-600 text-white' : 'text-gray-600 hover:bg-gray-100'
                }`}
              >
                {t.label}
              </button>
            ))}
          </nav>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-6 py-8">
        {tab === 'upload' && <UploadPage />}
        {tab === 'resumes' && <ResumeListPage />}
        {tab === 'dashboard' && <DashboardPage />}
      </main>
    </div>
  );
}