module.exports = {
  type: 'react-component',
  npm: {
    esModules: true,
    umd: {
      global: 'ReactTrackerCanvas',
      externals: {
        react: 'React'
      }
    }
  }
}
