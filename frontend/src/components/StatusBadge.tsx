import type { ResumeStatus } from '../types';

const STYLES: Record<ResumeStatus, string> = {
  uploaded: 'bg-gray-100 text-gray-700',
  processing: 'bg-blue-100 text-blue-700',
  ocr: 'bg-purple-100 text-purple-700',
  parsed: 'bg-green-100 text-green-700',
  failed: 'bg-red-100 text-red-700',
};

export default function StatusBadge({ status }: { status: string }) {
  const style = STYLES[status as ResumeStatus] ?? 'bg-gray-100 text-gray-700';

  return (
    <span className={`inline-block px-2 py-0.5 text-xs rounded font-medium ${style}`}>
      {status}
    </span>
  );
}