/**
 * Test setup and global mocks for shared component tests
 */

import '@testing-library/jest-dom'

// Mock next/navigation
jest.mock('next/navigation', () => ({
  useRouter: () => ({
    push: jest.fn(),
    replace: jest.fn(),
    back: jest.fn(),
    forward: jest.fn(),
    refresh: jest.fn(),
    prefetch: jest.fn(),
  }),
  useParams: () => ({ id: 'test-id' }),
  useSearchParams: () => ({
    get: jest.fn(),
    getAll: jest.fn(),
    has: jest.fn(),
    entries: jest.fn(),
    keys: jest.fn(),
    values: jest.fn(),
  }),
  usePathname: () => '/test-path',
}))

// Mock fetch for API calls
global.fetch = jest.fn()

// Mock window.scrollTo for layout tests
global.scrollTo = jest.fn()

// Mock requestAnimationFrame for animation tests
global.requestAnimationFrame = jest.fn((cb) => {
  cb(Date.now())
  return 0
})

// Mock Date.now for consistent timing in animation tests
const mockDateNow = jest.spyOn(Date, 'now')
mockDateNow.mockReturnValue(1000)
