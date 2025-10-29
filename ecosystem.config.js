module.exports = {
  apps: [
    {
      name: 'memo-restaurant',
      script: 'node_modules/next/dist/bin/next',
      args: 'start',
      cwd: './',
      instances: 1,
      autorestart: true,
      watch: false,
      max_memory_restart: '1G',
      env: {
        NODE_ENV: 'production',
        PORT: 3000
      },
      env_production: {
        NODE_ENV: 'production',
        PORT: 3000,
        MONGODB_URI: 'mongodb://localhost:27017/restaurant-memo', // or your production MongoDB URI
        NEXTAUTH_URL: 'https://memos-pizza.com', // Replace with your production domain
        NEXTAUTH_SECRET: 'your-strong-production-secret-key-here' // Replace with a strong secret
      }
    }
  ]
}