/**
 * Tailwind CSS Configuration for AgroInsight
 * 
 * This file configures the TailwindCSS utility-first CSS framework.
 * It defines custom colors, animations, and theme extensions used throughout the application.
 * 
 * @type {import('tailwindcss').Config}
 */
module.exports = {
  // Enable dark mode using class strategy
  // Dark mode is toggled by adding/removing 'dark' class on html element
  darkMode: ["class"],
  
  // Content paths - tells Tailwind where to look for class names
  // Tailwind will scan these files and generate only the CSS classes that are actually used
  content: [
    './pages/**/*.{ts,tsx}',      // Pages directory (if using pages router)
    './components/**/*.{ts,tsx}',  // React components
    './app/**/*.{ts,tsx}',         // App directory (Next.js 13+ app router)
    './src/**/*.{ts,tsx}',         // Source directory
  ],
  
  theme: {
    // Container configuration for responsive layouts
    container: {
      center: true,           // Center containers by default
      padding: "2rem",        // Default horizontal padding
      screens: {
        "2xl": "1400px",      // Max width for 2xl breakpoint
      },
    },
    
    extend: {
      // Custom color palette using CSS variables
      // These map to CSS custom properties defined in globals.css
      // Using HSL format allows for easy theme switching and color manipulation
      colors: {
        border: "hsl(var(--border))",                           // Border colors for UI elements
        input: "hsl(var(--input))",                             // Input field backgrounds
        ring: "hsl(var(--ring))",                               // Focus ring color
        background: "hsl(var(--background))",                   // Page background
        foreground: "hsl(var(--foreground))",                   // Main text color
        
        // Primary brand colors - used for main actions and branding
        primary: {
          DEFAULT: "hsl(var(--primary))",                       // Primary color (buttons, links)
          foreground: "hsl(var(--primary-foreground))",         // Text on primary background
        },
        
        // Secondary colors - used for supporting UI elements
        secondary: {
          DEFAULT: "hsl(var(--secondary))",                     // Secondary color
          foreground: "hsl(var(--secondary-foreground))",       // Text on secondary background
        },
        
        // Destructive colors - used for delete/danger actions
        destructive: {
          DEFAULT: "hsl(var(--destructive))",                   // Destructive color (red)
          foreground: "hsl(var(--destructive-foreground))",     // Text on destructive background
        },
        
        // Muted colors - used for subtle UI elements
        muted: {
          DEFAULT: "hsl(var(--muted))",                         // Muted background
          foreground: "hsl(var(--muted-foreground))",           // Muted text
        },
        
        // Accent colors - used for highlights and emphasis
        accent: {
          DEFAULT: "hsl(var(--accent))",                        // Accent color
          foreground: "hsl(var(--accent-foreground))",          // Text on accent background
        },
        
        // Popover colors - used for floating UI elements
        popover: {
          DEFAULT: "hsl(var(--popover))",                       // Popover background
          foreground: "hsl(var(--popover-foreground))",         // Popover text
        },
        
        // Card colors - used for card components
        card: {
          DEFAULT: "hsl(var(--card))",                          // Card background
          foreground: "hsl(var(--card-foreground))",            // Card text
        },
      },
      
      // Custom border radius values using CSS variables
      // Allows for consistent rounded corners across the app
      borderRadius: {
        lg: "var(--radius)",                    // Large radius
        md: "calc(var(--radius) - 2px)",        // Medium radius
        sm: "calc(var(--radius) - 4px)",        // Small radius
      },
      
      // Keyframe definitions for custom animations
      keyframes: {
        // Accordion expand animation (used by Radix UI accordion)
        "accordion-down": {
          from: { height: 0 },
          to: { height: "var(--radix-accordion-content-height)" },
        },
        // Accordion collapse animation
        "accordion-up": {
          from: { height: "var(--radix-accordion-content-height)" },
          to: { height: 0 },
        },
      },
      
      // Animation utilities that use the keyframes above
      animation: {
        "accordion-down": "accordion-down 0.2s ease-out",     // Smooth expand
        "accordion-up": "accordion-up 0.2s ease-out",         // Smooth collapse
      },
    },
  },
  
  // Plugins extend Tailwind's functionality
  // tailwindcss-animate adds utility classes for common animations
  plugins: [require("tailwindcss-animate")],
}
