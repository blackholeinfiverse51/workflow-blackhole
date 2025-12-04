# 📧 Email Not Working - Quick Fix Guide

## 🚨 Problem Identified

Your EMS Dashboard is in **MOCK MODE**. This means emails are NOT being sent to users - they're only being logged in the server console.

**Evidence from Terminal 13:**
```
⚠️  EMS: Email credentials not configured. Running in MOCK MODE.
   Add EMAIL_USER and EMAIL_PASS to .env file to enable real email sending.
```

---

## ✅ Solution: Configure Email Credentials

### Step 1: Get Gmail App Password (5 minutes)

#### A. Enable 2-Step Verification
1. Visit: https://myaccount.google.com/security
2. Click **"2-Step Verification"**
3. Follow the setup (you'll need your phone)

#### B. Generate App Password
1. After 2-Step is enabled, visit: https://myaccount.google.com/security
2. Search for: **"App passwords"**
3. Click **"App passwords"**
4. Sign in again if prompted
5. Create a new app password:
   - **App:** Mail
   - **Device:** Windows Computer (or "Other: Infiverse")
6. Click **"Generate"**
7. **COPY the 16-character password** (looks like: `abcd efgh ijkl mnop`)
8. **SAVE IT** - you'll need it in Step 2!

---

### Step 2: Create `.env` File in Server Folder

1. Open File Explorer
2. Navigate to: `C:\Users\Microsoft\Desktop\Complete-Infiverse-2\server`
3. Right-click → **New** → **Text Document**
4. Name it: `.env` (remove the `.txt` extension)
   - Windows might warn you - click **Yes** to confirm
5. Right-click `.env` → **Open with** → **Notepad**
6. Paste this configuration:

```env
# Database
MONGODB_URI=your_existing_mongodb_uri_here

# JWT Secret
JWT_SECRET=your_existing_jwt_secret_here

# Email Configuration (REQUIRED FOR REAL EMAIL SENDING)
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=your-email@gmail.com
EMAIL_PASS=your-16-character-app-password

# Other existing configs...
```

7. **IMPORTANT:** Replace these values:
   - `EMAIL_USER`: Your Gmail address (e.g., `john.doe@gmail.com`)
   - `EMAIL_PASS`: The 16-character app password from Step 1
   - **Remove all spaces** from the app password

8. Save the file (**Ctrl + S**)
9. Close Notepad

---

### Step 3: Restart the Server

#### Option A: Using Terminal 13 (Server Terminal)
1. Click on **Terminal 13** tab
2. Press **`Ctrl + C`** to stop the server
3. Type: `npm start`
4. Press **Enter**

#### Option B: Using Command Below
Or I can restart it for you using the terminal command.

---

### Step 4: Verify It's Working

#### A. Check Server Startup
After restarting, you should see:
```
✅ Server running on port 5000
✅ Connected to MongoDB
```

You should **NOT** see:
```
⚠️ EMS: Email credentials not configured. Running in MOCK MODE.
```

#### B. Test Email Sending
1. Open browser: http://localhost:5173/ems-dashboard
2. Click **"Send Custom Email"**
3. Fill in:
   - **Subject:** "Test Email"
   - **Message:** "Testing real email sending"
   - **Select a recipient** (use your own email for testing)
4. Click **"Send Now"**

#### C. Check Results
- **In Terminal 13:** Should show `✅ Email sent successfully`
- **In recipient's inbox:** Email should arrive within 1-2 minutes
- **If not in inbox:** Check spam/junk folder

---

## 📋 Quick Checklist

- [ ] 2-Step Verification enabled on Gmail
- [ ] App Password generated and copied
- [ ] `.env` file created in `/server` folder
- [ ] `EMAIL_USER` and `EMAIL_PASS` configured in `.env`
- [ ] Server restarted
- [ ] No "MOCK MODE" warning in Terminal 13
- [ ] Test email sent successfully

---

## ❌ Troubleshooting

### Still seeing "MOCK MODE" warning?
- Check that `.env` file is in `server` folder (not `server/.env.example`)
- Ensure file is named `.env` exactly (not `.env.txt`)
- Restart the server again
- Check that EMAIL_USER and EMAIL_PASS have no extra spaces

### "Invalid credentials" error?
- Use the **App Password**, not your regular Gmail password
- Ensure 2-Step Verification is enabled
- Try generating a new App Password
- Check for typos in your Gmail address

### Email not received?
- Wait 2-3 minutes (Gmail can be slow)
- Check spam/junk folder
- Test with your own email first
- Check Terminal 13 for error messages

### "Connection refused" error?
- Check if antivirus/firewall is blocking port 587
- Temporarily disable antivirus and test
- Check your internet connection

---

## 🔐 Security Notes

1. **Never commit `.env` to Git** - it's in `.gitignore`
2. **Keep App Password secret** - it gives full email access
3. **Don't share `.env` file** with anyone
4. If compromised, revoke at: https://myaccount.google.com/apppasswords

---

## 🎯 What Happens After This Fix?

Once configured, the EMS Dashboard will send **REAL EMAILS** to users:
- ✅ Custom emails from EMS Dashboard
- ✅ Task assignment notifications
- ✅ Task reminders
- ✅ Scheduled emails
- ✅ Password reset emails
- ✅ All automated notifications

---

## Need Help?

If you're stuck, please:
1. Share the exact error message from Terminal 13
2. Confirm 2-Step Verification is enabled
3. Verify the `.env` file exists in the correct location
4. Check that you're using the App Password, not regular password

---

**Ready to proceed? Let me know if you need help with any step!** 🚀

