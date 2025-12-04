# ✅ Deployment Checklist

## Frontend (Vercel) - https://blackhole-workflow.vercel.app

### Environment Variables (Set in Vercel Dashboard)
- [ ] `VITE_API_URL` = `https://blackholeworkflow.onrender.com/api`
- [ ] `VITE_SOCKET_URL` = `https://blackholeworkflow.onrender.com`

### Build Settings
- [ ] Build Command: `npm run build`
- [ ] Output Directory: `dist`
- [ ] Install Command: `npm install`
- [ ] Node Version: 18.x or higher

### Deployment
- [ ] Connect GitHub repository
- [ ] Enable automatic deployments
- [ ] Deploy from `main` branch

---

## Backend (Render) - https://blackholeworkflow.onrender.com

### Environment Variables (Set in Render Dashboard)
- [ ] `MONGODB_URI` = Your MongoDB Atlas connection string
- [ ] `JWT_SECRET` = Your secret key
- [ ] `CORS_ORIGIN` = `https://blackhole-workflow.vercel.app,http://localhost:5173`
- [ ] `FRONTEND_URL` = `https://blackhole-workflow.vercel.app`
- [ ] `NODE_ENV` = `production`
- [ ] `PORT` = `5000`
- [ ] `GEMINI_API_KEY` = Your Gemini API key
- [ ] `GROQ_API_KEY` = Your Groq API key
- [ ] `CLOUDINARY_CLOUD_NAME` = Your Cloudinary cloud name
- [ ] `CLOUDINARY_API_KEY` = Your Cloudinary API key
- [ ] `CLOUDINARY_API_SECRET` = Your Cloudinary API secret
- [ ] `EMAIL_USER` = Your email
- [ ] `EMAIL_PASSWORD` = Your email app password
- [ ] `OFFICE_LAT` = Office latitude
- [ ] `OFFICE_LNG` = Office longitude
- [ ] `OFFICE_RADIUS` = Office radius in meters
- [ ] `MAX_WORKING_HOURS` = 8
- [ ] `AUTO_END_DAY_ENABLED` = true

### Build Settings
- [ ] Build Command: `npm install`
- [ ] Start Command: `npm start`
- [ ] Node Version: 18.x or higher

### Deployment
- [ ] Connect GitHub repository
- [ ] Enable automatic deployments
- [ ] Deploy from `main` branch
- [ ] Set root directory to `server`

---

## MongoDB Atlas

### Configuration
- [ ] Create cluster
- [ ] Create database user
- [ ] Whitelist IP: `0.0.0.0/0` (allow all for Render)
- [ ] Get connection string
- [ ] Add connection string to Render environment variables

---

## Testing After Deployment

### 1. Backend Health Check
```bash
curl https://blackholeworkflow.onrender.com/api/ping
```
Expected response: `{"message":"Pong!"}`

### 2. Frontend Access
- [ ] Visit https://blackhole-workflow.vercel.app
- [ ] Page loads without errors
- [ ] No console errors in browser

### 3. API Connection
- [ ] Login works
- [ ] Dashboard loads
- [ ] Data fetches successfully

### 4. Socket.IO Connection
- [ ] Open browser console
- [ ] Look for: "✅ Socket connected: [socket-id]"
- [ ] Real-time updates work

### 5. Database Connection
- [ ] User registration works
- [ ] Data persists after refresh
- [ ] MongoDB Atlas shows data

---

## Common Issues & Solutions

### Issue: Backend returns 502/503
**Solution**: Render free tier sleeps after 15 min. Wait 30 seconds for wake-up.

### Issue: CORS errors in browser
**Solution**: 
1. Check CORS_ORIGIN in Render environment variables
2. Verify it includes your Vercel URL
3. Restart Render service

### Issue: Socket.IO not connecting
**Solution**:
1. Check VITE_SOCKET_URL in Vercel environment variables
2. Verify Socket.IO CORS in server/index.js
3. Check browser console for errors

### Issue: API calls fail with 404
**Solution**:
1. Verify VITE_API_URL includes `/api` suffix
2. Check API routes in server/index.js
3. Verify backend is running

### Issue: Authentication fails
**Solution**:
1. Check JWT_SECRET is set in Render
2. Clear localStorage and try again
3. Verify user exists in MongoDB

---

## 🎉 Deployment Complete!

Once all checkboxes are marked, your application is fully deployed and operational!

**Frontend**: https://blackhole-workflow.vercel.app
**Backend**: https://blackholeworkflow.onrender.com
**Status**: 🟢 Connected and Ready
