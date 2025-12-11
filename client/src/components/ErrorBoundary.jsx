// frontend/src/components/ErrorBoundary.jsx - NEW FILE

import React from 'react';

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { 
        hasError: false, 
        error: null,
        errorInfo: null 
    };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true };
  }

  componentDidCatch(error, errorInfo) {
    this.setState({
      error: error,
      errorInfo: errorInfo
    });
    console.error('Error caught by boundary:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="error-boundary">
          <div className="error-content">
            <h2>Something went wrong</h2>
            <p>We're working on fixing this issue. Please try refreshing the page.</p>
            <details className="error-details">
              <summary>Error Details</summary>
              <p>{this.state.error && this.state.error.toString()}</p>
              <pre>{this.state.errorInfo.componentStack}</pre>
            </details>
            <button 
              className="retry-btn"
              onClick={() => this.setState({ hasError: false, error: null, errorInfo: null })}
            >
              Try Again
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;