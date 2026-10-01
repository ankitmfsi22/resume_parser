import { Component, type ErrorInfo, type ReactNode } from 'react';

interface Props {
  children: ReactNode;
}
interface State {
  hasError: boolean;
}

export default class ErrorBoundary extends Component<Props, State> {
  state: State = { hasError: false };

  static getDerivedStateFromError(): State {
    return { hasError: true };
  }
  componentDidCatch(error: Error, info: ErrorInfo): void {
    console.error('Unhandled UI error:', error, info.componentStack);
  }

  render(): ReactNode {
    if (!this.state.hasError) return this.props.children;

    return (
      <div className="bg-white rounded border p-10 text-center">
        <p className="text-lg font-medium text-gray-900">Something went wrong</p>
        <p className="text-sm text-gray-500 mt-2">
          This page could not be displayed. Reloading usually fixes it.
        </p>

        <button
          onClick={() => window.location.reload()}
          className="mt-5 px-4 py-2 text-sm bg-blue-600 text-white rounded hover:bg-blue-700"
        >
          Reload page
        </button>
      </div>
    );
  }
}