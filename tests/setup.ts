import '@testing-library/jest-dom';

// Mock Next.js router
jest.mock('next/navigation', () => ({
  useRouter: () => ({
    push: jest.fn(),
    replace: jest.fn(),
    prefetch: jest.fn(),
    back: jest.fn(),
  }),
  usePathname: () => '/',
  useSearchParams: () => new URLSearchParams(),
}));

// Mock Framer Motion to avoid animation issues in tests
jest.mock('framer-motion', () => ({
  motion: {
    div: ({ children, ...props }: any) => {
      const React = require('react');
      return React.createElement('div', props, children);
    },
    span: ({ children, ...props }: any) => {
      const React = require('react');
      return React.createElement('span', props, children);
    },
    button: ({ children, ...props }: any) => {
      const React = require('react');
      return React.createElement('button', props, children);
    },
  },
  AnimatePresence: ({ children }: any) => children,
}));

// Mock IntersectionObserver
(global as any).IntersectionObserver = class {
  constructor() {}
  observe() {}
  disconnect() {}
  unobserve() {}
};

// Mock ResizeObserver
(global as any).ResizeObserver = class {
  constructor() {}
  observe() {}
  disconnect() {}
  unobserve() {}
};

// Mock File and FileReader for upload tests
(global as any).File = class {
  constructor(
    public bits: any[],
    public name: string,
    public options?: any
  ) {}
  
  get size() {
    return 1024; // Mock size
  }
  
  get type() {
    return this.options?.type || '';
  }
};

(global as any).FileReader = class {
  result: any = null;
  error: any = null;
  readyState: number = 0;
  onload: any = null;
  onerror: any = null;
  
  readAsText() {
    setTimeout(() => {
      this.result = 'mock file content';
      this.readyState = 2;
      if (this.onload) this.onload({});
    }, 0);
  }
  
  readAsDataURL() {
    setTimeout(() => {
      this.result = 'data:text/plain;base64,bW9jayBmaWxlIGNvbnRlbnQ=';
      this.readyState = 2;
      if (this.onload) this.onload({});
    }, 0);
  }
};
