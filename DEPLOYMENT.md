# Cendrixa Deployment Guide

## ✅ Completed Setup

### 1. Supabase Database
- **Project ID:** qkjhjhezaxwayhvzygum
- **URL:** https://qkjhjhezaxwayhvzygum.supabase.co
- **Status:** ✅ Schema migrated, seed data loaded

### 2. Stripe Products
- **Starter (£99/month):**
  - Product ID: `prod_U0tfdIF8ldQlHA`
  - Price ID: `price_1T2rrxBKlSJKu31gjvg3Xu4m`
- **Professional (£149/month):**
  - Product ID: `prod_U0tfHJuYvgHkMu`
  - Price ID: `price_1T2rs8BKlSJKu31ghS2MkOBv`
- **Status:** ✅ Created in Stripe test mode

### 3. GitHub Repository
- **URL:** https://github.com/daUnborn/cendrixa
- **Status:** ✅ Pushed and live

### 4. Vercel Deployment
- **Live URL:** https://cendrixa-git-main-chimarok-amaikes-projects.vercel.app
- **Status:** ✅ Deployed with environment variables

---

## 🔧 Remaining Configuration

### 1. Get Stripe Publishable Key
1. Go to https://dashboard.stripe.com/test/apikeys
2. Copy the **Publishable key** (starts with `pk_test_`)
3. Add it to Vercel env vars as `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY`
4. Redeploy

### 2. Set Up Stripe Webhook (for subscription updates)
1. Go to https://dashboard.stripe.com/test/webhooks
2. Click **Add endpoint**
3. Set **Endpoint URL:** `https://cendrixa-git-main-chimarok-amaikes-projects.vercel.app/api/stripe/webhook`
4. Select events to listen for:
   - `customer.subscription.created`
   - `customer.subscription.updated`
   - `customer.subscription.deleted`
5. Copy the **Signing secret** (starts with `whsec_`)
6. Add it to Vercel env vars as `STRIPE_WEBHOOK_SECRET`
7. Redeploy

### 3. Enable Supabase Auth (if not already)
1. Go to Supabase Dashboard → **Authentication** → **Providers**
2. Ensure **Email** provider is enabled
3. Add your Vercel domain to **URL Configuration** → **Redirect URLs**:
   - `https://cendrixa-git-main-chimarok-amaikes-projects.vercel.app/auth/callback`

### 4. Custom Domain (Optional)
1. In Vercel → **Settings** → **Domains**
2. Add your custom domain (e.g., `app.cendrixa.com`)
3. Update `NEXT_PUBLIC_APP_URL` in Vercel env vars to match
4. Update Supabase redirect URLs accordingly

---

## 🧪 Test the App

### Test Flow:
1. Visit: https://cendrixa-git-main-chimarok-amaikes-projects.vercel.app
2. Click **Start free trial**
3. Sign up with email/password
4. Complete onboarding (company name, sector, size)
5. You should land on the compliance dashboard
6. Test features:
   - Add an employee
   - Record a right-to-work check
   - Adopt a policy from templates
   - Create a disciplinary/grievance case
   - Use the holiday calculator

---

## 📝 Next Steps for Production

### Before Going Live:
1. **Replace policy templates** with licensed legal content
2. **Switch Stripe to live mode:**
   - Create live products/prices
   - Update env vars with live Stripe keys
   - Set up live webhook
3. **Set up email provider (Resend):**
   - Get API key from resend.com
   - Add to env vars as `RESEND_API_KEY`
4. **Add privacy policy & terms of service** pages
5. **Set up custom domain**
6. **Configure Supabase production database** (consider dedicated project)
7. **Enable Vercel Analytics**
8. **Set up error monitoring** (e.g., Sentry)

---

## 🆘 Troubleshooting

### App not loading?
- Check Vercel deployment logs
- Verify all env vars are set correctly
- Ensure Supabase database migration ran successfully

### Can't sign up?
- Check Supabase Auth is enabled
- Verify redirect URLs are configured
- Check browser console for errors

### Stripe checkout not working?
- Ensure `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY` is set
- Verify price IDs are correct
- Check Stripe dashboard for test mode status

---

## 📧 Support
For issues or questions, check:
- GitHub Issues: https://github.com/daUnborn/cendrixa/issues
- CLAUDE.md for project architecture
