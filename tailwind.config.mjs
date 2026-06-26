/** @type {import('tailwindcss').Config} */
export default {
  content: ['./src/**/*.{astro,html,js,jsx,md,mdx,svelte,ts,tsx,vue}'],
  theme: {
    extend: {
      colors: {
        button: {
          dark: '#0A0A0A',
          light: '#FFFFFF'
        },
        title: {
          subheading: '#7D7D78',
          strong: '#B0B0AB',
          stronger: '#DFDFDC',
          lighter: '#F4F3F1'
        },
        bg: {
          deep: '#0A0A0A',
          surface: '#141414',
          light: '#1C1C1C',
          lighter: '#2E2E2E',
          shiny: '#A3A3A3'
        }
      },
      fontFamily: {
        geomanist: ['Geomanist', 'Arial', 'sans-serif']
      },
      fontSize: {
        'title-hiper': ['370px', { lineHeight: '110%', letterSpacing: '-0.04em' }],
        'title-bigger': ['72px', { lineHeight: '110%', letterSpacing: '-0.04em' }],
        'title-big': ['56px', { lineHeight: '110%', letterSpacing: '-0.04em' }],
        'title-regular': ['32px', { lineHeight: '110%', letterSpacing: '-0.04em' }],
        'title-small': ['16px', { lineHeight: '110%', letterSpacing: '-0.04em' }],
        'description-regular': ['16px', { lineHeight: '140%' }],
        button: ['16px', { lineHeight: '1.1', letterSpacing: '-0.64px' }]
      }
    }
  }
};
