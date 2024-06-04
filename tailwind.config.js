module.exports = {
  content: ['./src/**/*.{js,jsx,ts,tsx}'],
  mode: 'jit',
  purge: ['./public/**/*.html', './src/**/*.{js,jsx,ts,tsx}'],
  prefix: 'tw-',
  corePlugins: {
    preflight: false,
  },
  theme: {
    // usage: tw-rounded[-sm|-lg|-xl|-2xl|-full]
    borderRadius: {
      DEFAULT: '8px',
      sm: '4px',
      lg: '12px',
      xl: '16px',
      '2xl': '24px',
      full: '50%',
    },
    fontFamily: {
      sans: ['Lato', 'Open Sans', 'Helvetica', 'Arial', 'sans-serif'],
    },
    // usage: tw-text-[xs|sm|base|lg|xl|2xl|3xl|4xl|5xl]
    fontSize: {
      xs: '0.7142rem',
      sm: '0.8571rem',
      base: '1rem',
      lg: '1.1428rem',
      xl: '1.2857rem',
      '2xl': '1.4285rem',
      '3xl': '2.1428rem',
      '4xl': '2.5714rem',
      '5xl': '2.8571rem',
    },
    // usage: tw-font-[normal|bold|black]
    fontWeight: {
      normal: 400,
      bold: 700,
      black: 900,
    },
    // usage: tw-leading-[normal|relaxed|loose]
    lineHeight: {
      normal: '1.4',
      relaxed: '1.5',
      loose: '1.6',
    },
    // usage: tw-tracking-[normal|wide|wider]
    letterSpacing: {
      normal: '0',
      wide: '.01em',
      wider: '.02em',
    },
    screens: {
      sm: '420px',
      md: '770px',
      lg: '1030px',
    },
    // usage: tw-shadow[-sm|-lg|-xl|-none]
    boxShadow: {
      DEFAULT: '0 2px 16px rgba(0, 0, 0, 0.06)',
      sm: '0 -4px 16px rgba(0, 0, 0, 0.06)',
      lg: '0 4px 16px rgba(0, 0, 0, 0.06)',
      xl: '0 4px 24px rgba(0, 0, 0, 0.06)',
      none: 'none',
    },
    spacing: {
      '0': '0',
      '2': '0.512820vw',
      '3': '0.769231vw',
      '4': '1.025641vw',
      '6': '1.538462vw',
      '8': '2.051282vw',
      '12': '3.076923vw',
      '16': '4.102564vw',
      '20': '5.128205vw',
      '24': '6.153846vw',
      '2px': '2px',
      '3px': '3px',
      '4px': '4px',
      '6px': '6px',
      '8px': '8px',
      '12px': '12px',
      '16px': '16px',
      '20px': '20px',
      '24px': '24px',
    },
    extend: {
      colors: {
        black: {
          DEFAULT: '#000000',
        },
        orange: {
          DEFAULT: '#FF9419',
          dark: '#FC7118',
          light: '#FEC788',
        },
        red: {
          DEFAULT: '#E15343',
          dark: '#C04537',
          light: '#ED988F',
        },
        blue: {
          DEFAULT: '#00B0FF',
          dark: '#0089C7',
          light: '#66D0FF',
          darkest: '#231651',
        },
        yellow: {
          DEFAULT: '#FFCC00',
          dark: '#F0B917',
          light: '#FFFBE6',
        },
        green: {
          DEFAULT: '#36A93F',
          dark: '#02814E',
          light: '#DFFDE2',
        },
        gray: {
          DEFAULT: '#303030',
          50: '#FFFFFF',
          100: '#F9FAFB',
          200: '#F2F2F3',
          300: '#EBEBEB',
          400: '#DEDEDF',
          500: '#D1D1D1',
          600: '#9E9E9E',
          700: '#717171',
          800: '#303030',
          900: '#1C1C1C',
        },
        cyan: {
          DEFAULT: '#0698A8',
        },
      },
      width: {
        '3/10': '30%',
        '1.5/10': '15%',
      },
      // usage: tw-z-[60|100|200|300]
      zIndex: {
        '60': '60',
        '100': '100',
        '200': '200',
        '300': '300',
      },
    },
  },
  plugins: [require('@tailwindcss/line-clamp')],
};
