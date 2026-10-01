interface Props {
  title: string;
  hint?: string;
  action?: { label: string; onClick: () => void };
}
export default function EmptyState({ title, hint, action }: Props) {
  return (
    <div className="py-14 text-center">
      <p className="text-gray-700">{title}</p>
      {hint && <p className="text-sm text-gray-400 mt-1">{hint}</p>}

      {action && (
        <button
          onClick={action.onClick}
          className="mt-4 px-4 py-2 text-sm border rounded text-gray-700 hover:bg-gray-50"
        >
          {action.label}
        </button>
      )}
    </div>
  );
}