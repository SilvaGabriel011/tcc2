/**
 * PostCSS Configuration
 * 
 * PostCSS is a tool for transforming CSS with JavaScript plugins.
 * This configuration is used by Next.js to process CSS files.
 */
module.exports = {
  plugins: {
    // TailwindCSS plugin - processes Tailwind directives and generates utility classes
    tailwindcss: {},
    
    // Autoprefixer plugin - adds vendor prefixes to CSS rules for browser compatibility
    // Example: transform: scale(1) -> -webkit-transform: scale(1); transform: scale(1);
    autoprefixer: {},
  },
}
