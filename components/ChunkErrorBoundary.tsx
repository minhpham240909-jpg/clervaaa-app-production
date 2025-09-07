'use client'

import React, { Component, ReactNode } from 'react'
import { logger } from '@/lib/logger'

interface Props {
  children: ReactNode
}

interface State {
  hasChunkError: boolean
  retryCount: number
}

class ChunkErrorBoundary extends Component<Props, State> {
  private maxRetries = 3

  constructor(props: Props) {
    super(props)
    this.state = {
      hasChunkError: false,
      retryCount: 0
    }
  }

  static getDerivedStateFromError(error: Error): Partial<State> | null {
    // Check if the error is related to chunk loading
    if (
      error.name === 'ChunkLoadError' ||
      error.message?.includes('Loading chunk') ||
      error.message?.includes('Failed to import')
    ) {
      return {
        hasChunkError: true
      }
    }
    return null
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    // Log chunk loading errors
    if (this.state.hasChunkError) {
      logger.error('Chunk loading error caught by boundary', error, {
        errorInfo: errorInfo.componentStack,
        retryCount: this.state.retryCount
      })
    }
  }

  handleRetry = () => {
    if (this.state.retryCount < this.maxRetries) {
      this.setState((prevState: any) => ({
        hasChunkError: false,
        retryCount: prevState.retryCount + 1
      }))
    } else {
      // If max retries reached, reload the page
      window.location.reload()
    }
  }

  render() {
    if (this.state.hasChunkError) {
      return (
        <div className='flex items-center justify-center min-h-96'>
          <div className='text-center max-w-md mx-auto'>
            <h2 className='text-2xl font-semibold text-neutral-900 mb-4'>
              Loading Error
            </h2>
            <p className='text-neutral-600 mb-6'>
              There was an issue loading this page. This usually happens due to a network issue or when the app has been updated.
            </p>
            <div className='flex flex-col sm:flex-row gap-3 justify-center'>
              <button
                onClick={this.handleRetry}
                className='btn-primary'
                disabled={this.state.retryCount >= this.maxRetries}
              >
                {this.state.retryCount >= this.maxRetries ? 'Refreshing...' : `Try Again (${this.state.retryCount}/${this.maxRetries})`}
              </button>
              <button
                onClick={() => window.location.reload()}
                className='btn-outline'
              >
                Refresh Page
              </button>
            </div>
          </div>
        </div>
      )
    }

    return this.props.children
  }
}

export default ChunkErrorBoundary