# Quick Testing Guide - Lead Dashboard

## 🚀 Quick Start (5 minutes)

1. **Install dependencies** (if not already done):
   ```bash
   npm install
   ```

2. **Start development server**:
   ```bash
   npm run dev
   ```

3. **Start Convex** (in another terminal):
   ```bash
   npx convex dev
   ```

4. **Seed test data**:
   ```bash
   npx tsx scripts/seed-test-leads.ts
   ```

5. **Open the dashboards**:
   - **Dashboard**: http://localhost:3000/leads
   - **Pipeline**: http://localhost:3000/leads/pipeline

## 🎯 5-Minute User Test

### Test the Dashboard (2 minutes)
1. Go to http://localhost:3000/leads
2. Verify you see 8 total leads, 3 hot leads
3. Change "Last 30 days" to "Last 7 days" 
4. Click "🔥 Hot" filter - should show 3 leads
5. Click "Export" - should download CSV

### Test the Pipeline (2 minutes)  
1. Go to http://localhost:3000/leads/pipeline
2. Verify you see leads in different columns
3. Drag "Mike Chen" from Prospect to Lead column
4. Verify the move works and counts update
5. Refresh page - verify Mike stayed in Lead column

### Test Filters (1 minute)
1. Click "🔥 Hot Leads" filter button
2. Verify only hot leads show (3 total)
3. Click "Clear Filters"
4. Verify all leads return

## 📊 Expected Test Data

After seeding, you should see:
- **8 total contacts** across different industries
- **3 hot leads** (John Smith, Lisa Rodriguez, Robert Brown)  
- **3 warm leads** (Sarah Johnson, David Kim, Jennifer Davis)
- **2 cold leads** (Mike Chen, Emma Wilson)
- **1 customer** (Lisa Rodriguez)
- **5+ interactions** across different platforms

## 🐛 Common Issues

| Issue | Solution |
|-------|----------|
| "Module not found" | Run `npm install` |
| Charts not showing | Check browser console, ensure Recharts installed |
| Drag & drop not working | Verify @dnd-kit packages installed |
| No data showing | Re-run seed script: `npx tsx scripts/seed-test-leads.ts` |
| Convex errors | Ensure `npx convex dev` is running |

## 🔍 What to Look For

### ✅ Should Work
- Smooth chart animations
- Responsive design on mobile
- Fast filtering (< 500ms)
- Drag and drop with visual feedback
- Real-time data updates
- CSV export functionality

### ❌ Red Flags  
- JavaScript errors in console
- Broken layouts on mobile
- Slow filtering (> 2 seconds)
- Drag and drop not working
- Charts not rendering
- Export not downloading

## 📝 Quick Feedback

Rate each area (1-5 stars):
- **Dashboard UX**: ⭐⭐⭐⭐⭐
- **Pipeline UX**: ⭐⭐⭐⭐⭐  
- **Performance**: ⭐⭐⭐⭐⭐
- **Mobile Experience**: ⭐⭐⭐⭐⭐
- **Overall**: ⭐⭐⭐⭐⭐

**Found issues?** Check the full testing guide: `docs/testing/lead-dashboard-user-testing.md`