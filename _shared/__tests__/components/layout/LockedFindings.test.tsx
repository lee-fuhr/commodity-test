/**
 * Tests for LockedFindings component
 */

import React from 'react'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { LockedFindings } from '../../../components/layout/LockedFindings'
import { TeaserFinding } from '../../../types/audit'

const mockTeaserFinding: TeaserFinding = {
  phrase: 'We provide quality solutions',
  location: 'Homepage hero',
  rewrite: 'We build custom steel structures for commercial construction projects',
  problem: 'Generic language that could apply to any business',
  severity: 'critical',
}

const defaultProps = {
  onUnlock: jest.fn(),
}

beforeEach(() => {
  jest.clearAllMocks()
})

describe('LockedFindings', () => {
  it('renders unlock CTA with default price', () => {
    render(<LockedFindings {...defaultProps} />)

    expect(screen.getByText(/unlock full audit/i)).toBeInTheDocument()
    expect(screen.getByText(/\$400/i)).toBeInTheDocument()
  })

  it('renders unlock CTA with custom price', () => {
    render(<LockedFindings {...defaultProps} price={500} />)

    expect(screen.getByText(/\$500/i)).toBeInTheDocument()
  })

  it('shows teaser finding when provided and showTeaser is true', () => {
    render(
      <LockedFindings
        {...defaultProps}
        showTeaser={true}
        teaserFinding={mockTeaserFinding}
      />
    )

    expect(screen.getByText('We provide quality solutions')).toBeInTheDocument()
    expect(
      screen.getByText('We build custom steel structures for commercial construction projects')
    ).toBeInTheDocument()
    expect(screen.getByText(/homepage hero/i)).toBeInTheDocument()
  })

  it('does not show teaser when showTeaser is false', () => {
    render(
      <LockedFindings
        {...defaultProps}
        showTeaser={false}
        teaserFinding={mockTeaserFinding}
      />
    )

    expect(screen.queryByText('We provide quality solutions')).not.toBeInTheDocument()
  })

  it('shows fallback message when showTeaser is true but no teaserFinding provided', () => {
    render(<LockedFindings {...defaultProps} showTeaser={true} />)

    expect(screen.getByText('SAMPLE REWRITE:')).toBeInTheDocument()
    expect(
      screen.getByText(/15-20 specific rewrites from YOUR site/i)
    ).toBeInTheDocument()
  })

  it('displays teaser finding problem explanation', () => {
    render(
      <LockedFindings
        {...defaultProps}
        showTeaser={true}
        teaserFinding={mockTeaserFinding}
      />
    )

    expect(screen.getByText(/why this matters/i)).toBeInTheDocument()
    expect(
      screen.getByText('Generic language that could apply to any business')
    ).toBeInTheDocument()
  })

  it('calls onUnlock when button clicked', async () => {
    const user = userEvent.setup()
    render(<LockedFindings {...defaultProps} />)

    const unlockButton = screen.getByRole('button', { name: /unlock full audit/i })
    await user.click(unlockButton)

    expect(defaultProps.onUnlock).toHaveBeenCalled()
  })

  it('shows before/after visual comparison for teaser', () => {
    render(
      <LockedFindings
        {...defaultProps}
        showTeaser={true}
        teaserFinding={mockTeaserFinding}
      />
    )

    expect(screen.getByText('❌ ON YOUR SITE NOW')).toBeInTheDocument()
    expect(screen.getByText('✓ SUGGESTED REWRITE')).toBeInTheDocument()
  })

  it('displays location where phrase was found', () => {
    render(
      <LockedFindings
        {...defaultProps}
        showTeaser={true}
        teaserFinding={mockTeaserFinding}
      />
    )

    expect(screen.getByText(/found:/i)).toBeInTheDocument()
    expect(screen.getByText('Homepage hero')).toBeInTheDocument()
  })

  it('shows value proposition of full audit', () => {
    render(<LockedFindings {...defaultProps} />)

    expect(screen.getByText(/includes all phrases from YOUR site/i)).toBeInTheDocument()
  })

  it('emphasizes that rewrites are specific to user site', () => {
    render(
      <LockedFindings
        {...defaultProps}
        showTeaser={true}
        teaserFinding={mockTeaserFinding}
      />
    )

    expect(screen.getByText(/15-20 rewrites like this, all specific to YOUR site/i)).toBeInTheDocument()
  })

  it('renders locked state with dashed border', () => {
    const { container } = render(<LockedFindings {...defaultProps} />)

    const lockedBox = container.querySelector('.border-dashed')
    expect(lockedBox).toBeInTheDocument()
  })

  it('shows real finding label for teaser', () => {
    render(
      <LockedFindings
        {...defaultProps}
        showTeaser={true}
        teaserFinding={mockTeaserFinding}
      />
    )

    expect(screen.getByText('REAL FINDING FROM YOUR SITE:')).toBeInTheDocument()
  })
})
