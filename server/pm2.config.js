module.exports = {
  apps: [
    {
      name: "bestspot-backend",
      script: "server.js",
      instances: 1,
      autorestart: true,
      watch: true,
      max_memory_restart: "300M",
      env: {
        NODE_ENV: "development",
      },
      env_production: {
        NODE_ENV: "production",
      },
    },
  ],
};
