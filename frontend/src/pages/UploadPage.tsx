import axios from 'axios';
import { useEffect, useRef, useState } from 'react';
import { fetchResume, uploadResumes } from '../services/api';
import StatusBadge from '../components/StatusBadge';
import type { Parsed } from '../types';

const POLL_INTERVAL_MS = 2000;
const FINAL_STATUSES = ['parsed', 'failed'];

interface TrackedResume {
  id: string;
  fileName: string;
  status: string;
  parsed?: Parsed;
}

export default function UploadPage() {
  const [files, setFiles] = useState<File[]>([]);
  const [tracked, setTracked] = useState<TrackedResume[]>([]);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  async function handleUpload(): Promise<void> {
    if (files.length === 0) return;

    setUploading(true);
    setError('');

    try {
      const created = await uploadResumes(files);
      setTracked((prev) => [...created, ...prev]);
      setFiles([]);
      if (fileInputRef.current) fileInputRef.current.value = '';
    } catch (err) {
      const message =
        axios.isAxiosError(err) && err.response?.data?.error?.message
          ? err.response.data.error.message
          : 'Upload failed';
      setError(message);
    } finally {
      setUploading(false);
    }
  }
  useEffect(() => {
    const unfinished = tracked.filter((r) => !FINAL_STATUSES.includes(r.status));
    if (unfinished.length === 0) return;

    const timer = setInterval(() => {
      void (async () => {
        const updates = await Promise.all(
          unfinished.map(async (item) => {
            try {
              const resume = await fetchResume(item.id);
              return { id: item.id, status: resume.status, parsed: resume.parsed };
            } catch {
              return null;
            }
          }),
        );

        setTracked((prev) =>
          prev.map((item) => {
            const update = updates.find((u) => u && u.id === item.id);
            return update ? { ...item, ...update } : item;
          }),
        );
      })();
    }, POLL_INTERVAL_MS);
    return () => clearInterval(timer);
  }, [tracked]);

  return (
    <div className="space-y-6">
      <div className="bg-white rounded border p-6">
        <h2 className="font-medium mb-1">Upload resumes</h2>
        <p className="text-sm text-gray-500 mb-4">
          PDF, DOCX, JPG or PNG &middot; up to 10 files &middot; max 10 MB each
        </p>

        <input
          ref={fileInputRef}
          type="file"
          multiple
          accept=".pdf,.docx,.jpg,.jpeg,.png"
          onChange={(e) => setFiles(Array.from(e.target.files ?? []))}
          className="block w-full text-sm mb-4 file:mr-3 file:py-2 file:px-4
                     file:rounded file:border-0 file:bg-blue-50 file:text-blue-700"
        />

        {files.length > 0 && (
          <p className="text-sm text-gray-600 mb-4">{files.length} file(s) selected</p>
        )}

        <button
          onClick={() => void handleUpload()}
          disabled={files.length === 0 || uploading}
          className="px-4 py-2 bg-blue-600 text-white text-sm rounded
                     disabled:bg-gray-300 disabled:cursor-not-allowed"
        >
          {uploading ? 'Uploading...' : 'Upload'}
        </button>

        {error && <p className="text-sm text-red-600 mt-3">{error}</p>}
      </div>

      {tracked.length > 0 && (
        <div className="bg-white rounded border p-6">
          <h2 className="font-medium mb-4">Processing</h2>

          <table className="w-full text-sm">
            <thead>
              <tr className="text-left text-gray-500 border-b">
                <th className="pb-2">File</th>
                <th className="pb-2">Status</th>
                <th className="pb-2">Extracted</th>
              </tr>
            </thead>
            <tbody>
              {tracked.map((item) => (
                <tr key={item.id} className="border-b last:border-0">
                  <td className="py-2">{item.fileName}</td>
                  <td className="py-2">
                    <StatusBadge status={item.status} />
                  </td>
                  <td className="py-2 text-gray-600">
                    {item.status === 'parsed' && item.parsed
                      ? `${item.parsed.name ?? 'Name not found'} · ${item.parsed.skills.length} skills`
                      : item.status === 'failed'
                        ? 'Could not be parsed'
                        : 'Processing...'}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}