/**
 * Tests for ProcessingPage component
 */

import React from 'react'
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { ProcessingPage } from '../../../components/processing/ProcessingPage'

const mockFetch = global.fetch as jest.Mock

const defaultProps = {
  analysisId: 'test-123',
  progress: 0,
  status: 'pending' as const,
  message: 'Starting...',
  onComplete: jest.fn(),
  onError: jest.fn(),
  apiEndpoint: '/api/status',
}

beforeEach(() => {
  jest.clearAllMocks()
  mockFetch.mockClear()
})

describe('ProcessingPage', () => {
  it('shows loading spinner during pending state', () => {
    render(<ProcessingPage {...defaultProps} status="pending" />)
    expect(screen.getByAltText('Loading')).toBeInTheDocument()
  })

  it('shows progress bar with percentage', () => {
    render(<ProcessingPage {...defaultProps} progress={50} status="crawling" />)
    expect(screen.getByText('50% complete')).toBeInTheDocument()
  })

  it('shows default title and subtitle', () => {
    render(<ProcessingPage {...defaultProps} />)
    expect(screen.getByText('Scanning your website')).toBeInTheDocument()
    expect(
      screen.getByText(/This takes 1-2 minutes/i)
    ).toBeInTheDocument()
  })

  it('shows custom title and subtitle', () => {
    render(
      <ProcessingPage
        {...defaultProps}
        title="Custom Processing"
        subtitle="Custom subtitle text"
      />
    )
    expect(screen.getByText('Custom Processing')).toBeInTheDocument()
    expect(screen.getByText('Custom subtitle text')).toBeInTheDocument()
  })

  it('shows items processed counter when provided', () => {
    render(
      <ProcessingPage
        {...defaultProps}
        itemsProcessed={15}
        itemsProcessedLabel="pages scanned"
      />
    )
    expect(screen.getByText('15')).toBeInTheDocument()
    expect(screen.getByText('pages scanned')).toBeInTheDocument()
  })

  it('does not show counter when itemsProcessed is 0', () => {
    render(
      <ProcessingPage
        {...defaultProps}
        itemsProcessed={0}
        itemsProcessedLabel="pages scanned"
      />
    )
    expect(screen.queryByText('pages scanned')).not.toBeInTheDocument()
  })

  it('renders checklist when items provided', () => {
    const checklistItems = [
      { label: 'Step 1', progressThreshold: 0 },
      { label: 'Step 2', progressThreshold: 50 },
    ]

    render(<ProcessingPage {...defaultProps} checklistItems={checklistItems} />)
    expect(screen.getByText('Step 1')).toBeInTheDocument()
    expect(screen.getByText('Step 2')).toBeInTheDocument()
  })

  it('shows LinkedIn field when enabled', () => {
    render(<ProcessingPage {...defaultProps} showLinkedInField={true} />)
    expect(screen.getByText('YOUR LINKEDIN (OPTIONAL)')).toBeInTheDocument()
    expect(screen.getByPlaceholderText('linkedin.com/company/...')).toBeInTheDocument()
  })

  it('shows email field when enabled', () => {
    render(<ProcessingPage {...defaultProps} showEmailField={true} />)
    expect(screen.getByText('EMAIL FOR RESULTS')).toBeInTheDocument()
    expect(screen.getByPlaceholderText('you@company.com')).toBeInTheDocument()
  })

  it('shows competitors field when enabled (locked state)', () => {
    render(<ProcessingPage {...defaultProps} showCompetitorsField={true} />)
    expect(screen.getByText('COMPETITORS TO BEAT')).toBeInTheDocument()
    expect(screen.getByText('Included in full audit')).toBeInTheDocument()
  })

  it('shows "Results ready!" when complete', async () => {
    // Mock API to return complete status
    mockFetch.mockResolvedValueOnce({
      json: async () => ({
        success: true,
        analysis: {
          status: 'complete',
          progress: 100,
          message: 'Complete!',
        },
      }),
    })

    render(<ProcessingPage {...defaultProps} />)

    await waitFor(() => {
      expect(screen.getByText('Results ready!')).toBeInTheDocument()
    })
  })

  it('calls onComplete with analysisId when reveal button clicked', async () => {
    const user = userEvent.setup()
    mockFetch.mockResolvedValueOnce({
      json: async () => ({
        success: true,
        analysis: {
          status: 'complete',
          progress: 100,
          message: 'Complete!',
          pagesCrawled: 10,
        },
      }),
    })

    render(<ProcessingPage {...defaultProps} />)

    await waitFor(() => {
      expect(screen.getByText('Results ready!')).toBeInTheDocument()
    })

    const button = screen.getByRole('button', { name: /show me my results/i })
    await user.click(button)

    expect(defaultProps.onComplete).toHaveBeenCalledWith('test-123')
  })

  it('shows custom completion message', async () => {
    mockFetch.mockResolvedValueOnce({
      json: async () => ({
        success: true,
        analysis: {
          status: 'complete',
          progress: 100,
          message: 'Complete!',
        },
      }),
    })

    render(
      <ProcessingPage
        {...defaultProps}
        completionMessage="Your custom completion message"
      />
    )

    await waitFor(() => {
      expect(
        screen.getByText('Your custom completion message')
      ).toBeInTheDocument()
    })
  })

  it('shows error state on API failure', async () => {
    mockFetch.mockResolvedValueOnce({
      status: 404,
      json: async () => ({
        success: false,
        error: 'Analysis not found',
      }),
    })

    render(<ProcessingPage {...defaultProps} />)

    await waitFor(() => {
      expect(screen.getByText('Something went wrong')).toBeInTheDocument()
      expect(screen.getByText('Analysis not found. Please try again.')).toBeInTheDocument()
    })
  })

  it('calls onError when API returns error', async () => {
    mockFetch.mockResolvedValueOnce({
      status: 500,
      json: async () => ({
        success: false,
        error: 'Server error',
      }),
    })

    render(<ProcessingPage {...defaultProps} />)

    await waitFor(() => {
      expect(defaultProps.onError).toHaveBeenCalledWith('Server error')
    })
  })

  it('shows error state when status is failed', async () => {
    mockFetch.mockResolvedValueOnce({
      json: async () => ({
        success: true,
        analysis: {
          status: 'failed',
          progress: 50,
          message: 'Analysis failed due to timeout',
        },
      }),
    })

    render(<ProcessingPage {...defaultProps} />)

    await waitFor(() => {
      expect(screen.getByText('Something went wrong')).toBeInTheDocument()
    })
  })

  it('polls API at specified interval', async () => {
    mockFetch
      .mockResolvedValueOnce({
        json: async () => ({
          success: true,
          analysis: { status: 'crawling', progress: 30, message: 'Crawling' },
        }),
      })
      .mockResolvedValueOnce({
        json: async () => ({
          success: true,
          analysis: { status: 'complete', progress: 100, message: 'Done' },
        }),
      })

    render(<ProcessingPage {...defaultProps} pollInterval={100} />)

    // Should poll immediately
    await waitFor(() => {
      expect(mockFetch).toHaveBeenCalledTimes(1)
    })

    // Should poll again after interval
    await waitFor(() => {
      expect(mockFetch).toHaveBeenCalledTimes(2)
    }, { timeout: 200 })
  })

  it('stops polling when component unmounts', async () => {
    mockFetch.mockResolvedValue({
      json: async () => ({
        success: true,
        analysis: { status: 'crawling', progress: 30, message: 'Crawling' },
      }),
    })

    const { unmount } = render(<ProcessingPage {...defaultProps} pollInterval={100} />)

    await waitFor(() => {
      expect(mockFetch).toHaveBeenCalled()
    })

    const callCountBeforeUnmount = mockFetch.mock.calls.length
    unmount()

    // Wait to ensure no more calls after unmount
    await new Promise((resolve) => setTimeout(resolve, 200))
    expect(mockFetch).toHaveBeenCalledTimes(callCountBeforeUnmount)
  })

  it('handles network errors gracefully by retrying', async () => {
    mockFetch
      .mockRejectedValueOnce(new Error('Network error'))
      .mockResolvedValueOnce({
        json: async () => ({
          success: true,
          analysis: { status: 'complete', progress: 100, message: 'Done' },
        }),
      })

    render(<ProcessingPage {...defaultProps} pollInterval={100} />)

    // Should eventually succeed after retry
    await waitFor(() => {
      expect(screen.getByText('Results ready!')).toBeInTheDocument()
    }, { timeout: 3000 })
  })

  it('renders processed items list when provided', () => {
    const processedItems = ['/page1', '/page2', '/page3']

    render(
      <ProcessingPage
        {...defaultProps}
        processedItems={processedItems}
        processedItemsLabel="PAGES FOUND"
      />
    )

    expect(screen.getByText('PAGES FOUND')).toBeInTheDocument()
    expect(screen.getByText('/page1')).toBeInTheDocument()
    expect(screen.getByText('/page2')).toBeInTheDocument()
  })

  it('only shows last 6 processed items', () => {
    const processedItems = [
      '/page1',
      '/page2',
      '/page3',
      '/page4',
      '/page5',
      '/page6',
      '/page7',
      '/page8',
    ]

    render(
      <ProcessingPage {...defaultProps} processedItems={processedItems} />
    )

    // Should not show first two pages
    expect(screen.queryByText('/page1')).not.toBeInTheDocument()
    expect(screen.queryByText('/page2')).not.toBeInTheDocument()

    // Should show last 6
    expect(screen.getByText('/page3')).toBeInTheDocument()
    expect(screen.getByText('/page8')).toBeInTheDocument()
  })

  it('calls onRetry when retry button clicked in error state', async () => {
    const user = userEvent.setup()
    const onRetry = jest.fn()

    mockFetch.mockResolvedValueOnce({
      status: 500,
      json: async () => ({
        success: false,
        error: 'Server error',
      }),
    })

    render(<ProcessingPage {...defaultProps} onRetry={onRetry} />)

    await waitFor(() => {
      expect(screen.getByText('Something went wrong')).toBeInTheDocument()
    })

    const retryButton = screen.getByRole('button', { name: /try again/i })
    await user.click(retryButton)

    expect(onRetry).toHaveBeenCalled()
  })

  it('updates state from API polling', async () => {
    mockFetch
      .mockResolvedValueOnce({
        json: async () => ({
          success: true,
          analysis: {
            status: 'crawling',
            progress: 25,
            message: 'Crawling pages',
            pagesCrawled: 5,
            currentUrl: 'https://example.com/about',
          },
        }),
      })
      .mockResolvedValueOnce({
        json: async () => ({
          success: true,
          analysis: {
            status: 'analyzing',
            progress: 75,
            message: 'Analyzing content',
            pagesCrawled: 15,
          },
        }),
      })

    render(<ProcessingPage {...defaultProps} pollInterval={100} />)

    // Initial state
    await waitFor(() => {
      expect(screen.getByText('25% complete')).toBeInTheDocument()
    })

    // Updated state after next poll
    await waitFor(() => {
      expect(screen.getByText('75% complete')).toBeInTheDocument()
    }, { timeout: 200 })
  })
})
