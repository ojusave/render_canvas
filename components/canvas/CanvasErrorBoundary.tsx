'use client';

import { Component, type ReactNode } from 'react';
import { CanvasErrorState } from './CanvasErrorState';

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export class CanvasErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  handleRetry = () => {
    this.setState({ hasError: false, error: null });
  };

  render() {
    if (this.state.hasError && this.state.error) {
      return (
        <div className="flex-1">
          <CanvasErrorState error={this.state.error} onRetry={this.handleRetry} />
        </div>
      );
    }
    return this.props.children;
  }
}
