module.exports = {
  apps: [
    {
      name: "feather-app",
      script: "./backend/lib/index.js",
      watch: true,
      env: {
        NODE_ENV: "development",
      },
      env_production: {
        NODE_ENV: "production",
      },
    },
    {
      name: "nuxt-app",
      cwd: "./frontend",
      script: "npm",
      args: "start",
    },
  ],
};
