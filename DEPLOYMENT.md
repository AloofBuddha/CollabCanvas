# CollabCanvas Deployment Guide

This guide covers deploying CollabCanvas to Vercel with Firebase backend.

## Prerequisites

- Firebase project already set up (Auth, Firestore, Realtime Database)
- Vercel account (free tier works fine)
- Git repository (GitHub, GitLab, or Bitbucket)

## Part 1: Firebase Production Configuration

### 1. Verify Firebase Security Rules

**Firestore Rules** (`firestore.rules`):
```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // User profiles - users can read all, write their own
    match /users/{userId} {
      allow read: if request.auth != null;
      allow write: if request.auth != null && request.auth.uid == userId;
    }
    
    // Shapes - authenticated users can read/write
    match /shapes/{shapeId} {
      allow read: if request.auth != null;
      allow create: if request.auth != null;
      allow update, delete: if request.auth != null;
    }
  }
}
```

**Realtime Database Rules** (`database.rules.json`):
```json
{
  "rules": {
    "cursors": {
      "$userId": {
        ".read": true,
        ".write": "$userId === auth.uid"
      }
    },
    "presence": {
      "$userId": {
        ".read": true,
        ".write": "$userId === auth.uid"
      }
    }
  }
}
```

### 2. Deploy Firebase Rules

```bash
# Install Firebase CLI if not already installed
npm install -g firebase-tools

# Login to Firebase
firebase login

# Initialize Firebase in your project (if not done)
firebase init

# Deploy rules
firebase deploy --only firestore:rules
firebase deploy --only database:rules
```

### 3. Configure Auth Domains

1. Go to Firebase Console → Authentication → Settings
2. Under "Authorized domains", add your Vercel domain:
   - `your-app.vercel.app`
   - `your-custom-domain.com` (if using custom domain)

## Part 2: Vercel Deployment

### Option A: Deploy via Vercel Dashboard (Recommended)

1. **Go to [vercel.com](https://vercel.com) and sign in**

2. **Import your Git repository:**
   - Click "Add New" → "Project"
   - Select your repository (GitHub/GitLab/Bitbucket)
   - Import the CollabCanvas repository

3. **Configure Build Settings:**
   - Framework Preset: `Vite`
   - Build Command: `npm run build`
   - Output Directory: `dist`
   - Install Command: `npm install`

4. **Add Environment Variables:**
   Go to "Environment Variables" section and add:
   
   ```
   VITE_FIREBASE_API_KEY=your_api_key
   VITE_FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
   VITE_FIREBASE_PROJECT_ID=your_project_id
   VITE_FIREBASE_STORAGE_BUCKET=your_project.appspot.com
   VITE_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
   VITE_FIREBASE_APP_ID=your_app_id
   VITE_FIREBASE_DATABASE_URL=https://your_project.firebaseio.com
   ```

   **Important:** 
   - Select "All" environments (Production, Preview, Development)
   - These values should match your Firebase project configuration

5. **Deploy:**
   - Click "Deploy"
   - Wait 2-3 minutes for initial build
   - Vercel will provide a deployment URL

### Option B: Deploy via Vercel CLI

```bash
# Install Vercel CLI
npm i -g vercel

# Login
vercel login

# Deploy (from project root)
vercel

# Follow prompts to link project
# For environment variables, you'll be prompted or can add via dashboard

# Deploy to production
vercel --prod
```

## Part 3: Post-Deployment Verification

### 1. Update Firebase Auth Domains
After deployment, add your Vercel domain to Firebase:
1. Copy your Vercel URL (e.g., `collabcanvas.vercel.app`)
2. Go to Firebase Console → Authentication → Settings → Authorized domains
3. Click "Add domain" and paste your Vercel URL

### 2. Test Authentication Flow
1. Visit your deployed app
2. Try signing up with a new account
3. Verify email/password login works
4. Check that user profile is created in Firestore

### 3. Test Real-Time Collaboration
1. Open your deployed app in two different browsers (or incognito)
2. Sign in with different accounts
3. **Test cursors:** Move mouse in one browser, verify it appears in the other
4. **Test shapes:** Create a rectangle, verify it appears in both browsers
5. **Test locking:** Select a shape in one browser, verify colored border in the other
6. **Test presence:** Verify online users appear in header
7. **Test drag:** Drag a shape, verify smooth sync to other browser

### 4. Test Disconnect Handling
1. Close one browser tab
2. Verify cursor disappears immediately in other browser
3. Verify user avatar removed from header

## Part 4: Custom Domain (Optional)

### Add Custom Domain in Vercel:
1. Go to Project Settings → Domains
2. Add your custom domain
3. Follow DNS configuration instructions
4. Add custom domain to Firebase Authorized domains

## Part 5: Continuous Deployment

Once set up, Vercel automatically:
- ✅ Deploys on every push to `main` branch
- ✅ Creates preview deployments for pull requests
- ✅ Provides unique URLs for each deployment
- ✅ Rolls back easily if needed

## Troubleshooting

### Build Fails
- Check that all dependencies are in `package.json`
- Verify Node version compatibility (Vercel uses Node 18+)
- Check build logs in Vercel dashboard

### Authentication Not Working
- Verify all Firebase environment variables are correct
- Check that Vercel domain is in Firebase Authorized domains
- Verify Firebase Auth is enabled in Firebase Console

### Real-Time Sync Not Working
- Check browser console for errors
- Verify Firestore and Realtime DB rules are deployed
- Check Firebase quota limits (free tier has limits)

### Cursors Not Appearing
- Check Realtime Database rules
- Verify VITE_FIREBASE_DATABASE_URL is correct (must include `https://`)
- Check browser network tab for WebSocket connections

## Performance Monitoring

### Vercel Analytics
Enable in Project Settings → Analytics to track:
- Page load times
- Core Web Vitals
- Real user metrics

### Firebase Usage
Monitor in Firebase Console → Usage:
- Firestore reads/writes
- Realtime DB connections
- Auth sign-ins

## Cost Considerations

### Free Tier Limits:
**Vercel:**
- 100 GB bandwidth/month
- Unlimited deployments
- Preview deployments included

**Firebase (Spark Plan):**
- 50K reads/day, 20K writes/day (Firestore)
- 100 simultaneous connections (Realtime DB)
- 10 GB storage

**Upgrade Triggers:**
- 10+ concurrent users → Firebase Blaze Plan (pay-as-you-go)
- High traffic → Monitor and optimize queries

## Security Checklist

- [ ] Firebase security rules deployed and tested
- [ ] Environment variables stored securely in Vercel
- [ ] No API keys committed to Git (check `.gitignore`)
- [ ] HTTPS enforced (automatic with Vercel)
- [ ] Auth domains properly configured
- [ ] CORS configured if using custom domains

## Rollback Plan

If deployment has issues:
1. Go to Vercel Dashboard → Deployments
2. Find previous working deployment
3. Click "..." → "Promote to Production"
4. Previous version will be live immediately

---

**🎉 Deployment Complete!**

Share your deployment URL and start collaborating in real-time!

