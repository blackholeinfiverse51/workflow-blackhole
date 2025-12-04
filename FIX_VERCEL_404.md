# 🔧 Fix Vercel 404 Error - Login/Signup Not Working

## 🔴 Problem

When you try to login/signup on your deployed Vercel site, you get a 404 error:
```
https://blackholeworkflow.onrender.com/auth/login  ❌ 404 NOT FOUND
```

The request is going to the wrong URL. It should be:
```
https://blackholeworkflow.onrender.com/api/auth/login  ✅
```

## 🎯 Root Cause

Your Vercel environment variable `VITE_API_URL` is missing the `/api` suffix.

**Current (Wrong):**
```
VITE_API_URL=https://blackholeworkflow.onrender.com  ❌
```

**Should be:**
```
VITE_API_URL=https://blackholeworkflow.onrender.com/api  ✅
```

---

## 🚀 Solution - Update Vercel Environment Variables

### Step 1: Go to Vercel Dashboard
1. Visit: https://vercel.com/dashboard
2. Click on your project: `blackhole-workflow` (or whatever your project name is)

### Step 2: Open Environment Variables
1. Click the **Settings** tab at the top
2. Click **Environment Variables** in the left sidebar

### Step 3: Update VITE_API_URL

**Option A: If the variable exists:**
1. Find `VITE_API_URL` in the list
2. Click the **⋯** (three dots) next to it
3. Click **Edit**
4. Change the value to: `https://blackholeworkflow.onrender.com/api`
5. Make sure it's enabled for: **Production**, **Preview**, and **Development**
6. Click **Save**

**Option B: If the variable doesn't exist:**
1. Click **Add New** button
2. Enter **Name**: `VITE_API_URL`
3. Enter **Value**: `https://blackholeworkflow.onrender.com/api`
4. Select all environments: ✅ Production, ✅ Preview, ✅ Development
5. Click **Save**

### Step 4: Also Add VITE_SOCKET_URL (if missing)
1. Click **Add New** button
2. Enter **Name**: `VITE_SOCKET_URL`
3. Enter **Value**: `https://blackholeworkflow.onrender.com` (no /api for socket)
4. Select all environments: ✅ Production, ✅ Preview, ✅ Development
5. Click **Save**

### Step 5: Redeploy
After updating environment variables:
1. Go to **Deployments** tab
2. Find the latest deployment
3. Click the **⋯** (three dots) on the right
4. Click **Redeploy**
5. Wait 1-2 minutes for deployment to complete

---

## ✅ Verification

### After Redeployment:

1. **Open your Vercel site**: https://blackhole-workflow.vercel.app (or your URL)
2. **Open Browser Console**: Press `F12` or `Ctrl+Shift+I`
3. **Refresh the page**: `Ctrl+R` or `F5`
4. **Look for these console logs**:
   ```
   🔧 Using VITE_API_URL: https://blackholeworkflow.onrender.com/api
   ✅ Final API_URL: https://blackholeworkflow.onrender.com/api
   ```

5. **Try to login/signup** - Should work! ✅

---

## 🐛 If Still Not Working

### 1. Clear Browser Cache
- Press `Ctrl+Shift+R` (Windows) or `Cmd+Shift+R` (Mac)
- Or clear all browser cache and cookies for your site

### 2. Wait for Render Backend to Wake Up
- Render free tier sleeps after 15 minutes of inactivity
- First request takes 30-60 seconds to wake up
- Try again after waiting

### 3. Check Backend is Running
Open this URL in your browser:
```
https://blackholeworkflow.onrender.com/api/ping
```

Should return:
```json
{"message": "Pong!"}
```

If you get 404 or timeout, your backend is not deployed correctly.

### 4. Check Console for Exact Error
In browser console (F12), look for:
```
🔍 API Debug: {
  fullURL: "https://blackholeworkflow.onrender.com/api/auth/login",
  API_URL: "https://blackholeworkflow.onrender.com/api",
  endpoint: "/auth/login",
  method: "POST"
}
```

The `fullURL` should include `/api/` in it. If not, environment variable wasn't updated.

---

## 📋 Complete Environment Variables Checklist

### Vercel (Frontend)
- [ ] `VITE_API_URL` = `https://blackholeworkflow.onrender.com/api`
- [ ] `VITE_SOCKET_URL` = `https://blackholeworkflow.onrender.com`

### Render (Backend)
- [ ] `MONGODB_URI` = Your MongoDB connection string
- [ ] `JWT_SECRET` = Your secret key
- [ ] `CORS_ORIGIN` = `https://blackhole-workflow.vercel.app`
- [ ] `NODE_ENV` = `production`
- [ ] `PORT` = `5000`

---

## 🎉 Success Indicators

When everything is working:
- ✅ Login page loads without errors
- ✅ Console shows correct API URL with `/api`
- ✅ Signup creates user successfully
- ✅ Login redirects to dashboard
- ✅ No 404 errors in console

---

## 📞 Still Need Help?

If you're still getting 404 errors after following all steps:

1. Take a screenshot of:
   - Vercel environment variables page
   - Browser console (F12) showing the error
   - Network tab showing the failed request

2. Check that your backend is deployed on Render and running

3. Verify CORS settings in your backend include your Vercel URL

