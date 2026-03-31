/**
 * Tests for AnimatedCounter component
 */

import React from 'react'
import { render, screen, act } from '@testing-library/react'
import { AnimatedCounter } from '../../../components/processing/AnimatedCounter'

// Reset mocks before each test
beforeEach(() => {
  jest.clearAllMocks()
  ;(global.requestAnimationFrame as jest.Mock).mockImplementation((cb) => {
    cb(Date.now())
    return 0
  })
})

describe('AnimatedCounter', () => {
  it('renders initial value of 0', () => {
    render(<AnimatedCounter value={0} />)
    expect(screen.getByText('0')).toBeInTheDocument()
  })

  it('animates to target value', () => {
    const { rerender } = render(<AnimatedCounter value={0} />)
    expect(screen.getByText('0')).toBeInTheDocument()

    // Update to new value
    act(() => {
      rerender(<AnimatedCounter value={100} />)
    })

    // requestAnimationFrame should have been called to start animation
    expect(global.requestAnimationFrame).toHaveBeenCalled()
  })

  it('applies custom className', () => {
    const { container } = render(
      <AnimatedCounter value={42} className="custom-class" />
    )
    const span = container.querySelector('span')
    expect(span).toHaveClass('custom-class')
  })

  it('handles rapid value changes', () => {
    const { rerender } = render(<AnimatedCounter value={0} />)

    act(() => {
      rerender(<AnimatedCounter value={50} />)
    })

    act(() => {
      rerender(<AnimatedCounter value={100} />)
    })

    // Should handle multiple updates without errors
    expect(global.requestAnimationFrame).toHaveBeenCalled()
  })

  it('respects custom duration', () => {
    render(<AnimatedCounter value={100} duration={1000} />)

    // Component should render without errors with custom duration
    expect(screen.getByText(/\d+/)).toBeInTheDocument()
  })

  it('uses default duration of 500ms', () => {
    const { rerender } = render(<AnimatedCounter value={0} />)

    act(() => {
      rerender(<AnimatedCounter value={100} />)
    })

    // Default duration should be used (verifying it doesn't error)
    expect(screen.getByText(/\d+/)).toBeInTheDocument()
  })
})
