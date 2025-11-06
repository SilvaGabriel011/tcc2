/**
 * Optimized Image Component
 * 
 * A wrapper around Next.js Image component with built-in optimizations:
 * - Automatic responsive sizing
 * - Lazy loading by default
 * - Blur placeholder support
 * - WebP/AVIF format support
 * - Performance monitoring
 */

'use client'

import Image, { ImageProps } from 'next/image'
import { useState, useEffect } from 'react'
import {
  getOptimizedImageConfig,
  generateResponsiveSizes,
  generateBlurDataURL,
  shouldPrioritizeImage
} from '@/lib/image-optimization'

interface OptimizedImageProps extends Omit<ImageProps, 'src' | 'alt'> {
  src: string
  alt: string
  index?: number
  viewport?: 'mobile' | 'desktop'
  aspectRatio?: number
  objectFit?: 'contain' | 'cover' | 'fill' | 'none' | 'scale-down'
  fallbackColor?: string
  onLoadComplete?: () => void
}

export function OptimizedImage({
  src,
  alt,
  index = 0,
  viewport = 'desktop',
  aspectRatio,
  objectFit = 'cover',
  fallbackColor = '#e5e7eb',
  onLoadComplete,
  width,
  height,
  quality,
  priority,
  loading,
  placeholder,
  blurDataURL,
  sizes,
  className,
  ...props
}: OptimizedImageProps) {
  const [isLoaded, setIsLoaded] = useState(false)
  const [hasError, setHasError] = useState(false)

  const shouldPrioritize = priority ?? shouldPrioritizeImage(index, viewport)
  
  const config = getOptimizedImageConfig(src, alt, {
    width: width as number | undefined,
    height: height as number | undefined,
    quality,
    priority: shouldPrioritize,
    loading: loading ?? (shouldPrioritize ? 'eager' : 'lazy'),
    placeholder: placeholder ?? 'blur',
    blurDataURL: blurDataURL ?? generateBlurDataURL(10, 10, fallbackColor)
  })

  const responsiveSizes = sizes ?? generateResponsiveSizes()

  const handleLoad = () => {
    setIsLoaded(true)
    onLoadComplete?.()
  }

  const handleError = () => {
    setHasError(true)
    console.error(`Failed to load image: ${src}`)
  }

  useEffect(() => {
    if (shouldPrioritize && typeof window !== 'undefined') {
      const link = document.createElement('link')
      link.rel = 'preload'
      link.as = 'image'
      link.href = src
      document.head.appendChild(link)
    }
  }, [src, shouldPrioritize])

  if (hasError) {
    return (
      <div
        className={`flex items-center justify-center bg-gray-200 ${className || ''}`}
        style={{
          width: width || '100%',
          height: height || 'auto',
          aspectRatio: aspectRatio ? `${aspectRatio}` : undefined
        }}
      >
        <span className="text-gray-500 text-sm">Failed to load image</span>
      </div>
    )
  }

  return (
    <div
      className={`relative overflow-hidden ${className || ''}`}
      style={{
        aspectRatio: aspectRatio ? `${aspectRatio}` : undefined
      }}
    >
      <Image
        src={config.src}
        alt={config.alt}
        width={config.width}
        height={config.height}
        quality={config.quality}
        priority={config.priority}
        loading={config.loading}
        placeholder={config.placeholder}
        blurDataURL={config.blurDataURL}
        sizes={responsiveSizes}
        onLoad={handleLoad}
        onError={handleError}
        className={`transition-opacity duration-300 ${
          isLoaded ? 'opacity-100' : 'opacity-0'
        }`}
        style={{
          objectFit,
          width: '100%',
          height: '100%'
        }}
        {...props}
      />
    </div>
  )
}

export function OptimizedBackgroundImage({
  src,
  alt,
  children,
  className,
  overlayOpacity = 0.5,
  ...props
}: OptimizedImageProps & {
  children?: React.ReactNode
  overlayOpacity?: number
}) {
  return (
    <div className={`relative ${className || ''}`}>
      <OptimizedImage
        src={src}
        alt={alt}
        fill
        objectFit="cover"
        {...props}
      />
      {overlayOpacity > 0 && (
        <div
          className="absolute inset-0 bg-black"
          style={{ opacity: overlayOpacity }}
        />
      )}
      {children && (
        <div className="relative z-10">
          {children}
        </div>
      )}
    </div>
  )
}

export function OptimizedAvatar({
  src,
  alt,
  size = 40,
  className,
  ...props
}: OptimizedImageProps & {
  size?: number
}) {
  return (
    <OptimizedImage
      src={src}
      alt={alt}
      width={size}
      height={size}
      quality={95}
      className={`rounded-full ${className || ''}`}
      objectFit="cover"
      {...props}
    />
  )
}

export function OptimizedLogo({
  src,
  alt,
  width = 120,
  height = 40,
  className,
  ...props
}: OptimizedImageProps) {
  return (
    <OptimizedImage
      src={src}
      alt={alt}
      width={width}
      height={height}
      quality={95}
      priority
      className={className}
      objectFit="contain"
      {...props}
    />
  )
}
