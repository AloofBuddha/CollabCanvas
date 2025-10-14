# Pre-Deployment Checklist

Complete this checklist before deploying to production.

## Firebase Configuration

- [ ] Firebase project created
- [ ] Firestore Database enabled and configured
- [ ] Realtime Database enabled and configured
- [ ] Authentication enabled (Email/Password provider)
- [ ] Firebase security rules reviewed and ready to deploy

### Deploy Firebase Rules

```bash
# Test rules locally first (optional)
firebase emulators:start

# Deploy to production
firebase deploy --only firestore:rules
firebase deploy --only database:rules
```

## Local Testing

- [ ] All tests passing: `npm run test:unit`
- [ ] Type checking passes: `npm run type-check`
- [ ] Linting passes: `npm run lint`
- [ ] Production build works: `npm run build`
- [ ] Can preview production build: `npm run preview`

### Run Pre-Deployment Tests

```bash
# Run all checks
npm run type-check && npm run lint && npm run test:unit && npm run build
```

## Environment Variables

- [ ] All Firebase credentials ready
- [ ] `VITE_FIREBASE_API_KEY` - Your Firebase API key
- [ ] `VITE_FIREBASE_AUTH_DOMAIN` - Your auth domain (*.firebaseapp.com)
- [ ] `VITE_FIREBASE_PROJECT_ID` - Your project ID
- [ ] `VITE_FIREBASE_STORAGE_BUCKET` - Your storage bucket
- [ ] `VITE_FIREBASE_MESSAGING_SENDER_ID` - Your sender ID
- [ ] `VITE_FIREBASE_APP_ID` - Your app ID
- [ ] `VITE_FIREBASE_DATABASE_URL` - Your Realtime DB URL (https://*)

**Security Check:**
- [ ] `.env.local` is in `.gitignore` (should NOT be committed)
- [ ] `env.template` exists for reference (does NOT contain actual keys)

## Vercel Setup

- [ ] Vercel account created
- [ ] Repository connected to Vercel
- [ ] Environment variables added to Vercel dashboard
- [ ] Build settings configured:
  - Framework: Vite
  - Build Command: `npm run build`
  - Output Directory: `dist`

## Security Rules Verification

### Firestore Rules

Test that:
- [ ] Authenticated users can read all shapes
- [ ] Authenticated users can write shapes
- [ ] Authenticated users can read all user profiles
- [ ] Users can only write their own profile
- [ ] Unauthenticated users are denied

### Realtime Database Rules

Test that:
- [ ] All users can read cursors
- [ ] Users can only write their own cursor
- [ ] All users can read presence
- [ ] Users can only write their own presence

## Post-Deployment Verification

After deploying, verify:

### 1. Authentication
- [ ] Can access signup page
- [ ] Can create new account
- [ ] Can log in with existing account
- [ ] Can log out
- [ ] User profile created in Firestore
- [ ] Auth state persists on reload

### 2. Canvas Functionality
- [ ] Canvas loads without errors
- [ ] Can pan canvas (middle-click + drag)
- [ ] Can zoom canvas (Ctrl + wheel)
- [ ] Can scroll vertically (wheel)

### 3. Shape Operations
- [ ] Can create rectangles (rectangle tool + drag)
- [ ] Can select shapes (select tool + click)
- [ ] Can drag shapes
- [ ] Can delete shapes (select + Delete key)
- [ ] Shapes persist on reload

### 4. Multi-User Collaboration (Test with 2 browsers)
- [ ] Remote cursor appears in real-time
- [ ] Remote cursor shows correct name and color
- [ ] Remote cursor disappears when user disconnects
- [ ] Online users appear in header
- [ ] Shapes created by one user appear for other users
- [ ] Shape dragging syncs in real-time
- [ ] Locked shapes show colored border
- [ ] Cannot drag shapes locked by other users

### 5. Performance
- [ ] Page loads in < 3 seconds
- [ ] Cursor movement is smooth
- [ ] Shape dragging is smooth
- [ ] No console errors
- [ ] Network tab shows Firebase connections established

## Firebase Console Verification

### Firestore Database
Check that you see:
- [ ] `users` collection with user documents
- [ ] `shapes` collection with shape documents
- [ ] Real-time updates when creating/moving shapes

### Realtime Database
Check that you see:
- [ ] `cursors/[userId]` nodes updating in real-time
- [ ] `presence/[userId]` nodes with online status
- [ ] Nodes automatically removed on disconnect

### Authentication
Check that you see:
- [ ] Users listed in Authentication tab
- [ ] Email/Password provider enabled
- [ ] Deployment domain in Authorized domains

## Rollback Plan

If issues occur:
1. Go to Vercel Dashboard → Deployments
2. Find previous working deployment
3. Click "..." → "Promote to Production"
4. Investigate issues in staging

## Monitoring Setup

- [ ] Enable Vercel Analytics (optional)
- [ ] Monitor Firebase Usage dashboard
- [ ] Set up billing alerts if on paid tier

## Documentation

- [ ] README.md updated with deployment URL
- [ ] DEPLOYMENT.md reviewed and accurate
- [ ] Team members informed of deployment

---

## Quick Command Reference

```bash
# Check everything locally
npm run type-check && npm run lint && npm run test:unit && npm run build

# Deploy Firebase rules
firebase deploy --only firestore:rules
firebase deploy --only database:rules

# Deploy to Vercel (CLI)
vercel --prod

# Preview production build locally
npm run build && npm run preview
```

---

**✅ All checks complete? Ready to deploy!**

1. Deploy Firebase rules
2. Deploy to Vercel
3. Add Vercel domain to Firebase Auth
4. Run post-deployment verification
5. Celebrate! 🎉

