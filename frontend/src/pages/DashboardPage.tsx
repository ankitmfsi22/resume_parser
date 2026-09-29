import { useEffect, useState } from 'react';
import {
  Bar,
  BarChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';
import { fetchInsights } from '../services/api';
import type { Insights } from '../types';

function StatCard({ label, value }: { label: string; value: string | number }) {
  return (
    <div className="bg-white rounded border p-5">
      <p className="text-sm text-gray-500">{label}</p>
      <p className="text-2xl font-semibold mt-1">{value}</p>
    </div>
  );
}

export default function DashboardPage() {
  const [insights, setInsights] = useState<Insights | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    void (async () => {
      try {
        setInsights(await fetchInsights());
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  if (loading) return <p className="text-sm text-gray-500">Loading insights...</p>;
  if (!insights) return <p className="text-sm text-gray-500">No insights available</p>;

  const skillData = insights.topSkills.map((s) => ({ name: s.skill, count: s.count }));
  const universityData = insights.commonUniversities.map((u) => ({
    name: u.university,
    count: u.count,
  }));

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <StatCard label="Total resumes" value={insights.totalResumes} />
        <StatCard label="Parsed" value={insights.parsedCount} />
        <StatCard label="Failed" value={insights.failedCount} />
        <StatCard label="Avg experience" value={`${insights.averageExperience} yrs`} />
      </div>

      <div className="bg-white rounded border p-6">
        <h2 className="font-medium mb-4">Top skills</h2>
        {skillData.length === 0 ? (
          <p className="text-sm text-gray-400">No data yet — upload some resumes</p>
        ) : (
          <ResponsiveContainer width="100%" height={320}>
            <BarChart data={skillData} margin={{ bottom: 60 }}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} />
              <XAxis dataKey="name" angle={-40} textAnchor="end" height={80} fontSize={12} />
              <YAxis allowDecimals={false} fontSize={12} />
              <Tooltip />
              <Bar dataKey="count" fill="#2563eb" radius={[3, 3, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        )}
      </div>

      <div className="bg-white rounded border p-6">
        <h2 className="font-medium mb-4">Common universities</h2>
        {universityData.length === 0 ? (
          <p className="text-sm text-gray-400">No education data extracted yet</p>
        ) : (
          <ResponsiveContainer width="100%" height={320}>
            <BarChart data={universityData} layout="vertical" margin={{ left: 120 }}>
              <CartesianGrid strokeDasharray="3 3" horizontal={false} />
              <XAxis type="number" allowDecimals={false} fontSize={12} />
              <YAxis type="category" dataKey="name" width={160} fontSize={12} />
              <Tooltip />
              <Bar dataKey="count" fill="#16a34a" radius={[0, 3, 3, 0]} />
            </BarChart>
          </ResponsiveContainer>
        )}
      </div>
    </div>
  );
}