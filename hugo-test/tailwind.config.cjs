module.exports = {
  content: ['./layouts/**/*.html', './static/*.html', './static/*.js', './static/letters/**/*.{html,js}', './static/jami/**/*.{html,js}'],
  theme: { extend: {} },
  plugins: [
    function ({ addComponents }) {
      addComponents({
        '.terminal-button': {
          '@apply relative bg-transparent border-0 text-white px-3 py-1.5 mt-3 rounded-xl transition duration-300 ease-in-out hover:scale-105 active:scale-95 text-xs font-medium transform hover:-translate-y-[0.5px]': {},
          cursor: 'pointer',
          userSelect: 'none'
        }
      });
    }
  ]
};
