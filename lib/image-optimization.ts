/**
 * Image Optimization Utilities
 * 
 * Provides comprehensive image optimization features:
 * - Automatic format conversion (WebP, AVIF)
 * - Responsive image sizing
 * - Lazy loading configuration
 * - Image compression
 * - CDN integration helpers
 * - Blur placeholder generation
 */

import type { ImageProps } from 'next/image'

export interface ImageConfig {
  src: string
  alt: string
  width?: number
  height?: number
  quality?: number | `${number}`
  priority?: boolean
  loading?: 'lazy' | 'eager'
  placeholder?: ImageProps['placeholder']
  blurDataURL?: string
}

export interface ResponsiveImageSizes {
  mobile: number
  tablet: number
  desktop: number
  wide: number
}

export const DEFAULT_IMAGE_QUALITY = 85
export const DEFAULT_BLUR_QUALITY = 10

/**
 * Standard responsive image sizes for the application
 */
export const RESPONSIVE_SIZES: ResponsiveImageSizes = {
  mobile: 640,
  tablet: 768,
  desktop: 1024,
  wide: 1920
}

/**
 * Generate responsive image sizes string for Next.js Image
 */
export function generateResponsiveSizes(
  customSizes?: Partial<ResponsiveImageSizes>
): string {
  const sizes = { ...RESPONSIVE_SIZES, ...customSizes }
  
  return [
    `(max-width: 640px) ${sizes.mobile}px`,
    `(max-width: 768px) ${sizes.tablet}px`,
    `(max-width: 1024px) ${sizes.desktop}px`,
    `${sizes.wide}px`
  ].join(', ')
}

/**
 * Get optimized image configuration
 */
export function getOptimizedImageConfig(
  src: string,
  alt: string,
  options: Partial<ImageConfig> = {}
): ImageConfig {
  return {
    src,
    alt,
    width: options.width,
    height: options.height,
    quality: (options.quality ?? DEFAULT_IMAGE_QUALITY) as number | `${number}`,
    priority: options.priority ?? false,
    loading: options.loading ?? 'lazy',
    placeholder: options.placeholder ?? 'blur',
    blurDataURL: options.blurDataURL
  }
}

/**
 * Generate blur placeholder data URL
 */
export function generateBlurDataURL(
  width: number = 10,
  height: number = 10,
  color: string = '#e5e7eb'
): string {
  const svg = `
    <svg width="${width}" height="${height}" xmlns="http://www.w3.org/2000/svg">
      <rect width="${width}" height="${height}" fill="${color}"/>
    </svg>
  `
  
  return `data:image/svg+xml;utf8,${encodeURIComponent(svg)}`
}

/**
 * Image loader configuration for external CDN
 */
export function customImageLoader({
  src,
  width,
  quality
}: {
  src: string
  width: number
  quality?: number
}): string {
  const params = new URLSearchParams()
  params.set('url', src)
  params.set('w', width.toString())
  if (quality) {
    params.set('q', quality.toString())
  }
  
  return `/api/image-proxy?${params.toString()}`
}

/**
 * Check if image should be prioritized (above the fold)
 */
export function shouldPrioritizeImage(index: number, viewport: 'mobile' | 'desktop'): boolean {
  const priorityCount = viewport === 'mobile' ? 2 : 4
  return index < priorityCount
}

/**
 * Get image dimensions while maintaining aspect ratio
 */
export function calculateAspectRatioDimensions(
  originalWidth: number,
  originalHeight: number,
  targetWidth?: number,
  targetHeight?: number
): { width: number; height: number } {
  if (targetWidth && targetHeight) {
    return { width: targetWidth, height: targetHeight }
  }
  
  const aspectRatio = originalWidth / originalHeight
  
  if (targetWidth) {
    return {
      width: targetWidth,
      height: Math.round(targetWidth / aspectRatio)
    }
  }
  
  if (targetHeight) {
    return {
      width: Math.round(targetHeight * aspectRatio),
      height: targetHeight
    }
  }
  
  return { width: originalWidth, height: originalHeight }
}

/**
 * Preload critical images
 */
export function preloadImage(src: string, as: 'image' = 'image'): void {
  if (typeof window === 'undefined') return
  
  const link = document.createElement('link')
  link.rel = 'preload'
  link.as = as
  link.href = src
  document.head.appendChild(link)
}

/**
 * Lazy load images with Intersection Observer
 */
export function setupLazyLoading(
  selector: string = 'img[loading="lazy"]',
  options: IntersectionObserverInit = {}
): void {
  if (typeof window === 'undefined' || !('IntersectionObserver' in window)) {
    return
  }
  
  const defaultOptions: IntersectionObserverInit = {
    root: null,
    rootMargin: '50px',
    threshold: 0.01,
    ...options
  }
  
  const imageObserver = new IntersectionObserver((entries, observer) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        const img = entry.target as HTMLImageElement
        
        if (img.dataset.src) {
          img.src = img.dataset.src
        }
        
        if (img.dataset.srcset) {
          img.srcset = img.dataset.srcset
        }
        
        img.classList.remove('lazy')
        observer.unobserve(img)
      }
    })
  }, defaultOptions)
  
  const images = document.querySelectorAll(selector)
  images.forEach(img => imageObserver.observe(img))
}

/**
 * Image format support detection
 */
export function detectImageFormatSupport(): {
  webp: boolean
  avif: boolean
} {
  if (typeof window === 'undefined') {
    return { webp: false, avif: false }
  }
  
  const canvas = document.createElement('canvas')
  canvas.width = 1
  canvas.height = 1
  
  const webp = canvas.toDataURL('image/webp').indexOf('data:image/webp') === 0
  
  let avif = false
  try {
    avif = canvas.toDataURL('image/avif').indexOf('data:image/avif') === 0
  } catch {
    avif = false
  }
  
  return { webp, avif }
}

/**
 * Get optimal image format based on browser support
 */
export function getOptimalImageFormat(
  originalFormat: string,
  supportedFormats: { webp: boolean; avif: boolean }
): string {
  if (supportedFormats.avif) {
    return 'avif'
  }
  
  if (supportedFormats.webp) {
    return 'webp'
  }
  
  return originalFormat
}

/**
 * Image compression quality based on image type
 */
export function getCompressionQuality(imageType: 'photo' | 'graphic' | 'icon'): number {
  switch (imageType) {
    case 'photo':
      return 85
    case 'graphic':
      return 90
    case 'icon':
      return 95
    default:
      return DEFAULT_IMAGE_QUALITY
  }
}

/**
 * Generate srcset for responsive images
 */
export function generateSrcSet(
  baseSrc: string,
  widths: number[] = [640, 750, 828, 1080, 1200, 1920, 2048, 3840]
): string {
  return widths
    .map(width => {
      const url = new URL(baseSrc, 'http://localhost')
      url.searchParams.set('w', width.toString())
      return `${url.pathname}${url.search} ${width}w`
    })
    .join(', ')
}

/**
 * Image optimization configuration for Next.js
 */
export const nextImageConfig = {
  domains: [],
  deviceSizes: [640, 750, 828, 1080, 1200, 1920, 2048, 3840],
  imageSizes: [16, 32, 48, 64, 96, 128, 256, 384],
  formats: ['image/avif', 'image/webp'] as const,
  minimumCacheTTL: 60 * 60 * 24 * 30,
  dangerouslyAllowSVG: false,
  contentSecurityPolicy: "default-src 'self'; script-src 'none'; sandbox;"
}

/**
 * Prefetch images for next page
 */
export function prefetchImages(urls: string[]): void {
  if (typeof window === 'undefined') return
  
  urls.forEach(url => {
    const link = document.createElement('link')
    link.rel = 'prefetch'
    link.as = 'image'
    link.href = url
    document.head.appendChild(link)
  })
}

/**
 * Image loading performance monitoring
 */
export function monitorImageLoading(): void {
  if (typeof window === 'undefined' || !('PerformanceObserver' in window)) {
    return
  }
  
  const observer = new PerformanceObserver((list) => {
    list.getEntries().forEach((entry) => {
      if (entry.entryType === 'resource' && entry.name.match(/\.(jpg|jpeg|png|gif|webp|avif|svg)$/i)) {
        console.log(`📸 Image loaded: ${entry.name}`, {
          duration: entry.duration,
          size: (entry as PerformanceResourceTiming).transferSize
        })
      }
    })
  })
  
  observer.observe({ entryTypes: ['resource'] })
}
