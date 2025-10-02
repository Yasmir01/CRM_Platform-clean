import { Component, ReactNode } from 'react';

export class AppErrorBoundary extends Component<{ children: ReactNode }, { hasError: boolean }>{
  state = { hasError: false };
  static getDerivedStateFromError() { return { hasError: true }; }
  componentDidCatch(err: unknown) { console.error('ui_error', err); }
  render() {
    if (this.state.hasError) {
      return (
        <div className="p-6 max-w-xl mx-auto text-center">
          <h1 className="text-2xl font-semibold mb-2">Something went wrong</h1>
          <p className="mb-4">Try refreshing the page. If the problem persists, contact support.</p>
          <button onClick={() => location.reload()} className="px-4 py-2 rounded-xl bg-black text-white">Reload</button>
        </div>
      );
    }
    return this.props.children;
  }
}
