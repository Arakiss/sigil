import type { Config } from 'tailwindcss'
import tailwindcssAnimate from 'tailwindcss-animate'

const config: Config = {
	darkMode: ['class'],
	content: [
		'./app/**/*.{js,ts,jsx,tsx,mdx}',
		'./components/**/*.{js,ts,jsx,tsx}',
		'./content/**/*.{ts,tsx}',
		'./lib/**/*.{js,ts,jsx,tsx}',
	],
	theme: {
		container: {
			center: true,
			padding: '2rem',
			screens: {
				'2xl': '1400px',
			},
		},
		extend: {
			// Brand colors
			colors: {
				brand: {
					cyan: 'hsl(var(--color-brand-cyan))',
					purple: 'hsl(var(--color-brand-purple))',
					pink: 'hsl(var(--color-brand-pink))',
				},
				// Runtime-specific colors
				runtime: {
					bun: 'hsl(var(--color-runtime-bun))',
					node: 'hsl(var(--color-runtime-node))',
					edge: 'hsl(var(--color-runtime-edge))',
					browser: 'hsl(var(--color-runtime-browser))',
				},
				// Log level colors
				level: {
					trace: 'hsl(var(--color-level-trace))',
					debug: 'hsl(var(--color-level-debug))',
					info: 'hsl(var(--color-level-info))',
					warn: 'hsl(var(--color-level-warn))',
					error: 'hsl(var(--color-level-error))',
				},
				// Semantic colors (shadcn compatible)
				border: 'hsl(var(--border))',
				input: 'hsl(var(--input))',
				ring: 'hsl(var(--ring))',
				background: 'hsl(var(--background))',
				foreground: 'hsl(var(--foreground))',
				primary: {
					DEFAULT: 'hsl(var(--primary))',
					foreground: 'hsl(var(--primary-foreground))',
				},
				secondary: {
					DEFAULT: 'hsl(var(--secondary))',
					foreground: 'hsl(var(--secondary-foreground))',
				},
				destructive: {
					DEFAULT: 'hsl(var(--destructive))',
					foreground: 'hsl(var(--destructive-foreground))',
				},
				muted: {
					DEFAULT: 'hsl(var(--muted))',
					foreground: 'hsl(var(--muted-foreground))',
				},
				accent: {
					DEFAULT: 'hsl(var(--accent))',
					foreground: 'hsl(var(--accent-foreground))',
				},
				popover: {
					DEFAULT: 'hsl(var(--popover))',
					foreground: 'hsl(var(--popover-foreground))',
				},
				card: {
					DEFAULT: 'hsl(var(--card))',
					foreground: 'hsl(var(--card-foreground))',
				},
				// Surface variants
				surface: {
					DEFAULT: 'hsl(var(--surface))',
					elevated: 'hsl(var(--surface-elevated))',
					overlay: 'hsl(var(--surface-overlay))',
				},
			},
			// Border radius tokens
			borderRadius: {
				lg: 'var(--radius)',
				md: 'calc(var(--radius) - 2px)',
				sm: 'calc(var(--radius) - 4px)',
			},
			// Font families
			fontFamily: {
				sans: ['var(--font-sans)', 'system-ui', 'sans-serif'],
				mono: ['var(--font-mono)', 'ui-monospace', 'monospace'],
			},
			// Font sizes with line heights
			fontSize: {
				'2xs': ['0.625rem', { lineHeight: '0.875rem' }],
				xs: ['0.75rem', { lineHeight: '1rem' }],
				sm: ['0.875rem', { lineHeight: '1.25rem' }],
				base: ['1rem', { lineHeight: '1.5rem' }],
				lg: ['1.125rem', { lineHeight: '1.75rem' }],
				xl: ['1.25rem', { lineHeight: '1.75rem' }],
				'2xl': ['1.5rem', { lineHeight: '2rem' }],
				'3xl': ['1.875rem', { lineHeight: '2.25rem' }],
				'4xl': ['2.25rem', { lineHeight: '2.5rem' }],
				'5xl': ['3rem', { lineHeight: '1' }],
				'6xl': ['3.75rem', { lineHeight: '1' }],
				'7xl': ['4.5rem', { lineHeight: '1' }],
			},
			// Spacing tokens
			spacing: {
				'4.5': '1.125rem',
				'5.5': '1.375rem',
				'18': '4.5rem',
				'88': '22rem',
				'128': '32rem',
			},
			// Shadow tokens
			boxShadow: {
				glow: '0 0 20px rgba(0, 255, 255, 0.15)',
				'glow-sm': '0 0 10px rgba(0, 255, 255, 0.1)',
				'glow-lg': '0 0 40px rgba(0, 255, 255, 0.2)',
				'glow-purple': '0 0 20px rgba(168, 85, 247, 0.15)',
				'glow-pink': '0 0 20px rgba(236, 72, 153, 0.15)',
				inner: 'inset 0 2px 4px 0 rgb(0 0 0 / 0.05)',
				'inner-lg': 'inset 0 4px 8px 0 rgb(0 0 0 / 0.1)',
			},
			// Background gradients
			backgroundImage: {
				'gradient-radial': 'radial-gradient(var(--tw-gradient-stops))',
				'gradient-conic': 'conic-gradient(from 180deg at 50% 50%, var(--tw-gradient-stops))',
				'gradient-brand':
					'linear-gradient(135deg, hsl(var(--color-brand-cyan)) 0%, hsl(var(--color-brand-purple)) 50%, hsl(var(--color-brand-pink)) 100%)',
				'gradient-brand-subtle':
					'linear-gradient(135deg, hsl(var(--color-brand-cyan) / 0.1) 0%, hsl(var(--color-brand-purple) / 0.1) 50%, hsl(var(--color-brand-pink) / 0.1) 100%)',
				'gradient-surface':
					'linear-gradient(180deg, hsl(var(--surface-elevated)) 0%, hsl(var(--surface)) 100%)',
				'hero-glow':
					'radial-gradient(ellipse 80% 50% at 50% -20%, hsl(var(--color-brand-cyan) / 0.15), transparent)',
			},
			// Animation keyframes
			keyframes: {
				'accordion-down': {
					from: { height: '0' },
					to: { height: 'var(--radix-accordion-content-height)' },
				},
				'accordion-up': {
					from: { height: 'var(--radix-accordion-content-height)' },
					to: { height: '0' },
				},
				'fade-in': {
					from: { opacity: '0' },
					to: { opacity: '1' },
				},
				'fade-out': {
					from: { opacity: '1' },
					to: { opacity: '0' },
				},
				'slide-in-from-top': {
					from: { transform: 'translateY(-10px)', opacity: '0' },
					to: { transform: 'translateY(0)', opacity: '1' },
				},
				'slide-in-from-bottom': {
					from: { transform: 'translateY(10px)', opacity: '0' },
					to: { transform: 'translateY(0)', opacity: '1' },
				},
				'slide-in-from-left': {
					from: { transform: 'translateX(-10px)', opacity: '0' },
					to: { transform: 'translateX(0)', opacity: '1' },
				},
				'slide-in-from-right': {
					from: { transform: 'translateX(10px)', opacity: '0' },
					to: { transform: 'translateX(0)', opacity: '1' },
				},
				'pulse-subtle': {
					'0%, 100%': { opacity: '1' },
					'50%': { opacity: '0.7' },
				},
				shimmer: {
					'0%': { backgroundPosition: '-200% 0' },
					'100%': { backgroundPosition: '200% 0' },
				},
				float: {
					'0%, 100%': { transform: 'translateY(0)' },
					'50%': { transform: 'translateY(-5px)' },
				},
				'typing-cursor': {
					'0%, 100%': { opacity: '1' },
					'50%': { opacity: '0' },
				},
			},
			// Animation utilities
			animation: {
				'accordion-down': 'accordion-down 0.2s ease-out',
				'accordion-up': 'accordion-up 0.2s ease-out',
				'fade-in': 'fade-in 0.3s ease-out',
				'fade-out': 'fade-out 0.3s ease-out',
				'slide-in-from-top': 'slide-in-from-top 0.3s ease-out',
				'slide-in-from-bottom': 'slide-in-from-bottom 0.3s ease-out',
				'slide-in-from-left': 'slide-in-from-left 0.3s ease-out',
				'slide-in-from-right': 'slide-in-from-right 0.3s ease-out',
				'pulse-subtle': 'pulse-subtle 2s ease-in-out infinite',
				shimmer: 'shimmer 2s linear infinite',
				float: 'float 3s ease-in-out infinite',
				'typing-cursor': 'typing-cursor 1s ease-in-out infinite',
			},
			// Backdrop blur tokens
			backdropBlur: {
				xs: '2px',
			},
			// Transition durations
			transitionDuration: {
				'250': '250ms',
				'350': '350ms',
			},
		},
	},
	plugins: [tailwindcssAnimate],
}

export default config
