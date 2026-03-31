/**
 * Tests for AuditLayout component
 */

import React from 'react'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { AuditLayout } from '../../../components/layout/AuditLayout'
import { View, ViewType } from '../../../types/audit'

const mockViews: View[] = [
  { id: 'overview', label: 'Overview', description: 'Overview of audit' },
  { id: 'message', label: 'Message', description: 'Message analysis' },
]

const defaultProps = {
  children: <div>Main content</div>,
  companyName: 'Acme Corp',
  hostname: 'acme.com',
  currentView: 'overview' as ViewType,
  onViewChange: jest.fn(),
  views: mockViews,
}

beforeEach(() => {
  jest.clearAllMocks()
  ;(global.scrollTo as jest.Mock).mockClear()
})

describe('AuditLayout', () => {
  it('renders children content', () => {
    render(<AuditLayout {...defaultProps} />)

    expect(screen.getByText('Main content')).toBeInTheDocument()
  })

  it('renders sidebar navigation', () => {
    render(<AuditLayout {...defaultProps} />)

    expect(screen.getByText('Acme Corp')).toBeInTheDocument()
    expect(screen.getByText('Overview')).toBeInTheDocument()
    expect(screen.getByText('Message')).toBeInTheDocument()
  })

  it('passes props to SidebarNav correctly', () => {
    render(
      <AuditLayout
        {...defaultProps}
        isLocked={true}
        showDownloadPdf={true}
      />
    )

    // Should show locked state
    expect(screen.getByText('Audit for')).toBeInTheDocument()

    // Should show PDF button
    expect(screen.getByText(/download pdf/i)).toBeInTheDocument()
  })

  it('calls onViewChange when sidebar navigation clicked', async () => {
    const user = userEvent.setup()
    render(<AuditLayout {...defaultProps} />)

    const messageButton = screen.getByRole('button', { name: /message/i })
    await user.click(messageButton)

    expect(defaultProps.onViewChange).toHaveBeenCalledWith('message')
  })

  it('scrolls to top when view changes', () => {
    const { rerender } = render(<AuditLayout {...defaultProps} currentView="overview" />)

    rerender(<AuditLayout {...defaultProps} currentView="message" />)

    expect(global.scrollTo).toHaveBeenCalledWith({
      top: 0,
      behavior: 'smooth',
    })
  })

  it('does not scroll when other props change', () => {
    const { rerender } = render(<AuditLayout {...defaultProps} />)

    rerender(
      <AuditLayout {...defaultProps} companyName="New Company" />
    )

    // scrollTo called once on mount, but not again
    expect(global.scrollTo).toHaveBeenCalledTimes(1)
  })

  it('renders top banner when provided', () => {
    const topBanner = <div data-testid="banner">Sample Report</div>

    render(<AuditLayout {...defaultProps} topBanner={topBanner} />)

    expect(screen.getByTestId('banner')).toBeInTheDocument()
  })

  it('adds padding to content when top banner present', () => {
    const topBanner = <div>Banner</div>
    const { container } = render(
      <AuditLayout {...defaultProps} topBanner={topBanner} />
    )

    const contentArea = container.querySelector('.pt-\\[44px\\]')
    expect(contentArea).toBeInTheDocument()
  })

  it('does not add padding when no banner', () => {
    const { container } = render(<AuditLayout {...defaultProps} />)

    const contentArea = container.querySelector('.lg\\:ml-64')
    expect(contentArea).not.toHaveClass('pt-[44px]')
  })

  it('renders sidebar bottom CTA when provided', () => {
    const bottomCta = <div data-testid="cta">Upgrade Now</div>

    render(<AuditLayout {...defaultProps} sidebarBottomCta={bottomCta} />)

    expect(screen.getByTestId('cta')).toBeInTheDocument()
  })

  it('applies correct layout classes for responsive design', () => {
    const { container } = render(<AuditLayout {...defaultProps} />)

    // Sidebar should be hidden on mobile, shown on desktop
    const sidebar = container.querySelector('nav')
    expect(sidebar).toHaveClass('hidden')
    expect(sidebar).toHaveClass('lg:block')

    // Content area should have left margin on desktop
    const contentArea = container.querySelector('.lg\\:ml-64')
    expect(contentArea).toBeInTheDocument()
  })

  it('applies print styles correctly', () => {
    const { container } = render(<AuditLayout {...defaultProps} />)

    // Sidebar should be hidden when printing
    const sidebar = container.querySelector('nav')
    expect(sidebar).toHaveClass('print:!hidden')

    // Content margin should be removed when printing
    const contentArea = container.querySelector('.print\\:\\!ml-0')
    expect(contentArea).toBeInTheDocument()
  })

  it('sets top banner as fixed with high z-index', () => {
    const topBanner = <div>Banner</div>
    const { container } = render(
      <AuditLayout {...defaultProps} topBanner={topBanner} />
    )

    const bannerContainer = container.querySelector('.fixed.top-0.left-0.right-0')
    expect(bannerContainer).toBeInTheDocument()
    expect(bannerContainer).toHaveClass('z-50')
  })

  it('passes download PDF callback to sidebar', async () => {
    const user = userEvent.setup()
    const onDownloadPdf = jest.fn()

    render(
      <AuditLayout
        {...defaultProps}
        showDownloadPdf={true}
        onDownloadPdf={onDownloadPdf}
        isLocked={false}
      />
    )

    const pdfButton = screen.getByRole('button', { name: /download pdf/i })
    await user.click(pdfButton)

    expect(onDownloadPdf).toHaveBeenCalled()
  })

  it('handles sample mode correctly', () => {
    render(<AuditLayout {...defaultProps} isSample={true} isLocked={false} />)

    expect(screen.getByText('Sample audit for')).toBeInTheDocument()
  })

  it('handles full audit mode correctly', () => {
    render(<AuditLayout {...defaultProps} isSample={false} isLocked={true} />)

    expect(screen.getByText('Audit for')).toBeInTheDocument()
  })
})
