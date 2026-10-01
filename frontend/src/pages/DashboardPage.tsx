import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import EmptyState from '../components/EmptyState';
import ErrorState from '../components/ErrorState';
import { friendlyRequestError, type RequestError } from '../utils/errors';
import {
  Bar,
  BarChart,
  Cell,
  CartesianGrid,
  Legend,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';
import { fetchInsights } from '../services/api';
import type { Insights } from '../types';

const BAR_BLUE = '#2563eb';
const BAR_GREEN = '#16a34a';
const BAR_ORANGE = '#ea580c';
const PIE_COLORS = ['#2563eb', '#16a34a', '#ea580c', '#7c3aed', '#db2777', '#0891b2'];
const EXPERIENCE_COLORS = ['#06b6d4', '#22c55e', '#f59e0b', '#8b5cf6'];
const EXPERIENCE_RANGES: Record<string, { minExperience?: string; maxExperience?: string }> = {
  '0-2 yrs': { maxExperience: '2' },
  '3-5 yrs': { minExperience: '3', maxExperience: '5' },
  '6-10 yrs': { minExperience: '6', maxExperience: '10' },
  '10+ yrs': { minExperience: '11' },
};

function StatCard({
  label,
  value,
  onClick,
}: {
  label: string;
  value: string | number;
  onClick?: () => void;
}) {
  return (
    <div
      onClick={onClick}
      className={`bg-white rounded border p-5 ${
        onClick ? 'cursor-pointer hover:border-blue-400 hover:shadow-sm' : ''
      }`}
    >
      <p className="text-sm text-gray-500">{label}</p>
      <p className="text-2xl font-semibold mt-1">{value}</p>
      {onClick && <p className="text-xs text-blue-600 mt-1">View candidates →</p>}
    </div>
  );
}

function ChartCard({
  title,
  hint,
  empty,
  children,
}: {
  title: string;
  hint: string;
  empty: boolean;
  children: React.ReactNode;
}) {
  return (
    <div className="bg-white rounded border p-6">
      <div className="flex justify-between items-baseline mb-4">
        <h2 className="font-medium">{title}</h2>
        <span className="text-xs text-gray-400">{hint}</span>
      </div>
      {empty ? <p className="text-sm text-gray-400">No data yet</p> : children}
    </div>
  );
}
function onSegmentClick(handler: (name: string) => void) {
  return (data: unknown) => {
    const name = (data as { name?: string })?.name;
    if (name) handler(name);
  };
}

export default function DashboardPage() {
  const navigate = useNavigate();
  const [error, setError] = useState<RequestError | null>(null);
  const [reloadKey, setReloadKey] = useState(0);
  const [insights, setInsights] = useState<Insights | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    void (async () => {
      setLoading(true);
      setError(null);
      try {
        setInsights(await fetchInsights());
      } catch (err) {
        setError(friendlyRequestError(err));
      } finally {
        setLoading(false);
      }
    })();
  }, [reloadKey]);

  useEffect(() => {
    void (async () => {
      try {
        setInsights(await fetchInsights());
      } finally {
        setLoading(false);
      }
    })();
  }, []);
  function drillDown(params: Record<string, string>): void {
    navigate(`/resumes?${new URLSearchParams(params).toString()}`);
  }
  if (loading) return <p className="text-sm text-gray-500">Loading insights...</p>;

  if (error) {
    return (
      <ErrorState
        variant="block"
        message={error.message}
        onRetry={error.retryable ? () => setReloadKey((k) => k + 1) : undefined}
      />
    );
  }

  if (!insights || insights.totalResumes === 0) {
    return (
      <EmptyState
        title="No resumes yet"
        hint="Upload some resumes to see hiring insights here"
        action={{ label: 'Go to upload', onClick: () => navigate('/upload') }}
      />
    );
  }
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <StatCard
          label="Total resumes"
          value={insights.totalResumes}
          onClick={() => drillDown({})}
        />
        <StatCard
          label="Complete"
          value={insights.parsedCount}
          onClick={() => drillDown({ status: 'parsed' })}
        />
        <StatCard
          label="Needs attention"
          value={insights.failedCount}
          onClick={() => drillDown({ status: 'failed' })}
        />
        <StatCard label="Avg experience" value={`${insights.averageExperience} yrs`} />
      </div>

      <ChartCard
        title="Top skills"
        hint="Click a bar to see those candidates"
        empty={insights.topSkills.length === 0}
      >
        <ResponsiveContainer width="100%" height={320}>
          <BarChart
            data={insights.topSkills.map((s) => ({ name: s.skill, count: s.count }))}
            margin={{ bottom: 60 }}
          >
            <CartesianGrid strokeDasharray="3 3" vertical={false} />
            <XAxis dataKey="name" angle={-40} textAnchor="end" height={80} fontSize={12} />
            <YAxis allowDecimals={false} fontSize={12} />
            <Tooltip cursor={{ fill: '#f3f4f6' }} />
            <Bar
              dataKey="count"
              fill={BAR_BLUE}
              radius={[3, 3, 0, 0]}
              cursor="pointer"
              onClick={onSegmentClick((name) => drillDown({ skill: name }))}
            />
          </BarChart>
        </ResponsiveContainer>
      </ChartCard>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <ChartCard
          title="Strong matches per role"
          hint="50% match or above · click a slice"
          empty={insights.roleDistribution.length === 0}
        >
          <ResponsiveContainer width="100%" height={340}>
            <PieChart>
              <Pie
                data={insights.roleDistribution.map((r) => ({
                  name: r.roleName,
                  value: r.count,
                }))}
                dataKey="value"
                nameKey="name"
                cx="50%"
                cy="45%"
                outerRadius={105}
                label={({ value }) => value}
                labelLine={false}
                cursor="pointer"
                onClick={onSegmentClick((name) => drillDown({ role: name, minScore: '50' }))}
              >
                {insights.roleDistribution.map((_, index) => (
                  <Cell key={index} fill={PIE_COLORS[index % PIE_COLORS.length]} />
                ))}
              </Pie>
              <Tooltip />
              <Legend verticalAlign="bottom" height={40} iconType="circle" />
            </PieChart>
          </ResponsiveContainer>
        </ChartCard>

        <ChartCard
          title="Experience distribution"
          hint="Click a slice to filter"
          empty={insights.experienceDistribution.every((b) => b.count === 0)}
        >
          <ResponsiveContainer width="100%" height={340}>
            <PieChart>
              <Pie
                data={insights.experienceDistribution
                  .filter((b) => b.count > 0)
                  .map((b) => ({ name: b.range, value: b.count }))}
                dataKey="value"
                nameKey="name"
                cx="50%"
                cy="45%"
                innerRadius={58}
                outerRadius={108}
                paddingAngle={3}
                label={({ value }) => value}
                labelLine={false}
                cursor="pointer"
                onClick={onSegmentClick((name) => drillDown(EXPERIENCE_RANGES[name] ?? {}))}
              >
                {insights.experienceDistribution
                  .filter((b) => b.count > 0)
                  .map((_, index) => (
                    <Cell
                      key={index}
                      fill={EXPERIENCE_COLORS[index % EXPERIENCE_COLORS.length]}
                      stroke="#fff"
                      strokeWidth={2}
                    />
                  ))}
              </Pie>
              <Tooltip />
              <Legend verticalAlign="bottom" height={40} iconType="circle" />
            </PieChart>
          </ResponsiveContainer>
        </ChartCard>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <ChartCard
          title="Candidates by location"
          hint="Click to filter"
          empty={insights.topLocations.length === 0}
        >
          <ResponsiveContainer width="100%" height={300}>
            <BarChart
              data={insights.topLocations.map((l) => ({ name: l.location, count: l.count }))}
              layout="vertical"
              margin={{ left: 80 }}
            >
              <CartesianGrid strokeDasharray="3 3" horizontal={false} />
              <XAxis type="number" allowDecimals={false} fontSize={12} />
              <YAxis type="category" dataKey="name" width={110} fontSize={12} />
              <Tooltip cursor={{ fill: '#f3f4f6' }} />
              <Bar
                dataKey="count"
                fill={BAR_ORANGE}
                radius={[0, 3, 3, 0]}
                cursor="pointer"
                onClick={onSegmentClick((name) => drillDown({ location: name }))}
              />
            </BarChart>
          </ResponsiveContainer>
        </ChartCard>

        <ChartCard
          title="Common universities"
          hint="Click to filter"
          empty={insights.commonUniversities.length === 0}
        >
          <ResponsiveContainer width="100%" height={300}>
            <BarChart
              data={insights.commonUniversities.map((u) => ({
                name: u.university,
                count: u.count,
              }))}
              layout="vertical"
              margin={{ left: 100 }}
            >
              <CartesianGrid strokeDasharray="3 3" horizontal={false} />
              <XAxis type="number" allowDecimals={false} fontSize={12} />
              <YAxis type="category" dataKey="name" width={150} fontSize={11} />
              <Tooltip cursor={{ fill: '#f3f4f6' }} />
              <Bar
                dataKey="count"
                fill={BAR_GREEN}
                radius={[0, 3, 3, 0]}
                cursor="pointer"
                onClick={onSegmentClick((name) => drillDown({ university: name }))}
              />
            </BarChart>
          </ResponsiveContainer>
        </ChartCard>
      </div>
    </div>
  );
}