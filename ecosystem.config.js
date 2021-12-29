module.exports = {
  apps: [
    {
      name: 'webapp',
      script: 'npm',
      args: 'start',
      interpreter: 'none',
      env: {
        NODE_ENV: 'development',
      },
    },
  ],
}