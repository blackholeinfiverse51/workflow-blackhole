# 🚀 Quick Reference - Infiverse BHL Deployment

## 📍 URLs

| Service | URL |
|---------|-----|
| **Frontend** | https://blackhole-workflow.vercel.app |
| **Backend** | https://blackholeworkflow.onrender.com |
| **API Base** | https://blackholeworkflow.onrender.com/api |
| **Health Check** | https://blackholeworkflow.onrender.com/api/ping |

---

## 🔑 Key Environment Variables

### Frontend (Vercel)
```env
VITE_API_URL=https://blackholeworkflow.onrender.com/api
VITE_SOCKET_URL=https://blackholeworkflow.onrender.com
```

### Backend (Render)
```env
CORS_ORIGIN=https://blackhole-workflow.vercel.app,http://localhost:5173
FRONTEND_URL=https://blackhole-workflow.vercel.app
MONGODB_URI=mongodb+srv://...
JWT_SECRET=supersecretkey
NODE_ENV=production
```

---

## 🧪 Quick Tests

### Test Backend
```bash
curl https://blackholeworkflow.onrender.com/api/ping
```

### Test Frontend
Open: https://blackhole-workflow.vercel.app

### Check Socket Connection
Open browser console, look for:
```
✅ Socket connected: [socket-id]
```

---

## 📂 Important Files

| File | Purpose |
|------|---------|
| `client/.env` | Frontend environment variables |
| `server/.env` | Backend environment variables |
| `client/src/lib/api.js` | API configuration |
| `client/src/context/socket-context.jsx` | Socket.IO setup |
| `server/index.js` | Server entry point & CORS |

---

## 🔧 Common Commands

### Local Development
```bash
# Frontend
cd client
npm install
npm run dev

# Backend
cd server
npm install
npm start
```

### Build for Production
```bash
# Frontend
cd client
npm run build

# Backend (no build needed)
cd server
npm start
```

---

## 🐛 Quick Troubleshooting

| Problem | Solution |
|---------|----------|
| Backend 502/503 | Wait 30s (Render free tier wakes up) |
| CORS error | Check CORS_ORIGIN in Render env vars |
| Socket not connecting | Verify VITE_SOCKET_URL |
| API 404 | Check VITE_API_URL has `/api` suffix |
| Auth fails | Check JWT_SECRET in Render |

---

## 📊 Monitoring

### Vercel Dashboard
- Deployments: https://vercel.com/dashboard
- Logs: Click deployment → View Function Logs

### Render Dashboard
- Services: https://dashboard.render.com
- Logs: Click service → Logs tab

### MongoDB Atlas
- Clusters: https://cloud.mongodb.com
- Monitor: Database → Metrics

---

## 🔄 Deployment Flow

1. **Push to GitHub** → Triggers auto-deploy
2. **Vercel** → Builds and deploys frontend
3. **Render** → Deploys backend
4. **Test** → Verify connection works

---

## ✅ Connection Status

```
Frontend (Vercel) ←→ Backend (Render) ←→ MongoDB (Atlas)
        ✅                  ✅                  ✅
```

**All systems connected and operational!** 🎉
