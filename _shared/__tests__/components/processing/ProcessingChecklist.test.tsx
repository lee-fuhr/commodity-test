/**
 * Tests for ProcessingChecklist component
 */

import React from 'react'
import { render, screen } from '@testing-library/react'
import { ProcessingChecklist } from '../../../components/processing/ProcessingChecklist'

const mockItems = [
  { label: 'Crawling your website', progressThreshold: 0 },
  { label: 'Analyzing content', progressThreshold: 40 },
  { label: 'Running AI assessment', progressThreshold: 70 },
]

describe('ProcessingChecklist', () => {
  it('renders default title', () => {
    render(<ProcessingChecklist items={mockItems} progress={0} />)
    expect(screen.getByText("WHAT WE'RE DOING")).toBeInTheDocument()
  })

  it('renders custom title', () => {
    render(
      <ProcessingChecklist
        items={mockItems}
        progress={0}
        title="CURRENT TASKS"
      />
    )
    expect(screen.getByText('CURRENT TASKS')).toBeInTheDocument()
  })

  it('renders all checklist items', () => {
    render(<ProcessingChecklist items={mockItems} progress={0} />)

    expect(screen.getByText('Crawling your website')).toBeInTheDocument()
    expect(screen.getByText('Analyzing content')).toBeInTheDocument()
    expect(screen.getByText('Running AI assessment')).toBeInTheDocument()
  })

  it('shows checkmark for completed items (progress > threshold)', () => {
    const { container } = render(
      <ProcessingChecklist items={mockItems} progress={50} />
    )

    // First item (threshold 0) and second item (threshold 40) should be complete
    const listItems = container.querySelectorAll('li')
    expect(listItems[0].textContent).toContain('✓')
    expect(listItems[1].textContent).toContain('✓')
    expect(listItems[2].textContent).toContain('○') // Not complete yet
  })

  it('shows circle for incomplete items (progress <= threshold)', () => {
    const { container } = render(
      <ProcessingChecklist items={mockItems} progress={25} />
    )

    const listItems = container.querySelectorAll('li')
    expect(listItems[0].textContent).toContain('✓') // threshold 0, complete
    expect(listItems[1].textContent).toContain('○') // threshold 40, incomplete
    expect(listItems[2].textContent).toContain('○') // threshold 70, incomplete
  })

  it('marks all items complete at 100% progress', () => {
    const { container } = render(
      <ProcessingChecklist items={mockItems} progress={100} />
    )

    const listItems = container.querySelectorAll('li')
    listItems.forEach((item) => {
      expect(item.textContent).toContain('✓')
    })
  })

  it('renders optional subtitle', () => {
    render(
      <ProcessingChecklist
        items={mockItems}
        progress={50}
        subtitle="This may take 1-2 minutes"
      />
    )

    expect(screen.getByText('This may take 1-2 minutes')).toBeInTheDocument()
  })

  it('does not render subtitle when not provided', () => {
    const { container } = render(
      <ProcessingChecklist items={mockItems} progress={50} />
    )

    // Should not have border-t class that appears with subtitle
    const subtitleElement = container.querySelector('.border-t')
    expect(subtitleElement).not.toBeInTheDocument()
  })

  it('handles empty items array', () => {
    render(<ProcessingChecklist items={[]} progress={50} />)
    expect(screen.getByText("WHAT WE'RE DOING")).toBeInTheDocument()
  })

  it('handles progress at exact threshold (should be incomplete)', () => {
    const { container } = render(
      <ProcessingChecklist items={mockItems} progress={40} />
    )

    const listItems = container.querySelectorAll('li')
    expect(listItems[1].textContent).toContain('○') // At threshold = incomplete
  })

  it('handles progress just above threshold (should be complete)', () => {
    const { container } = render(
      <ProcessingChecklist items={mockItems} progress={41} />
    )

    const listItems = container.querySelectorAll('li')
    expect(listItems[1].textContent).toContain('✓') // Above threshold = complete
  })
})
