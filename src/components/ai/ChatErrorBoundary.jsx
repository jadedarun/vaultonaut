import React from 'react';
import { AlertTriangle, RefreshCw } from 'lucide-react';

export default class ChatErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error('ChatErrorBoundary caught an exception:', error, errorInfo);
  }

  handleReset = () => {
    this.setState({ hasError: false, error: null });
  };

  render() {
    if (this.state.hasError) {
      return (
        <div className="glass-card" style={{ padding: '2.5rem', textAlign: 'center', margin: '1rem', color: 'var(--text-muted)' }}>
          <AlertTriangle size={42} color="#f87171" style={{ marginBottom: '1rem' }} />
          <h3 style={{ fontSize: '1.2rem', color: 'var(--color-arctic-1)', margin: '0 0 0.4rem 0' }}>AI Workspace Exception Detected</h3>
          <p style={{ fontSize: '0.88rem', color: 'var(--text-secondary)', marginBottom: '1.5rem' }}>
            An unhandled rendering error occurred in the workspace view.
          </p>
          <button className="btn-white-solid" onClick={this.handleReset} style={{ padding: '0.6rem 1.4rem' }}>
            <RefreshCw size={15} /> Reset Component
          </button>
        </div>
      );
    }
    return this.props.children;
  }
}
