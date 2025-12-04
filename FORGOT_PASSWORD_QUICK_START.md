# 🚀 Forgot Password - Quick Start Guide

## 🎯 What You Got

A complete forgot password system with:
- ✅ Email-based password reset
- ✅ Beautiful UI pages
- ✅ Secure token verification
- ✅ Auto-expiring links (1 hour)
- ✅ Email notifications

---

## ⚡ Quick Setup (5 Minutes)

### Step 1: Configure Email (Required)

Edit `server/.env` and add:

```env
# Gmail Configuration
EMAIL_USER=your-email@gmail.com
EMAIL_PASSWORD=your-gmail-app-password
EMAIL_SERVICE=gmail

# Frontend URL
FRONTEND_URL=http://localhost:5173
```

**🔑 Get Gmail App Password:**
1. Go to: https://myaccount.google.com/apppasswords
2. Select "Mail" and "Other (Custom name)"
3. Copy the 16-character password
4. Paste it in `EMAIL_PASSWORD`

### Step 2: Restart Server

```bash
cd server
npm start
```

### Step 3: Test It!

1. **Go to login page:** http://localhost:5173/login
2. **Click:** "Forgot?" link (next to password field)
3. **Enter:** Your email address
4. **Check:** Your email inbox
5. **Click:** Reset link in email
6. **Enter:** New password
7. **Done!** Login with new password

---

## 📱 User Journey

### 🔵 Step 1: User Forgets Password
```
Login Page → "Forgot?" link
```
![Login Page - Forgot Link]

### 🔵 Step 2: Enter Email
```
Forgot Password Page → Enter email → "Send Reset Link"
```
![Forgot Password Form]

### 🔵 Step 3: Check Email
```
Email Inbox → "Password Reset Request" email
```
![Reset Email]

### 🔵 Step 4: Click Reset Link
```
Email → "Reset Password" button → Opens reset page
```

### 🔵 Step 5: Enter New Password
```
Reset Password Page → Enter new password (2x) → "Reset Password"
```
![Reset Password Form]

### 🔵 Step 6: Success!
```
Success message → Auto-redirect to login → Login with new password
```
![Success Message]

---

## 🎨 What the Pages Look Like

### Forgot Password Page (`/forgot-password`)
```
┌─────────────────────────────────────────┐
│                                         │
│             📧 [Icon]                   │
│                                         │
│         Forgot Password?                │
│                                         │
│    Enter your email address and we'll   │
│    send you a link to reset password    │
│                                         │
│  ┌───────────────────────────────────┐  │
│  │ Email Address                     │  │
│  │ you@example.com                   │  │
│  └───────────────────────────────────┘  │
│                                         │
│  ┌───────────────────────────────────┐  │
│  │     📧 Send Reset Link            │  │
│  └───────────────────────────────────┘  │
│                                         │
│  ← Back to Login                        │
│                                         │
└─────────────────────────────────────────┘
```

### Reset Password Page (`/reset-password/:token`)
```
┌─────────────────────────────────────────┐
│                                         │
│             🔒 [Icon]                   │
│                                         │
│          Reset Password                 │
│                                         │
│    Enter a new password for             │
│         user@example.com                │
│                                         │
│  ┌───────────────────────────────────┐  │
│  │ New Password                      │  │
│  │ ••••••••••  👁️                    │  │
│  └───────────────────────────────────┘  │
│  Must be at least 6 characters          │
│                                         │
│  ┌───────────────────────────────────┐  │
│  │ Confirm New Password              │  │
│  │ ••••••••••  👁️                    │  │
│  └───────────────────────────────────┘  │
│                                         │
│  ┌───────────────────────────────────┐  │
│  │     🔒 Reset Password             │  │
│  └───────────────────────────────────┘  │
│                                         │
│         Back to Login                   │
│                                         │
└─────────────────────────────────────────┘
```

---

## 📧 Email Examples

### Reset Request Email
```
Subject: Password Reset Request - WorkflowAI

Hello John,

We received a request to reset your password for your WorkflowAI account.

Click the button below to reset your password:

┌─────────────────────────┐
│   Reset Password   │
└─────────────────────────┘

Or copy and paste this link:
http://localhost:5173/reset-password/eyJhbGc...

This link will expire in 1 hour.

If you didn't request a password reset, please ignore this email.
```

### Reset Confirmation Email
```
Subject: Password Reset Confirmation - WorkflowAI

Hello John,

Your password has been successfully reset.

You can now log in to your account using your new password.

┌─────────────────────────┐
│    Go to Login     │
└─────────────────────────┘

If you didn't make this change, please contact support immediately.
```

---

## ✅ Testing Checklist

Before going live, test these scenarios:

### Basic Flow
- [ ] Click "Forgot?" on login page → Opens forgot password page
- [ ] Enter valid email → Success message appears
- [ ] Check email → Reset email received
- [ ] Click reset link → Reset page opens
- [ ] Enter new password → Success message
- [ ] Auto-redirect works → Goes to login
- [ ] Login with new password → Success

### Edge Cases
- [ ] Enter non-existent email → Still shows success (security)
- [ ] Enter invalid email format → Shows validation error
- [ ] Use expired token (wait 1 hour) → Shows error
- [ ] Use already-used token → Shows error
- [ ] Password < 6 characters → Shows validation error
- [ ] Passwords don't match → Shows validation error
- [ ] Submit without entering password → Shows validation error

### UI/UX
- [ ] Loading spinners appear during API calls
- [ ] Error messages are clear and helpful
- [ ] Success messages are encouraging
- [ ] "Back to Login" links work
- [ ] Page is responsive on mobile
- [ ] Dark mode works correctly
- [ ] Password show/hide toggle works

---

## 🔧 Configuration Options

### Change Token Expiration Time

In `server/routes/auth.js`, line ~535:

```javascript
// Change from 1 hour to 2 hours
const token = jwt.sign(
  { id: user.id, email: user.email },
  process.env.JWT_SECRET || "jwtSecret",
  { expiresIn: "2h" }  // ← Change this
)

// Also update expiry timestamp (line ~540)
user.resetPasswordExpires = Date.now() + 7200000 // 2 hours in milliseconds
```

### Change Minimum Password Length

In `server/routes/auth.js`, line ~589:

```javascript
// Change from 6 to 8 characters
if (!password || password.length < 8) {
  return res.status(400).json({ 
    error: "Password must be at least 8 characters long." 
  })
}
```

Also update in `client/src/pages/ResetPassword.jsx`, line ~58:

```javascript
if (password.length < 8) {
  setError("Password must be at least 8 characters long")
  return false
}
```

### Customize Email Templates

Edit the email content in `server/routes/auth.js`:
- **Reset Request Email:** Lines ~545-572
- **Confirmation Email:** Lines ~615-643

---

## 🎯 API Endpoints Reference

### 1. Request Password Reset
```
POST /api/auth/forgot-password
Body: { "email": "user@example.com" }
```

### 2. Verify Reset Token
```
GET /api/auth/verify-reset-token/:token
```

### 3. Reset Password
```
POST /api/auth/reset-password/:token
Body: { "password": "newPassword123" }
```

---

## 🚨 Common Issues & Fixes

### Issue: Email Not Sending

**Fix 1:** Check Gmail App Password
```bash
# In server/.env
EMAIL_USER=your-email@gmail.com
EMAIL_PASSWORD=abcd efgh ijkl mnop  # 16-char app password
```

**Fix 2:** Enable Less Secure Apps
- Go to: https://myaccount.google.com/security
- Enable "Less secure app access"

**Fix 3:** Check Server Logs
```bash
# Look for email errors in terminal
Password reset email sent to user@example.com  # ← Should see this
```

### Issue: Token Invalid/Expired

**Fix:** Request new reset link
- Tokens expire after 1 hour
- Each token can only be used once
- Must request new link if expired

### Issue: Page Not Found (404)

**Fix:** Make sure dev server is restarted
```bash
# Stop client (Ctrl+C)
cd client
npm run dev
```

### Issue: CORS Error

**Fix:** Check server CORS settings
```javascript
// server/index.js should have:
origin: ['http://localhost:5173', ...]
```

---

## 🌟 Features Summary

| Feature | Status | Description |
|---------|--------|-------------|
| Email Verification | ✅ | Sends reset link via email |
| Token Security | ✅ | JWT with 1-hour expiration |
| Beautiful UI | ✅ | Matches your design system |
| Email Notifications | ✅ | Request & confirmation emails |
| Password Validation | ✅ | Min 6 chars, must confirm |
| Error Handling | ✅ | Clear error messages |
| Loading States | ✅ | Spinners during API calls |
| Dark Mode | ✅ | Fully supported |
| Responsive Design | ✅ | Mobile-friendly |
| Auto-Redirect | ✅ | After successful reset |

---

## 📱 Mobile Screenshots

The forgot password feature is fully responsive and works beautifully on mobile devices!

---

## 🎉 You're All Set!

The forgot password feature is ready to use. Just:

1. ✅ Configure email in `.env`
2. ✅ Restart server
3. ✅ Test the flow
4. ✅ Deploy to production

**Need more details?** Check `FORGOT_PASSWORD_FEATURE.md` for the complete documentation.

---

## 📞 Support

If you encounter any issues:
1. Check the troubleshooting section above
2. Review server logs for errors
3. Test with Postman/cURL to isolate issues
4. Verify environment variables are set correctly

**Happy Password Resetting! 🔐✨**

