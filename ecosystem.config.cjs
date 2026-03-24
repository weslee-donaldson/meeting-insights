module.exports = {
  apps: [{
    name: "webhook-watcher",
    script: "local-service/main.ts",
    interpreter: "./node_modules/.bin/tsx",
    watch: false,
    autorestart: true,
    max_restarts: 10,
    restart_delay: 5000,
    env: {
      NODE_ENV: "production"
    }
  }]
};
