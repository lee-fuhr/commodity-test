/**
 * Tests for ProcessingStatus component
 */

import React from 'react'
import { render, screen } from '@testing-library/react'
import { ProcessingStatus } from '../../../components/processing/ProcessingStatus'

describe('ProcessingStatus', () => {
  it('shows current URL when status is crawling', () => {
    render(
      <ProcessingStatus
        status="crawling"
        message="Crawling site"
        currentUrl="https://example.com/about"
      />
    )

    expect(screen.getByText('Scanning:')).toBeInTheDocument()
    expect(screen.getByText('/about')).toBeInTheDocument()
  })

  it('extracts path from URL for cleaner display', () => {
    render(
      <ProcessingStatus
        status="crawling"
        message="Crawling"
        currentUrl="https://example.com/products/item-1"
      />
    )

    expect(screen.getByText('/products/item-1')).toBeInTheDocument()
  })

  it('handles URL without path (shows /)', () => {
    render(
      <ProcessingStatus
        status="crawling"
        message="Crawling"
        currentUrl="https://example.com"
      />
    )

    expect(screen.getByText('/')).toBeInTheDocument()
  })

  it('handles invalid URL gracefully', () => {
    render(
      <ProcessingStatus
        status="crawling"
        message="Crawling"
        currentUrl="invalid-url"
      />
    )

    expect(screen.getByText('invalid-url')).toBeInTheDocument()
  })

  it('does not show URL when status is not crawling', () => {
    render(
      <ProcessingStatus
        status="analyzing"
        message="Analyzing content"
        currentUrl="https://example.com/about"
      />
    )

    expect(screen.queryByText('Scanning:')).not.toBeInTheDocument()
  })

  it('shows message when status is analyzing', () => {
    render(
      <ProcessingStatus
        status="analyzing"
        message="Running AI analysis..."
      />
    )

    expect(screen.getByText('Running AI analysis...')).toBeInTheDocument()
  })

  it('does not show message when status is not analyzing', () => {
    render(<ProcessingStatus status="crawling" message="Some message" />)

    expect(screen.queryByText('Some message')).not.toBeInTheDocument()
  })

  it('handles pending status without showing anything', () => {
    const { container } = render(
      <ProcessingStatus status="pending" message="Pending..." />
    )

    // Should render empty fragment
    expect(container.firstChild).toBeEmptyDOMElement()
  })

  it('handles complete status without showing anything', () => {
    const { container } = render(
      <ProcessingStatus status="complete" message="Complete!" />
    )

    expect(container.firstChild).toBeEmptyDOMElement()
  })

  it('handles failed status without showing anything', () => {
    const { container } = render(
      <ProcessingStatus status="failed" message="Failed" />
    )

    expect(container.firstChild).toBeEmptyDOMElement()
  })
})
