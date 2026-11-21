module.exports = {
  content: ['./app/**/*.{js,jsx}', './components/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        canvas: '#f7f8f4',
        ink: '#172d25',
        muted: '#546860',
        line: '#dce4dc',
        accent: '#24634d',
      },
      fontFamily: {
        sans: ['system-ui', 'PingFang SC', 'Microsoft YaHei', 'sans-serif'],
      },
    },
  },
};
