/**
 * Tests for text formatting utility functions
 */

import {
  formatHostname,
  formatCompanyName,
  padNumber,
  truncateText,
  formatDate,
  capitalize,
} from '../../utils/formatting'

describe('formatHostname', () => {
  it('extracts hostname from full URL', () => {
    expect(formatHostname('https://example.com/path')).toBe('example.com')
    expect(formatHostname('http://subdomain.example.com/path?query=1')).toBe(
      'subdomain.example.com'
    )
  })

  it('removes www. prefix', () => {
    expect(formatHostname('https://www.example.com')).toBe('example.com')
    expect(formatHostname('www.example.com')).toBe('example.com')
  })

  it('handles invalid URLs gracefully', () => {
    expect(formatHostname('not-a-url')).toBe('not-a-url')
    expect(formatHostname('www.just-hostname.com')).toBe('just-hostname.com')
  })

  it('handles edge cases', () => {
    expect(formatHostname('')).toBe('')
    expect(formatHostname('example.com')).toBe('example.com')
  })
})

describe('formatCompanyName', () => {
  it('returns site title when available', () => {
    const siteSnapshot = { title: 'Acme Corporation' }
    expect(formatCompanyName(siteSnapshot, 'acme.com')).toBe('Acme Corporation')
  })

  it('derives name from hostname when no title', () => {
    expect(formatCompanyName(undefined, 'acme.com')).toBe('acme')
    expect(formatCompanyName({}, 'my-company.co.uk')).toBe('my-company')
  })

  it('derives name from hostname with www', () => {
    expect(formatCompanyName(undefined, 'www.acme.com')).toBe('acme')
  })

  it('handles full URLs', () => {
    expect(formatCompanyName(undefined, 'https://acme.com/path')).toBe('acme')
  })
})

describe('padNumber', () => {
  it('pads single digit to two digits by default', () => {
    expect(padNumber(1)).toBe('01')
    expect(padNumber(5)).toBe('05')
    expect(padNumber(9)).toBe('09')
  })

  it('leaves two-digit numbers unchanged', () => {
    expect(padNumber(10)).toBe('10')
    expect(padNumber(42)).toBe('42')
    expect(padNumber(99)).toBe('99')
  })

  it('supports custom digit lengths', () => {
    expect(padNumber(1, 3)).toBe('001')
    expect(padNumber(42, 4)).toBe('0042')
    expect(padNumber(5, 5)).toBe('00005')
  })

  it('handles zero correctly', () => {
    expect(padNumber(0)).toBe('00')
    expect(padNumber(0, 3)).toBe('000')
  })

  it('handles large numbers correctly', () => {
    expect(padNumber(100)).toBe('100')
    expect(padNumber(1000, 3)).toBe('1000')
  })
})

describe('truncateText', () => {
  it('returns text unchanged if shorter than max length', () => {
    expect(truncateText('Short text', 20)).toBe('Short text')
    expect(truncateText('Hello', 10)).toBe('Hello')
  })

  it('truncates text exceeding max length with ellipsis', () => {
    expect(truncateText('This is a long text that needs truncating', 20)).toBe(
      'This is a long te...'
    )
  })

  it('accounts for ellipsis in length calculation', () => {
    const result = truncateText('12345678901234567890', 10)
    expect(result).toBe('1234567...')
    expect(result.length).toBe(10)
  })

  it('handles edge case of max length equal to text length', () => {
    expect(truncateText('12345', 5)).toBe('12345')
  })

  it('handles empty string', () => {
    expect(truncateText('', 10)).toBe('')
  })
})

describe('formatDate', () => {
  it('formats Date object correctly', () => {
    const date = new Date('2024-01-15')
    expect(formatDate(date)).toMatch(/January 15, 2024/)
  })

  it('formats timestamp correctly', () => {
    const timestamp = new Date('2024-03-20').getTime()
    expect(formatDate(timestamp)).toMatch(/March 20, 2024/)
  })

  it('formats ISO string correctly', () => {
    expect(formatDate('2024-12-25')).toMatch(/December 25, 2024/)
  })
})

describe('capitalize', () => {
  it('capitalizes first letter of string', () => {
    expect(capitalize('hello')).toBe('Hello')
    expect(capitalize('world')).toBe('World')
  })

  it('leaves already capitalized strings unchanged', () => {
    expect(capitalize('Hello')).toBe('Hello')
  })

  it('only capitalizes first letter', () => {
    expect(capitalize('hello world')).toBe('Hello world')
  })

  it('handles empty string', () => {
    expect(capitalize('')).toBe('')
  })

  it('handles single character', () => {
    expect(capitalize('a')).toBe('A')
    expect(capitalize('A')).toBe('A')
  })
})
