module.exports = {
  apps: [{
    name: 'vaultchain-backend',
    script: './server.js',
    cwd: __dirname, // Ensure PM2 runs from the correct directory
    instances: 1,
    exec_mode: 'fork',
    env: {
      NODE_ENV: 'production',
      PORT: 3001,
      HOST: '0.0.0.0' // Bind to all interfaces for EC2 deployment
    },
    error_file: './logs/err.log',
    out_file: './logs/out.log',
    log_date_format: 'YYYY-MM-DD HH:mm:ss Z',
    merge_logs: true,
    autorestart: true,
    max_memory_restart: '1G',
    watch: false,
    ignore_watch: ['node_modules', 'logs', 'database.db']
  }]
};

