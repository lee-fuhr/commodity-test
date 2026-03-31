/**
 * Tests for ProcessingProgress component
 */

import React from 'react'
import { render, screen } from '@testing-library/react'
import { ProcessingProgress } from '../../../components/processing/ProcessingProgress'

describe('ProcessingProgress', () => {
  it('renders progress bar with correct width', () => {
    const { container } = render(<ProcessingProgress progress={50} />)
    const progressBar = container.querySelector('div[style*="width"]')
    expect(progressBar).toHaveStyle({ width: '50%' })
  })

  it('shows percentage text by default', () => {
    render(<ProcessingProgress progress={75} />)
    expect(screen.getByText('75% complete')).toBeInTheDocument()
  })

  it('hides percentage text when showPercentage is false', () => {
    render(<ProcessingProgress progress={75} showPercentage={false} />)
    expect(screen.queryByText('75% complete')).not.toBeInTheDocument()
  })

  it('rounds percentage to nearest integer', () => {
    render(<ProcessingProgress progress={42.7} />)
    expect(screen.getByText('43% complete')).toBeInTheDocument()
  })

  it('clamps progress to 0-100 range (minimum)', () => {
    const { container } = render(<ProcessingProgress progress={-10} />)
    const progressBar = container.querySelector('div[style*="width"]')
    expect(progressBar).toHaveStyle({ width: '0%' })
  })

  it('clamps progress to 0-100 range (maximum)', () => {
    const { container } = render(<ProcessingProgress progress={150} />)
    const progressBar = container.querySelector('div[style*="width"]')
    expect(progressBar).toHaveStyle({ width: '100%' })
  })

  it('handles 0% progress', () => {
    const { container } = render(<ProcessingProgress progress={0} />)
    const progressBar = container.querySelector('div[style*="width"]')
    expect(progressBar).toHaveStyle({ width: '0%' })
    expect(screen.getByText('0% complete')).toBeInTheDocument()
  })

  it('handles 100% progress', () => {
    const { container } = render(<ProcessingProgress progress={100} />)
    const progressBar = container.querySelector('div[style*="width"]')
    expect(progressBar).toHaveStyle({ width: '100%' })
    expect(screen.getByText('100% complete')).toBeInTheDocument()
  })
})
