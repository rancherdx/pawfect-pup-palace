
import type { Config } from "tailwindcss";

export default {
	darkMode: ["class"],
	content: [
		"./pages/**/*.{ts,tsx}",
		"./components/**/*.{ts,tsx}",
		"./app/**/*.{ts,tsx}",
		"./src/**/*.{ts,tsx}",
	],
	prefix: "",
	theme: {
		container: {
			center: true,
			padding: '2rem',
			screens: {
				'2xl': '1400px'
			}
		},
		extend: {
			fontFamily: {
				'fredoka': ['Fredoka One', 'cursive'],
				'nunito': ['Nunito', 'sans-serif'],
				'comfortaa': ['Comfortaa', 'cursive'],
				'quicksand': ['Quicksand', 'sans-serif'],
			},
			colors: {
				border: 'hsl(var(--border))',
				input: 'hsl(var(--input))',
				ring: 'hsl(var(--ring))',
				background: 'hsl(var(--background))',
				foreground: 'hsl(var(--foreground))',
				brand: {
					red: '#E53E3E',
					orange: '#FF6B1A', // Halloween orange
					purple: '#2D1B69', // Midnight purple
					green: '#39FF14', // Spooky green
					black: '#1A1A1A',
					white: '#FFFFFF',
				},
				halloween: {
					orange: '#FF6B1A',
					purple: '#2D1B69',
					green: '#39FF14',
					black: '#1A0B2E',
					ghost: '#F8F8FF',
				},
				primary: {
					DEFAULT: 'hsl(var(--primary))',
					foreground: 'hsl(var(--primary-foreground))'
				},
				secondary: {
					DEFAULT: 'hsl(var(--secondary))',
					foreground: 'hsl(var(--secondary-foreground))'
				},
				destructive: {
					DEFAULT: 'hsl(var(--destructive))',
					foreground: 'hsl(var(--destructive-foreground))'
				},
				muted: {
					DEFAULT: 'hsl(var(--muted))',
					foreground: 'hsl(var(--muted-foreground))'
				},
				accent: {
					DEFAULT: 'hsl(var(--accent))',
					foreground: 'hsl(var(--accent-foreground))'
				},
				popover: {
					DEFAULT: 'hsl(var(--popover))',
					foreground: 'hsl(var(--popover-foreground))'
				},
				card: {
					DEFAULT: 'hsl(var(--card))',
					foreground: 'hsl(var(--card-foreground))'
				},
			},
			borderRadius: {
				lg: 'var(--radius)',
				md: 'calc(var(--radius) - 2px)',
				sm: 'calc(var(--radius) - 4px)'
			},
			keyframes: {
				'accordion-down': {
					from: { height: '0', opacity: '0' },
					to: { height: 'var(--radix-accordion-content-height)', opacity: '1' }
				},
				'accordion-up': {
					from: { height: 'var(--radix-accordion-content-height)', opacity: '1' },
					to: { height: '0', opacity: '0' }
				},
				'fade-in': {
					'0%': { opacity: '0', transform: 'translateY(10px)' },
					'100%': { opacity: '1', transform: 'translateY(0)' }
				},
				'fade-out': {
					'0%': { opacity: '1', transform: 'translateY(0)' },
					'100%': { opacity: '0', transform: 'translateY(10px)' }
				},
				'scale-in': {
					'0%': { transform: 'scale(0.95)', opacity: '0' },
					'100%': { transform: 'scale(1)', opacity: '1' }
				},
				'scale-out': {
					from: { transform: 'scale(1)', opacity: '1' },
					to: { transform: 'scale(0.95)', opacity: '0' }
				},
				'slide-in-right': {
					'0%': { transform: 'translateX(100%)' },
					'100%': { transform: 'translateX(0)' }
				},
				'slide-out-right': {
					'0%': { transform: 'translateX(0)' },
					'100%': { transform: 'translateX(100%)' }
				},
				'slide-in-bottom': {
					'0%': { transform: 'translateY(100%)' },
					'100%': { transform: 'translateY(0)' }
				},
				'slide-out-bottom': {
					'0%': { transform: 'translateY(0)' },
					'100%': { transform: 'translateY(100%)' }
				},
				'bounce': {
					'0%, 100%': { transform: 'translateY(-5%)', animationTimingFunction: 'cubic-bezier(0.8, 0, 1, 1)' },
					'50%': { transform: 'translateY(0)', animationTimingFunction: 'cubic-bezier(0, 0, 0.2, 1)' }
				},
				'tail-wag': {
					'0%, 100%': { transform: 'rotate(0deg)' },
					'25%': { transform: 'rotate(-10deg)' },
					'75%': { transform: 'rotate(10deg)' }
				},
				'paw-print': {
					'0%': { opacity: '0', transform: 'scale(0) rotate(-45deg)' },
					'50%': { opacity: '1' },
					'100%': { opacity: '0', transform: 'scale(1.5) rotate(0deg)' }
				},
			},
			animation: {
				'accordion-down': 'accordion-down 0.2s ease-out',
				'accordion-up': 'accordion-up 0.2s ease-out',
				'fade-in': 'fade-in 0.3s ease-out',
				'fade-out': 'fade-out 0.3s ease-out',
				'scale-in': 'scale-in 0.2s ease-out',
				'scale-out': 'scale-out 0.2s ease-out',
				'slide-in-right': 'slide-in-right 0.3s ease-out',
				'slide-out-right': 'slide-out-right 0.3s ease-out',
				'slide-in-bottom': 'slide-in-bottom 0.3s ease-out',
				'slide-out-bottom': 'slide-out-bottom 0.3s ease-out',
				'bounce-gentle': 'bounce 1s ease-in-out infinite',
				'tail-wag': 'tail-wag 0.6s ease-in-out infinite',
				'paw-print': 'paw-print 1s ease-out forwards',
			},
			backgroundImage: {
				'gradient-radial': 'radial-gradient(var(--tw-gradient-stops))',
				'gradient-paw': 'url("data:image/svg+xml,%3Csvg xmlns=\'http://www.w3.org/2000/svg\' width=\'24\' height=\'24\' viewBox=\'0 0 24 24\' fill=\'none\' stroke=\'%23E53E3E\' stroke-opacity=\'0.1\' stroke-width=\'2\' stroke-linecap=\'round\' stroke-linejoin=\'round\'%3E%3Ccircle cx=\'12\' cy=\'13\' r=\'8\'/%3E%3Ccircle cx=\'13\' cy=\'11\' r=\'2\'/%3E%3Ccircle cx=\'9\' cy=\'9\' r=\'2\'/%3E%3Ccircle cx=\'15\' cy=\'9\' r=\'2\'/%3E%3Ccircle cx=\'18\' cy=\'13\' r=\'2\'/%3E%3Ccircle cx=\'6\' cy=\'13\' r=\'2\'/%3E%3C/svg%3E")',
			},
			boxShadow: {
				'puppy': '0 10px 25px -5px rgba(229, 62, 62, 0.1), 0 5px 10px -5px rgba(229, 62, 62, 0.05)',
				'halloween': '0 10px 25px -5px rgba(255, 107, 26, 0.3), 0 5px 10px -5px rgba(45, 27, 105, 0.2)',
				'spooky': '0 0 20px rgba(57, 255, 20, 0.5), inset 0 0 20px rgba(45, 27, 105, 0.3)',
			},
			textShadow: {
				'sm': '0 1px 2px rgba(0, 0, 0, 0.1)',
				'DEFAULT': '0 2px 4px rgba(0, 0, 0, 0.1)',
				'lg': '0 8px 16px rgba(0, 0, 0, 0.1)',
			},
		}
	},
	plugins: [
		require("tailwindcss-animate"),
		function({ addUtilities }) {
			const newUtilities = {
				'.text-shadow': {
					textShadow: '0 2px 4px rgba(0, 0, 0, 0.1)',
				},
				'.text-shadow-sm': {
					textShadow: '0 1px 2px rgba(0, 0, 0, 0.1)',
				},
				'.text-shadow-lg': {
					textShadow: '0 8px 16px rgba(0, 0, 0, 0.1)',
				},
				'.text-shadow-none': {
					textShadow: 'none',
				},
			}
			addUtilities(newUtilities, ['responsive', 'hover'])
		},
	],
} satisfies Config;
