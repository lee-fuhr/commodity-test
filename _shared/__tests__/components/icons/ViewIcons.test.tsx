/**
 * Tests for ViewIcons component
 */

import React from 'react'
import { render } from '@testing-library/react'
import {
  OverviewIcon,
  MessageIcon,
  AudienceIcon,
  TrustIcon,
  CopyIcon,
  viewIcons,
  getViewIcon,
} from '../../../components/icons/ViewIcons'

describe('Individual Icon Components', () => {
  describe('OverviewIcon', () => {
    it('renders svg with correct viewBox', () => {
      const { container } = render(<OverviewIcon />)
      const svg = container.querySelector('svg')
      expect(svg).toHaveAttribute('viewBox', '0 0 24 24')
    })

    it('applies default className', () => {
      const { container } = render(<OverviewIcon />)
      const svg = container.querySelector('svg')
      expect(svg).toHaveClass('w-4', 'h-4')
    })

    it('applies custom className', () => {
      const { container } = render(<OverviewIcon className="w-6 h-6 custom" />)
      const svg = container.querySelector('svg')
      expect(svg).toHaveClass('w-6', 'h-6', 'custom')
    })

    it('renders grid pattern (4 rectangles)', () => {
      const { container } = render(<OverviewIcon />)
      const rectangles = container.querySelectorAll('rect')
      expect(rectangles).toHaveLength(4)
    })
  })

  describe('MessageIcon', () => {
    it('renders svg with correct attributes', () => {
      const { container } = render(<MessageIcon />)
      const svg = container.querySelector('svg')
      expect(svg).toHaveAttribute('viewBox', '0 0 24 24')
      expect(svg).toHaveAttribute('stroke-width', '1')
    })

    it('renders chat bubble path', () => {
      const { container } = render(<MessageIcon />)
      const path = container.querySelector('path')
      expect(path).toBeInTheDocument()
    })

    it('applies custom className', () => {
      const { container } = render(<MessageIcon className="custom-size" />)
      const svg = container.querySelector('svg')
      expect(svg).toHaveClass('custom-size')
    })
  })

  describe('AudienceIcon', () => {
    it('renders target/bullseye pattern (3 circles)', () => {
      const { container } = render(<AudienceIcon />)
      const circles = container.querySelectorAll('circle')
      expect(circles).toHaveLength(3)
    })

    it('has concentric circles with correct radii', () => {
      const { container } = render(<AudienceIcon />)
      const circles = container.querySelectorAll('circle')

      // Should have circles with r=10, r=6, r=2
      expect(circles[0]).toHaveAttribute('r', '10')
      expect(circles[1]).toHaveAttribute('r', '6')
      expect(circles[2]).toHaveAttribute('r', '2')
    })
  })

  describe('TrustIcon', () => {
    it('renders shield with checkmark', () => {
      const { container } = render(<TrustIcon />)
      const paths = container.querySelectorAll('path')
      expect(paths.length).toBeGreaterThanOrEqual(2) // Shield + checkmark
    })

    it('applies stroke properties', () => {
      const { container } = render(<TrustIcon />)
      const svg = container.querySelector('svg')
      expect(svg).toHaveAttribute('stroke', 'currentColor')
      expect(svg).toHaveAttribute('stroke-width', '1')
    })
  })

  describe('CopyIcon', () => {
    it('renders document/clipboard icon', () => {
      const { container } = render(<CopyIcon />)
      const rect = container.querySelector('rect')
      const path = container.querySelector('path')
      expect(rect).toBeInTheDocument()
      expect(path).toBeInTheDocument()
    })
  })
})

describe('viewIcons map', () => {
  it('contains all view types', () => {
    expect(viewIcons).toHaveProperty('overview')
    expect(viewIcons).toHaveProperty('message')
    expect(viewIcons).toHaveProperty('audience')
    expect(viewIcons).toHaveProperty('trust')
    expect(viewIcons).toHaveProperty('copy')
  })

  it('returns React elements for all views', () => {
    Object.entries(viewIcons).forEach(([key, icon]) => {
      expect(React.isValidElement(icon)).toBe(true)
    })
  })
})

describe('getViewIcon function', () => {
  it('returns correct icon for each view type', () => {
    const overviewIcon = getViewIcon('overview')
    const messageIcon = getViewIcon('message')
    const audienceIcon = getViewIcon('audience')
    const trustIcon = getViewIcon('trust')
    const copyIcon = getViewIcon('copy')

    expect(React.isValidElement(overviewIcon)).toBe(true)
    expect(React.isValidElement(messageIcon)).toBe(true)
    expect(React.isValidElement(audienceIcon)).toBe(true)
    expect(React.isValidElement(trustIcon)).toBe(true)
    expect(React.isValidElement(copyIcon)).toBe(true)
  })

  it('applies custom className to icons', () => {
    const { container } = render(
      <>{getViewIcon('overview', 'w-8 h-8')}</>
    )
    const svg = container.querySelector('svg')
    expect(svg).toHaveClass('w-8', 'h-8')
  })

  it('returns null for invalid view type', () => {
    // @ts-expect-error Testing invalid input
    const result = getViewIcon('invalid')
    expect(result).toBeNull()
  })
})

describe('Icon consistency', () => {
  it('all icons use 1px stroke width', () => {
    const icons = [
      <OverviewIcon key="overview" />,
      <MessageIcon key="message" />,
      <AudienceIcon key="audience" />,
      <TrustIcon key="trust" />,
      <CopyIcon key="copy" />,
    ]

    icons.forEach((icon) => {
      const { container } = render(icon)
      const svg = container.querySelector('svg')
      expect(svg).toHaveAttribute('stroke-width', '1')
    })
  })

  it('all icons have no fill (outline style)', () => {
    const icons = [
      <OverviewIcon key="overview" />,
      <MessageIcon key="message" />,
      <AudienceIcon key="audience" />,
      <TrustIcon key="trust" />,
      <CopyIcon key="copy" />,
    ]

    icons.forEach((icon) => {
      const { container } = render(icon)
      const svg = container.querySelector('svg')
      expect(svg).toHaveAttribute('fill', 'none')
    })
  })

  it('all icons use currentColor for stroke', () => {
    const icons = [
      <OverviewIcon key="overview" />,
      <MessageIcon key="message" />,
      <AudienceIcon key="audience" />,
      <TrustIcon key="trust" />,
      <CopyIcon key="copy" />,
    ]

    icons.forEach((icon) => {
      const { container } = render(icon)
      const svg = container.querySelector('svg')
      expect(svg).toHaveAttribute('stroke', 'currentColor')
    })
  })

  it('all icons use round line caps and joins', () => {
    const icons = [
      <OverviewIcon key="overview" />,
      <MessageIcon key="message" />,
      <AudienceIcon key="audience" />,
      <TrustIcon key="trust" />,
      <CopyIcon key="copy" />,
    ]

    icons.forEach((icon) => {
      const { container } = render(icon)
      const svg = container.querySelector('svg')
      expect(svg).toHaveAttribute('stroke-linecap', 'round')
      expect(svg).toHaveAttribute('stroke-linejoin', 'round')
    })
  })

  it('all icons have 24x24 viewBox', () => {
    const icons = [
      <OverviewIcon key="overview" />,
      <MessageIcon key="message" />,
      <AudienceIcon key="audience" />,
      <TrustIcon key="trust" />,
      <CopyIcon key="copy" />,
    ]

    icons.forEach((icon) => {
      const { container } = render(icon)
      const svg = container.querySelector('svg')
      expect(svg).toHaveAttribute('viewBox', '0 0 24 24')
    })
  })
})
