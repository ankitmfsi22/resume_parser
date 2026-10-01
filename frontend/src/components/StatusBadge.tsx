import type { ResumeStatus } from '../types';

const LABELS: Record<ResumeStatus, string> = {
  uploaded: 'Processing',
  processing: 'Processing',
  ocr: 'Processing',
  parsed: 'Complete',
  failed: 'Failed',
};

const STYLES: Record<ResumeStatus, string> = {
  uploaded: 'bg-blue-100 text-blue-700',
  processing: 'bg-blue-100 text-blue-700',
  ocr: 'bg-blue-100 text-blue-700',
  parsed: 'bg-green-100 text-green-700',
  failed: 'bg-red-100 text-red-700',
};

export default function StatusBadge({ status }: { status: string }) {
  const key = status as ResumeStatus;
  const label = LABELS[key] ?? status;
  const style = STYLES[key] ?? 'bg-gray-100 text-gray-700';

  return (
    <span className={`inline-block px-2 py-0.5 text-xs rounded font-medium ${style}`}>
      {label}
    </span>
  );
}