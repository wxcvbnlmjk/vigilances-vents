module.exports = {
  development: {
    port: 3000,
    host: 'localhost',
    open: true,
    https: false
  },
  staging: {
    port: 3001,
    host: '0.0.0.0',
    open: false,
    https: false
  },
  production: {
    port: 80,
    host: '0.0.0.0',
    open: false,
    https: true
  }
}
