/** @type {import('tailwindcss').Config} */

export default {
  darkMode: "class",
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    screens: {
      'sm': '640px',
      'md': '768px', 
      'lg': '1024px',
      'xl': '1280px',
      '2xl': '1536px',
    },
    container: {
      center: true,
      padding: "1.5rem",
      screens: {
        "2xl": "1280px",
      },
    },
    extend: {
      fontFamily: {
        sans: [
          "Helvetica Neue",
          "思源黑体",
          "Noto Sans SC",
          "Segoe UI",
          "Roboto",
          "sans-serif",
        ],
      },
      fontSize: {
        'title': ['2rem', { lineHeight: '2.5rem', fontWeight: '600' }],
        'subtitle': ['1.5rem', { lineHeight: '2rem', fontWeight: '500' }],
        'body': ['1rem', { lineHeight: '1.5rem', fontWeight: '400' }],
        'caption': ['0.875rem', { lineHeight: '1.25rem', fontWeight: '400' }],
      },
      colors: {
        // BeJSON White Theme Colors
        'bj-bg-primary': '#ffffff',
        'bj-bg-secondary': '#f8f9fa',
        'bj-bg-tertiary': '#f1f3f4',
        'bj-bg-card': '#ffffff',
        'bj-text-primary': '#333333',
        'bj-text-secondary': '#666666',
        'bj-text-muted': '#999999',
        'bj-text-subtle': '#cccccc',
        'bj-border': '#e0e0e0',
        'bj-border-light': '#f0f0f0',
        'bj-accent-blue': '#007bff',
        'bj-accent-blue-hover': '#0056b3',
        'bj-accent-green': '#28a745',
        'bj-accent-orange': '#fd7e14',
        'bj-error': '#dc3545',
        'bj-success': '#28a745',
        'bj-warning': '#ffc107',
        'bj-info': '#17a2b8',
      },
      animation: {
        'fade-in': 'fadeIn 300ms ease-in-out',
        'slide-in': 'slideIn 300ms ease-in-out',
        'scale-in': 'scaleIn 100ms ease-in-out',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        slideIn: {
          '0%': { transform: 'translateX(-10px)', opacity: '0' },
          '100%': { transform: 'translateX(0)', opacity: '1' },
        },
        scaleIn: {
          '0%': { transform: 'scale(0.95)' },
          '100%': { transform: 'scale(1)' },
        },
      },
      transitionDuration: {
        '300': '300ms',
      },
    },
  },
  plugins: [],
};
