import type { Config } from 'tailwindcss';

const config: Config = {
  content: [
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
    './src/lib/components/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        background: '#05070a',
        foreground: '#ffffff',
        accent: '#00f3ff',
        success: '#00ff7f',
        danger: '#ff4081',
      },
    },
  },
  plugins: [],
};
export default config;
