# 🚀 Vercel Environment Variables Setup

## ⚠️ IMPORTANT: Set These in Vercel Dashboard

Go to: **Vercel Dashboard → Your Project → Settings → Environment Variables**

### Required Environment Variables:

```
VITE_API_URL=https://blackholeworkflow.onrender.com/api
VITE_SOCKET_URL=https://blackholeworkflow.onrender.com
```

**⚠️ IMPORTANT**: You MUST include `/api` in VITE_API_URL - it's NOT added automatically!

---

## 📝 Step-by-Step Instructions

### 1. Go to Vercel Dashboard
- Visit: https://vercel.com/dashboard
- Select your project: `blackhole-workflow`

### 2. Navigate to Settings
- Click on **Settings** tab
- Click on **Environment Variables** in the left sidebar

### 3. Add Variables
For each variable:
1. Click **Add New**
2. Enter **Key**: `VITE_API_URL`
3. Enter **Value**: `https://blackholeworkflow.onrender.com/api` ⚠️ (Must include /api)
4. Select environments: **Production**, **Preview**, **Development**
5. Click **Save**

Repeat for `VITE_SOCKET_URL` with value `https://blackholeworkflow.onrender.com` (no /api for socket)

### 4. Redeploy
After adding variables:
1. Go to **Deployments** tab
2. Click on the latest deployment
3. Click **⋯** (three dots)
4. Click **Redeploy**

---

## ✅ Verification

### After Redeployment:

1. **Open your site**: https://blackhole-workflow.vercel.app
2. **Open Browser Console** (F12)
3. **Look for these logs**:
   ```
   🔧 Using VITE_API_URL: https://blackholeworkflow.onrender.com/api
   ✅ Final API_URL: https://blackholeworkflow.onrender.com/api
   ```

4. **Try to login** - Should work! ✅

---

## 🐛 If Still Getting 404

### Check Console Logs:
Look for the actual URL being called:
```
🔍 API Debug: {
  fullURL: "https://blackholeworkflow.onrender.com/api/auth/login",
  ...
}
```

### Common Issues:

1. **Environment variables not set in Vercel**
   - Solution: Add them in Vercel dashboard and redeploy

2. **Old build cached**
   - Solution: Hard refresh (Ctrl+Shift+R) or clear browser cache

3. **Backend is sleeping (Render free tier)**
   - Solution: Wait 30 seconds for backend to wake up

4. **Wrong URL in Vercel env vars**
   - Solution: Make sure it's `blackholeworkflow` (no hyphen)

---

## 📊 URL Structure

```
Environment Variable:
VITE_API_URL = https://blackholeworkflow.onrender.com

↓ (api.js adds /api)

API_URL = https://blackholeworkflow.onrender.com/api

↓ (endpoint added)

Final URL = https://blackholeworkflow.onrender.com/api/auth/login ✅
```

---

## 🎯 Quick Test

Test backend directly:
```bash
curl https://blackholeworkflow.onrender.com/api/ping
```

Expected response:
```json
{"message":"Pong!"}
```

If this works, your backend is fine. The issue is frontend configuration.

---

## ✅ Checklist

- [ ] Added `VITE_API_URL` in Vercel
- [ ] Added `VITE_SOCKET_URL` in Vercel
- [ ] Values are correct (no typos)
- [ ] Redeployed after adding variables
- [ ] Cleared browser cache
- [ ] Backend responds to /api/ping
- [ ] Login works! 🎉
