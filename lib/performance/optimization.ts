// Performance optimization utilities
import { logger } from '@/lib/logger';

// Debounce function for search inputs and API calls
export function debounce<T extends (...args: any[]) => any>(
  func: T,
  wait: number,
  immediate = false
): (..._args: Parameters<T>) => void {
  let timeout: NodeJS.Timeout | null = null;
  
  return function executedFunction(...args: Parameters<T>) {
    const later = () => {
      timeout = null;
      if (!immediate) func(...args);
    };
    
    const callNow = immediate && !timeout;
    
    if (timeout) clearTimeout(timeout);
    timeout = setTimeout(later, wait);
    
    if (callNow) func(...args);
  };
}

// Throttle function for scroll handlers and resize events
export function throttle<T extends (...args: any[]) => any>(
  func: T,
  limit: number
): (..._args: Parameters<T>) => void {
  let inThrottle: boolean;
  
  return function executedFunction(...args: Parameters<T>) {
    if (!inThrottle) {
      func(...args);
      inThrottle = true;
      setTimeout(() => inThrottle = false, limit);
    }
  };
}

// Intersection Observer for lazy loading
export class LazyLoader {
  private observer: IntersectionObserver | null = null;
  private elements = new Map<Element, () => void>();

  constructor(
    options: IntersectionObserverInit = {
      rootMargin: '50px',
      threshold: 0.1
    }
  ) {
    if (typeof window !== 'undefined' && 'IntersectionObserver' in window) {
      this.observer = new IntersectionObserver((entries: any) => {
        entries.forEach((entry: any) => {
          if (entry.isIntersecting) {
            const callback = this.elements.get(entry.targetDate);
            if (callback) {
              callback();
              this.unobserve(entry.targetDate);
            }
          }
        });
      }, options);
    }
  }

  observe(element: Element, callback: () => void): void {
    if (this.observer) {
      this.elements.set(element, callback);
      this.observer.observe(element);
    } else {
      // Fallback for browsers without IntersectionObserver
      callback();
    }
  }

  unobserve(element: Element): void {
    if (this.observer) {
      this.observer.unobserve(element);
      this.elements.delete(element);
    }
  }

  disconnect(): void {
    if (this.observer) {
      this.observer.disconnect();
      this.elements.clear();
    }
  }
}

// Virtual scrolling for large lists
export class VirtualScroller {
  private container: HTMLElement;
  private items: any[];
  private itemHeight: number;
  private containerHeight: number;
  private renderItem: (_item: any, _index: number) => HTMLElement;
  private buffer: number;

  constructor(
    container: HTMLElement,
    items: any[],
    itemHeight: number,
    renderItem: (_item: any, _index: number) => HTMLElement,
    buffer = 5
  ) {
    this.container = container;
    this.items = items;
    this.itemHeight = itemHeight;
    this.containerHeight = container.clientHeight;
    this.renderItem = renderItem;
    this.buffer = buffer;

    this.setupScrollHandler();
    this.render();
  }

  private setupScrollHandler(): void {
    const handleScroll = throttle(() => {
      this.render();
    }, 16); // ~60fps

    this.container.addEventListener('scroll', handleScroll);
  }

  private render(): void {
    const scrollTop = this.container.scrollTop;
    const startIndex = Math.floor(scrollTop / this.itemHeight);
    const endIndex = Math.min(
      startIndex + Math.ceil(this.containerHeight / this.itemHeight) + this.buffer,
      this.items.length
    );

    const actualStartIndex = Math.max(0, startIndex - this.buffer);

    // Clear existing content
    this.container.innerHTML = '';

    // Create spacer for items above viewport
    if (actualStartIndex > 0) {
      const topSpacer = document.createElement('div');
      topSpacer.style.height = `${actualStartIndex * this.itemHeight}px`;
      this.container.appendChild(topSpacer);
    }

    // Render visible items
    for (let i = actualStartIndex; i < endIndex; i++) {
      if (this.items[i]) {
        const element = this.renderItem(this.items[i], i);
        element.style.height = `${this.itemHeight}px`;
        this.container.appendChild(element);
      }
    }

    // Create spacer for items below viewport
    const remainingItems = this.items.length - endIndex;
    if (remainingItems > 0) {
      const bottomSpacer = document.createElement('div');
      bottomSpacer.style.height = `${remainingItems * this.itemHeight}px`;
      this.container.appendChild(bottomSpacer);
    }
  }

  updateItems(newItems: any[]): void {
    this.items = newItems;
    this.render();
  }

  scrollToIndex(index: number): void {
    this.container.scrollTop = index * this.itemHeight;
  }
}

// Bundle analyzer utility
export const PerformanceMonitor = {
  // Measure component render time
  measureRender<T extends (...args: any[]) => any>(
    componentName: string,
    renderFunction: T
  ): T {
    return ((...args: Parameters<T>) => {
      const startTime = performance.now();
      const result = renderFunction(...args);
      const endTime = performance.now();
      
      logger.info(`Component render time: ${componentName}`, { renderTime: `${(endTime - startTime).toFixed(2)}ms` });
      
      return result;
    }) as T;
  },

  // Measure API call performance
  async measureApiCall<T>(
    apiName: string,
    apiCall: () => Promise<T>
  ): Promise<T> {
    const startTime = performance.now();
    try {
      const result = await apiCall();
      const endTime = performance.now();
      logger.info(`API call completed: ${apiName}`, { duration: `${(endTime - startTime).toFixed(2)}ms` });
      return result;
    } catch (error) {
      const endTime = performance.now();
      logger.warn(`API call failed: ${apiName}`, { 
        duration: `${(endTime - startTime).toFixed(2)}ms`,
        error: (error as Error).message 
      });
      throw error;
    }
  },

  // Monitor memory usage
  monitorMemory(): void {
    if ('memory' in performance) {
      const memory = (performance as any).memory;
      logger.info('Memory usage recorded', {
        used: `${(memory.usedJSHeapSize / 1024 / 1024).toFixed(2)}MB`,
        total: `${(memory.totalJSHeapSize / 1024 / 1024).toFixed(2)}MB`,
        limit: `${(memory.jsHeapSizeLimit / 1024 / 1024).toFixed(2)}MB`
      });
    }
  },

  // Monitor Core Web Vitals
  observeWebVitals(): void {
    if (typeof window !== 'undefined') {
      // First Contentful Paint (FCP)
      new PerformanceObserver((entryList: any) => {
        for (const entry of entryList.getEntries()) {
          if (entry.name === 'first-contentful-paint') {
            logger.info('First Contentful Paint recorded', { fcp: `${entry.createdAt.toFixed(2)}ms` });
          }
        }
      }).observe({ entryTypes: ['paint'] });

      // Largest Contentful Paint (LCP)
      new PerformanceObserver((entryList: any) => {
        const entries = entryList.getEntries();
        const lastEntry = entries[entries.length - 1];
        logger.info('Largest Contentful Paint recorded', { lcp: `${lastEntry.createdAt.toFixed(2)}ms` });
      }).observe({ entryTypes: ['largest-contentful-paint'] });

      // First Input Delay (FID)
      new PerformanceObserver((entryList: any) => {
        for (const entry of entryList.getEntries()) {
          logger.info('First Input Delay recorded', { fid: `${(entry as any).processingStart - entry.createdAt}ms` });
        }
      }).observe({ entryTypes: ['first-input'] });

      // Cumulative Layout Shift (CLS)
      let clsValue = 0;
      new PerformanceObserver((entryList: any) => {
        for (const entry of entryList.getEntries()) {
          if (!(entry as any).hadRecentInput) {
            clsValue += (entry as any).value;
          }
        }
        logger.info('Cumulative Layout Shift recorded', { cls: clsValue });
      }).observe({ entryTypes: ['layout-shift'] });
    }
  }
};

// Image optimization utilities
export const ImageOptimizer = {
  // Preload critical images
  preloadImages(urls: string[]): Promise<PromiseSettledResult<void>[]> {
    const promises = urls.map((url: any) => {
      return new Promise<void>((resolve, reject) => {
        const img = new Image();
        img.onload = () => resolve();
        img.onerror = reject;
        img.src = url;
      });
    });
    
    return Promise.allSettled(promises);
  },

  // Generate responsive image srcSet
  generateSrcSet(baseUrl: string, sizes: number[]): string {
    return sizes
      .map((size: any) => `${baseUrl}?w=${size}&q=75 ${size}w`)
      .join(', ');
  },

  // Lazy load images with intersection observer
  lazyLoadImage(img: HTMLImageElement, src: string): void {
    const observer = new IntersectionObserver((entries: any) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          img.src = src;
          img.classList.remove('lazy');
          observer.unobserve(img);
        }
      });
    });

    observer.observe(img);
  }
};

// Network optimization
export const NetworkOptimizer = {
  // Prefetch critical resources
  prefetchResource(url: string, type: 'script' | 'style' | 'font' | 'image' = 'script'): void {
    if (typeof document === 'undefined') return;

    const link = document.createElement('link');
    link.rel = 'prefetch';
    link.href = url;
    if (type === 'font') {
      link.crossOrigin = 'anonymous';
    }
    document.head.appendChild(link);
  },

  // Preconnect to external domains
  preconnect(domains: string[]): void {
    if (typeof document === 'undefined') return;

    domains.forEach(domain => {
      const link = document.createElement('link');
      link.rel = 'preconnect';
      link.href = domain;
      document.head.appendChild(link);
    });
  },

  // Check network connection quality
  getConnectionInfo(): {
    effectiveType: string;
    downlink: number;
    rtt: number;
    saveData: boolean;
  } | null {
    if ('connection' in navigator) {
      const connection = (navigator as any).connection;
      return {
        effectiveType: connection.effectiveType || 'unknown',
        downlink: connection.downlink || 0,
        rtt: connection.rtt || 0,
        saveData: connection.saveData || false
      };
    }
    return null;
  }
};

// Service Worker registration for caching
export const ServiceWorkerManager = {
  async register(swPath = '/sw.js'): Promise<ServiceWorkerRegistration | null> {
    if ('serviceWorker' in navigator) {
      try {
        const registration = await navigator.serviceWorker.register(swPath);
        logger.info('Service worker registered', { scope: registration.scope });
        return registration;
      } catch (error) {
        logger.error('Service worker registration failed', error as Error);
        return null;
      }
    }
    return null;
  },

  async unregister(): Promise<boolean> {
    if ('serviceWorker' in navigator) {
      const registration = await navigator.serviceWorker.ready;
      return registration.unregister();
    }
    return false;
  }
};