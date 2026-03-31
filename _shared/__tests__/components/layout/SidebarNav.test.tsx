/**
 * Tests for SidebarNav component
 */

import React from 'react'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { SidebarNav } from '../../../components/layout/SidebarNav'
import { View, ViewType } from '../../../types/audit'

const mockViews: View[] = [
  { id: 'overview', label: 'Overview', description: 'Overview of audit' },
  { id: 'message', label: 'Message', description: 'Message analysis' },
  { id: 'audience', label: 'Audience', description: 'Audience clarity' },
  { id: 'trust', label: 'Trust', description: 'Trust signals' },
  { id: 'copy', label: 'Copy', description: 'Copy issues' },
]

const defaultProps = {
  companyName: 'Acme Corp',
  hostname: 'acme.com',
  views: mockViews,
  currentView: 'overview' as ViewType,
  onViewChange: jest.fn(),
}

beforeEach(() => {
  jest.clearAllMocks()
})

describe('SidebarNav', () => {
  it('renders company name and hostname', () => {
    render(<SidebarNav {...defaultProps} />)

    expect(screen.getByText('Acme Corp')).toBeInTheDocument()
    expect(screen.getByText('acme.com')).toBeInTheDocument()
  })

  it('renders all view items', () => {
    render(<SidebarNav {...defaultProps} />)

    expect(screen.getByText('Overview')).toBeInTheDocument()
    expect(screen.getByText('Message')).toBeInTheDocument()
    expect(screen.getByText('Audience')).toBeInTheDocument()
    expect(screen.getByText('Trust')).toBeInTheDocument()
    expect(screen.getByText('Copy')).toBeInTheDocument()
  })

  it('highlights current view', () => {
    render(<SidebarNav {...defaultProps} currentView="message" />)

    const messageButton = screen.getByRole('button', { name: /message/i })
    expect(messageButton).toHaveClass('bg-white/20')
    expect(messageButton).toHaveClass('font-semibold')
  })

  it('shows sample audit label when not locked', () => {
    render(<SidebarNav {...defaultProps} isLocked={false} />)

    expect(screen.getByText('Sample audit for')).toBeInTheDocument()
  })

  it('shows regular audit label when locked', () => {
    render(<SidebarNav {...defaultProps} isLocked={true} />)

    expect(screen.getByText('Audit for')).toBeInTheDocument()
  })

  it('shows lock icons when isLocked=true (except overview)', () => {
    render(<SidebarNav {...defaultProps} isLocked={true} />)

    // Overview should NOT have lock
    const overviewButton = screen.getByRole('button', { name: /overview/i })
    expect(overviewButton.textContent).not.toContain('🔒')

    // Other views should have locks
    const messageButton = screen.getByRole('button', { name: /message/i })
    expect(messageButton.textContent).toContain('🔒')
  })

  it('does not show lock icons when isLocked=false', () => {
    const { container } = render(<SidebarNav {...defaultProps} isLocked={false} />)

    // Should not have any lock emojis
    expect(container.textContent).not.toContain('🔒')
  })

  it('calls onViewChange when view clicked', async () => {
    const user = userEvent.setup()
    render(<SidebarNav {...defaultProps} />)

    const messageButton = screen.getByRole('button', { name: /message/i })
    await user.click(messageButton)

    expect(defaultProps.onViewChange).toHaveBeenCalledWith('message')
  })

  it('calls onViewChange when company name clicked (goes to overview)', async () => {
    const user = userEvent.setup()
    render(<SidebarNav {...defaultProps} currentView="message" />)

    const companyButton = screen.getByRole('button', { name: /acme corp/i })
    await user.click(companyButton)

    expect(defaultProps.onViewChange).toHaveBeenCalledWith('overview')
  })

  it('shows download PDF button when enabled', () => {
    render(<SidebarNav {...defaultProps} showDownloadPdf={true} />)

    expect(screen.getByText(/download pdf/i)).toBeInTheDocument()
  })

  it('does not show download PDF button by default', () => {
    render(<SidebarNav {...defaultProps} />)

    expect(screen.queryByText(/download pdf/i)).not.toBeInTheDocument()
  })

  it('download PDF button is disabled when locked', () => {
    render(
      <SidebarNav
        {...defaultProps}
        showDownloadPdf={true}
        isLocked={true}
      />
    )

    const pdfButton = screen.getByRole('button', { name: /download pdf/i })
    expect(pdfButton).toBeDisabled()
    expect(pdfButton.textContent).toContain('🔒')
  })

  it('download PDF button is enabled when not locked', () => {
    render(
      <SidebarNav
        {...defaultProps}
        showDownloadPdf={true}
        isLocked={false}
      />
    )

    const pdfButton = screen.getByRole('button', { name: /download pdf/i })
    expect(pdfButton).not.toBeDisabled()
  })

  it('calls onDownloadPdf when PDF button clicked', async () => {
    const user = userEvent.setup()
    const onDownloadPdf = jest.fn()

    render(
      <SidebarNav
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

  it('does not call onDownloadPdf when button is locked', async () => {
    const user = userEvent.setup()
    const onDownloadPdf = jest.fn()

    render(
      <SidebarNav
        {...defaultProps}
        showDownloadPdf={true}
        onDownloadPdf={onDownloadPdf}
        isLocked={true}
      />
    )

    const pdfButton = screen.getByRole('button', { name: /download pdf/i })
    await user.click(pdfButton)

    // Should not call because button is disabled
    expect(onDownloadPdf).not.toHaveBeenCalled()
  })

  it('renders bottom CTA when provided', () => {
    const bottomCta = <div data-testid="custom-cta">Custom CTA</div>

    render(<SidebarNav {...defaultProps} bottomCta={bottomCta} />)

    expect(screen.getByTestId('custom-cta')).toBeInTheDocument()
  })

  it('applies hover styles to non-active views', () => {
    render(<SidebarNav {...defaultProps} currentView="overview" />)

    const messageButton = screen.getByRole('button', { name: /message/i })
    expect(messageButton).toHaveClass('opacity-70')
    expect(messageButton).toHaveClass('hover:opacity-100')
  })

  it('capitalizes company name button', () => {
    render(<SidebarNav {...defaultProps} />)

    const companyButton = screen.getByRole('button', { name: /acme corp/i })
    expect(companyButton).toHaveClass('capitalize')
  })

  it('displays hostname in monospace font', () => {
    const { container } = render(<SidebarNav {...defaultProps} />)

    const hostnameElement = container.querySelector('.font-mono')
    expect(hostnameElement).toHaveTextContent('acme.com')
  })
})
