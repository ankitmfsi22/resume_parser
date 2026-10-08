interface Props {
  message: string;
  onRetry?: () => void;
  variant?: 'inline' | 'block';
}

export default function ErrorState({ message, onRetry, variant = 'inline' }: Props) {
  if (variant === 'block') {
    return (
      <div className="bg-white rounded border p-10 text-center">
        <p className="text-gray-900 font-medium">{message}</p>
        {onRetry && (
          <button
            onClick={onRetry}
            className="mt-4 px-4 py-2 text-sm bg-blue-600 text-white rounded hover:bg-blue-700"
          >
            Try again
          </button>
        )}
      </div>
    );
  }

  return (
    <div className="bg-red-50 border border-red-200 rounded px-4 py-3 flex items-start gap-3">
      <span className="text-red-500 leading-none mt-0.5">⚠</span>

      <div className="flex-1">
        <p className="text-sm text-red-800">{message}</p>
        {onRetry && (
          <button
            onClick={onRetry}
            className="mt-1.5 text-sm text-red-700 underline hover:text-red-900"
          >
            Try again
          </button>
        )}
      </div>
    </div>
  );
}
