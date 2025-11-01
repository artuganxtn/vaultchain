# Nginx Configuration Explanation

## How It Works

- **External URL** (what users see): `https://vaultchaintr.com/api`
- **Internal connection** (Nginx → Backend): `http://localhost:3001`

When a user visits `https://vaultchaintr.com/api/data`, Nginx receives the request and internally forwards it to `http://localhost:3001/api/data`. The user never sees `localhost` - they only see `vaultchaintr.com/api`.

---

## Correct Nginx Configuration

The configuration below is correct. The `proxy_pass http://localhost:3001` is the **internal** connection only.

```nginx
server {
    listen 80;
    server_name vaultchaintr.com www.vaultchaintr.com;

    # Frontend (React/Vite build)
    location / {
        root /var/www/vaultchain/dist;
        index index.html;
        try_files $uri $uri/ /index.html;
        
        # Security headers
        add_header X-Frame-Options "SAMEORIGIN" always;
        add_header X-Content-Type-Options "nosniff" always;
        add_header X-XSS-Protection "1; mode=block" always;
    }

    # Backend API
    # External URL: https://vaultchaintr.com/api
    # Internal proxy: http://localhost:3001
    location /api {
        proxy_pass http://localhost:3001;
        proxy_http_version 1.1;
        
        # Important headers for proper proxying
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_set_header X-Forwarded-Host $host;
        
        # Timeouts
        proxy_cache_bypass $http_upgrade;
        proxy_read_timeout 300s;
        proxy_connect_timeout 75s;
    }

    # Static files caching
    location ~* \.(js|css|png|jpg|jpeg|gif|ico|svg|woff|woff2|ttf|eot)$ {
        root /var/www/vaultchain/dist;
        expires 1y;
        add_header Cache-Control "public, immutable";
    }
}
```

---

## Testing

### Test Internal Connection:
```bash
curl http://localhost:3001/api/data
```

### Test External URL (via Nginx):
```bash
curl http://vaultchaintr.com/api/data
# or
curl https://vaultchaintr.com/api/data
```

Both should work, but only the external URL is what users will access.

---

## What You'll See

✅ **Correct (what you want):**
- User visits: `https://vaultchaintr.com/api/data`
- Browser shows: `https://vaultchaintr.com/api/data`

❌ **Incorrect (if misconfigured):**
- User visits: `https://vaultchaintr.com/api/data`
- Browser redirects to: `http://localhost:3001/api/data` (should never happen)

The configuration above ensures users always see `vaultchaintr.com/api` in their browser.

