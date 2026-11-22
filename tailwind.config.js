module.exports = {
  content: ['./app/**/*.{js,jsx}', './components/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        canvas: '#0b0b0b',
        panel: '#141414',
        inset: '#1b1b1b',
        ink: '#f4f4f3',
        muted: '#a6a6a3',
        line: '#303030',
        accent: '#c6edaf',
      },
      fontFamily: {
        sans: ['system-ui', 'PingFang SC', 'Microsoft YaHei', 'sans-serif'],
        mono: ['SFMono-Regular', 'Consolas', 'Liberation Mono', 'monospace'],
      },
    },
  },
};
