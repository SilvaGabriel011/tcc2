/**
 * Image Optimization Utilities for AgroInsight
 * 
 * Provides utilities for optimizing images in the application:
 * - Responsive image loading
 * - Lazy loading helpers
 * - Image format detection
 * - Blur placeholder generation
 * - Image dimension calculation
 * 
 * Features:
 * - Automatic format selection (AVIF, WebP, JPEG)
 * - Responsive image sizes
 * - Lazy loading with intersection observer
 * - Blur-up placeholder technique
 * - Image preloading for critical images
 * 
 * Benefits:
 * - Faster page loads
 * - Reduced bandwidth usage
 * - Better Core Web Vitals scores
 * - Improved user experience
 */

/**
 * Image quality presets
 */
export const IMAGE_QUALITY = {
  LOW: 50,
  MEDIUM: 75,
  HIGH: 90,
  MAX: 100,
} as const

/**
 * Image size presets for common use cases
 */
export const IMAGE_SIZES = {
  THUMBNAIL: { width: 128, height: 128 },
  SMALL: { width: 256, height: 256 },
  MEDIUM: { width: 512, height: 512 },
  LARGE: { width: 1024, height: 1024 },
  XLARGE: { width: 1920, height: 1080 },
  FULL: { width: 3840, height: 2160 },
} as const

/**
 * Responsive image breakpoints
 */
export const BREAKPOINTS = {
  mobile: 640,
  tablet: 768,
  laptop: 1024,
  desktop: 1280,
  wide: 1920,
} as const

/**
 * Generate srcset for responsive images
 */
export function generateSrcSet(
  baseUrl: string,
  widths: number[] = [640, 750, 828, 1080, 1200, 1920]
): string {
  return widths
    .map(width => `${baseUrl}?w=${width} ${width}w`)
    .join(', ')
}

/**
 * Generate sizes attribute for responsive images
 */
export function generateSizes(
  breakpoints: Record<string, number> = BREAKPOINTS
): string {
  const entries = Object.entries(breakpoints)
  const sizeStrings = entries.map(([, width], index) => {
    if (index === entries.length - 1) {
      return `${width}px`
    }
    return `(max-width: ${width}px) ${width}px`
  })
  return sizeStrings.join(', ')
}

/**
 * Get optimal image format based on browser support
 */
export function getOptimalImageFormat(): 'avif' | 'webp' | 'jpeg' {
  if (typeof window === 'undefined') {
    return 'webp'
  }

  const canvas = document.createElement('canvas')
  canvas.width = 1
  canvas.height = 1

  if (canvas.toDataURL('image/avif').indexOf('data:image/avif') === 0) {
    return 'avif'
  }

  if (canvas.toDataURL('image/webp').indexOf('data:image/webp') === 0) {
    return 'webp'
  }

  return 'jpeg'
}

/**
 * Generate blur placeholder data URL
 */
export function generateBlurDataURL(
  width: number = 10,
  height: number = 10,
  color: string = '#e5e7eb'
): string {
  if (typeof window === 'undefined') {
    return `data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='${width}' height='${height}'%3E%3Crect width='${width}' height='${height}' fill='${color}'/%3E%3C/svg%3E`
  }

  const canvas = document.createElement('canvas')
  canvas.width = width
  canvas.height = height
  const ctx = canvas.getContext('2d')
  
  if (ctx) {
    ctx.fillStyle = color
    ctx.fillRect(0, 0, width, height)
  }
  
  return canvas.toDataURL()
}

/**
 * Calculate aspect ratio
 */
export function calculateAspectRatio(width: number, height: number): number {
  return width / height
}

/**
 * Calculate dimensions maintaining aspect ratio
 */
export function calculateDimensions(
  originalWidth: number,
  originalHeight: number,
  targetWidth?: number,
  targetHeight?: number
): { width: number; height: number } {
  const aspectRatio = calculateAspectRatio(originalWidth, originalHeight)

  if (targetWidth && !targetHeight) {
    return {
      width: targetWidth,
      height: Math.round(targetWidth / aspectRatio)
    }
  }

  if (targetHeight && !targetWidth) {
    return {
      width: Math.round(targetHeight * aspectRatio),
      height: targetHeight
    }
  }

  if (targetWidth && targetHeight) {
    return { width: targetWidth, height: targetHeight }
  }

  return { width: originalWidth, height: originalHeight }
}

/**
 * Lazy load image with intersection observer
 */
export function lazyLoadImage(
  img: HTMLImageElement,
  options: IntersectionObserverInit = {}
): () => void {
  if (typeof window === 'undefined' || !('IntersectionObserver' in window)) {
    img.src = img.dataset.src || ''
    return () => {}
  }

  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        const target = entry.target as HTMLImageElement
        const src = target.dataset.src
        const srcset = target.dataset.srcset

        if (src) {
          target.src = src
        }
        if (srcset) {
          target.srcset = srcset
        }

        target.classList.remove('lazy')
        observer.unobserve(target)
      }
    })
  }, {
    rootMargin: '50px',
    threshold: 0.01,
    ...options
  })

  observer.observe(img)

  return () => observer.disconnect()
}

/**
 * Preload critical images
 */
export function preloadImage(src: string, priority: 'high' | 'low' = 'high'): void {
  if (typeof window === 'undefined') return

  const link = document.createElement('link')
  link.rel = 'preload'
  link.as = 'image'
  link.href = src
  link.setAttribute('fetchpriority', priority)
  document.head.appendChild(link)
}

/**
 * Preload multiple images
 */
export function preloadImages(srcs: string[], priority: 'high' | 'low' = 'high'): void {
  srcs.forEach(src => preloadImage(src, priority))
}

/**
 * Get image loader URL for Next.js Image component
 */
export function imageLoader({
  src,
  width,
  quality = 75,
}: {
  src: string
  width: number
  quality?: number
}): string {
  if (src.startsWith('http://') || src.startsWith('https://')) {
    return `${src}?w=${width}&q=${quality}`
  }
  return src
}

/**
 * Image optimization configuration for Next.js Image component
 */
export const IMAGE_CONFIG = {
  loader: imageLoader,
  deviceSizes: [640, 750, 828, 1080, 1200, 1920, 2048, 3840],
  imageSizes: [16, 32, 48, 64, 96, 128, 256, 384],
  formats: ['image/avif', 'image/webp'] as const,
  minimumCacheTTL: 86400,
  dangerouslyAllowSVG: true,
}

/**
 * Get responsive image props for Next.js Image component
 */
export function getResponsiveImageProps(
  src: string,
  alt: string,
  options: {
    priority?: boolean
    quality?: number
    fill?: boolean
    sizes?: string
    width?: number
    height?: number
  } = {}
) {
  return {
    src,
    alt,
    quality: options.quality || IMAGE_QUALITY.HIGH,
    priority: options.priority || false,
    fill: options.fill || false,
    sizes: options.sizes || generateSizes(),
    width: options.width,
    height: options.height,
    placeholder: 'blur' as const,
    blurDataURL: generateBlurDataURL(),
  }
}

/**
 * Optimize image URL with query parameters
 */
export function optimizeImageUrl(
  url: string,
  options: {
    width?: number
    height?: number
    quality?: number
    format?: 'avif' | 'webp' | 'jpeg' | 'png'
  } = {}
): string {
  const params = new URLSearchParams()

  if (options.width) params.set('w', options.width.toString())
  if (options.height) params.set('h', options.height.toString())
  if (options.quality) params.set('q', options.quality.toString())
  if (options.format) params.set('fm', options.format)

  const queryString = params.toString()
  return queryString ? `${url}?${queryString}` : url
}

/**
 * Check if image is in viewport
 */
export function isImageInViewport(img: HTMLImageElement): boolean {
  if (typeof window === 'undefined') return false

  const rect = img.getBoundingClientRect()
  return (
    rect.top >= 0 &&
    rect.left >= 0 &&
    rect.bottom <= (window.innerHeight || document.documentElement.clientHeight) &&
    rect.right <= (window.innerWidth || document.documentElement.clientWidth)
  )
}

/**
 * Decode image before rendering to prevent layout shift
 */
export async function decodeImage(img: HTMLImageElement): Promise<void> {
  if ('decode' in img) {
    try {
      await img.decode()
    } catch (error) {
      console.warn('Image decode failed:', error)
    }
  }
}

/**
 * Load image with promise
 */
export function loadImage(src: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image()
    img.onload = () => resolve(img)
    img.onerror = reject
    img.src = src
  })
}

/**
 * Batch load images
 */
export async function loadImages(srcs: string[]): Promise<HTMLImageElement[]> {
  return Promise.all(srcs.map(src => loadImage(src)))
}

/**
 * Get image dimensions from URL
 */
export async function getImageDimensions(src: string): Promise<{ width: number; height: number }> {
  const img = await loadImage(src)
  return {
    width: img.naturalWidth,
    height: img.naturalHeight
  }
}

/**
 * Create responsive image set
 */
export function createResponsiveImageSet(
  baseUrl: string,
  sizes: number[] = [640, 750, 828, 1080, 1200, 1920]
): Array<{ url: string; width: number }> {
  return sizes.map(width => ({
    url: optimizeImageUrl(baseUrl, { width }),
    width
  }))
}

/**
 * Image loading priority helper
 */
export function getImagePriority(position: 'above-fold' | 'below-fold'): boolean {
  return position === 'above-fold'
}

/**
 * Generate image placeholder with dominant color
 */
export function generateColorPlaceholder(color: string): string {
  return `data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 1 1'%3E%3Crect fill='${encodeURIComponent(color)}' width='1' height='1'/%3E%3C/svg%3E`
}

/**
 * Image cache helper
 */
export class ImageCache {
  private cache: Map<string, HTMLImageElement> = new Map()

  async get(src: string): Promise<HTMLImageElement> {
    if (this.cache.has(src)) {
      return this.cache.get(src)!
    }

    const img = await loadImage(src)
    this.cache.set(src, img)
    return img
  }

  has(src: string): boolean {
    return this.cache.has(src)
  }

  clear(): void {
    this.cache.clear()
  }

  delete(src: string): boolean {
    return this.cache.delete(src)
  }

  get size(): number {
    return this.cache.size
  }
}

export const imageCache = new ImageCache()
