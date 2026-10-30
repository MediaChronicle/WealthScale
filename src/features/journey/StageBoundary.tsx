import { Component } from 'react'
import type { ErrorInfo, ReactNode, ReactElement } from 'react'

export class StageBoundary extends Component<
  { children: ReactNode; onFallback: () => void },
  { failed: boolean }
> {
  state = { failed: false }
  static getDerivedStateFromError(): { failed: boolean } {
    return { failed: true }
  }
  componentDidCatch(error: Error, info: ErrorInfo): void {
    console.error('Scale stage unavailable', error.message, info.componentStack)
  }
  render(): ReactElement | ReactNode {
    if (this.state.failed)
      return (
        <div className="stage-fallback">
          <p>The 3D view is unavailable on this device.</p>
          <button onClick={this.props.onFallback}>
            Use the illustrated view
          </button>
        </div>
      )
    return this.props.children
  }
}
