import '@testing-library/jest-dom'

// Mock Next.js router
jest.mock('next/navigation', () => ({
  useRouter() {
    return {
      push: jest.fn(),
      replace: jest.fn(),
      prefetch: jest.fn(),
      back: jest.fn(),
      forward: jest.fn(),
      refresh: jest.fn(),
    }
  },
  useSearchParams() {
    return new URLSearchParams()
  },
  usePathname() {
    return '/'
  },
}))

// Mock Next.js image
jest.mock('next/image', () => ({
  __esModule: true,
  default: (props) => {
    // eslint-disable-next-line @next/next/no-img-element
    return <img {...props} />
  },
}))

// Mock environment variables
process.env.NODE_ENV = 'test'
process.env.NEXTAUTH_URL = 'http://localhost:3001'
process.env.NEXTAUTH_SECRET = 'test-secret-key-for-testing-purposes-only-must-be-32-chars-long'
process.env.GOOGLE_CLIENT_ID = 'test-google-client-id'
process.env.GOOGLE_CLIENT_SECRET = 'test-google-client-secret'
process.env.DATABASE_URL = 'file://./test.db'
process.env.DIRECT_URL = 'file://./test.db'
process.env.GITHUB_ID = 'test-github-id'
process.env.GITHUB_SECRET = 'test-github-secret'
process.env.OPENAI_API_KEY = 'test-openai-key'
process.env.AI_MODEL = 'gpt-3.5-turbo'
process.env.NEXT_PUBLIC_SUPABASE_URL = 'https://test.supabase.co'
process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY = 'test-supabase-anon-key'

// Mock console methods to reduce noise in tests
global.console = {
  ...console,
  // Uncomment to ignore a specific log level
  // log: jest.fn(),
  // debug: jest.fn(),
  // info: jest.fn(),
  // warn: jest.fn(),
  // error: jest.fn(),
}

// Mock fetch
global.fetch = jest.fn()

// Mock IntersectionObserver
global.IntersectionObserver = class IntersectionObserver {
  constructor() {}
  disconnect() {}
  observe() {}
  unobserve() {}
}

// Mock ResizeObserver
global.ResizeObserver = class ResizeObserver {
  constructor() {}
  disconnect() {}
  observe() {}
  unobserve() {}
}

// Mock matchMedia
Object.defineProperty(window, 'matchMedia', {
  writable: true,
  value: jest.fn().mockImplementation(query => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: jest.fn(), // deprecated
    removeListener: jest.fn(), // deprecated
    addEventListener: jest.fn(),
    removeEventListener: jest.fn(),
    dispatchEvent: jest.fn(),
  })),
})

// Mock localStorage
const localStorageMock = {
  getItem: jest.fn(),
  setItem: jest.fn(),
  removeItem: jest.fn(),
  clear: jest.fn(),
}
global.localStorage = localStorageMock

// Mock sessionStorage
const sessionStorageMock = {
  getItem: jest.fn(),
  setItem: jest.fn(),
  removeItem: jest.fn(),
  clear: jest.fn(),
}
global.sessionStorage = sessionStorageMock

// Mock NextRequest for middleware tests
jest.mock('next/server', () => ({
  NextRequest: jest.fn().mockImplementation((url, options = {}) => ({
    url,
    method: options.method || 'GET',
    headers: {
      get: jest.fn((name) => {
        const headers = options.headers || {}
        return headers[name?.toLowerCase()] || null
      }),
      has: jest.fn((name) => {
        const headers = options.headers || {}
        return name?.toLowerCase() in headers
      }),
      set: jest.fn(),
      delete: jest.fn(),
    },
    nextUrl: {
      pathname: new URL(url).pathname,
      searchParams: new URLSearchParams(new URL(url).search),
    },
    body: options.body,
    json: jest.fn().mockResolvedValue(options.body ? JSON.parse(options.body) : {}),
    text: jest.fn().mockResolvedValue(options.body || ''),
  })),
  NextResponse: {
    json: jest.fn((data, options = {}) => {
      const response = {
        status: options.status || 200,
        body: JSON.stringify(data),
        headers: {
          get: jest.fn((name) => {
            const headers = options.headers || { 'content-type': 'application/json' }
            return headers[name?.toLowerCase()] || null
          }),
          set: jest.fn(),
          has: jest.fn(),
        },
        json: jest.fn().mockResolvedValue(data),
        text: jest.fn().mockResolvedValue(JSON.stringify(data)),
      }
      return response
    }),
    next: jest.fn(() => ({
      status: 200,
      headers: {
        get: jest.fn(),
        set: jest.fn(),
        has: jest.fn(),
      },
      json: jest.fn().mockResolvedValue({}),
    })),
    redirect: jest.fn((url, status = 302) => ({
      status,
      headers: {
        get: jest.fn((name) => name === 'location' ? url : null),
        set: jest.fn(),
        has: jest.fn(),
      },
      json: jest.fn().mockResolvedValue({}),
    })),
  },
}))

global.Response = class Response {
  constructor(body, options = {}) {
    this.body = body
    this.status = options.status || 200
    this.statusText = options.statusText || 'OK'
    this.headers = new Map()
    
    if (options.headers) {
      Object.entries(options.headers).forEach(([key, value]) => {
        this.headers.set(key.toLowerCase(), value)
      })
    }
  }
  
  async json() {
    if (typeof this.body === 'string') {
      try {
        return JSON.parse(this.body)
      } catch {
        return {}
      }
    }
    return this.body || {}
  }
  
  async text() {
    return typeof this.body === 'string' ? this.body : JSON.stringify(this.body || {})
  }
  
  static json(data, options = {}) {
    return new Response(JSON.stringify(data), {
      ...options,
      headers: {
        'content-type': 'application/json',
        ...options.headers,
      },
    })
  }
  
  static redirect(url, status = 302) {
    return new Response(null, {
      status,
      headers: { location: url },
    })
  }
}

global.Headers = class Headers {
  constructor(init = {}) {
    this.map = new Map()
    if (init) {
      Object.entries(init).forEach(([key, value]) => {
        this.map.set(key.toLowerCase(), value)
      })
    }
  }
  
  get(name) {
    return this.map.get(name?.toLowerCase())
  }
  
  set(name, value) {
    this.map.set(name?.toLowerCase(), value)
  }
  
  has(name) {
    return this.map.has(name?.toLowerCase())
  }
  
  delete(name) {
    this.map.delete(name?.toLowerCase())
  }
}
