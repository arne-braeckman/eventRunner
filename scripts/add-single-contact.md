# Quick Test Data - Add Single Contact

## Option 1: Through Convex Dashboard (Easiest)

1. **Open Convex Dashboard** (check your terminal for the URL, usually something like https://dashboard.convex.dev)

2. **Go to Functions tab** → Find `contacts:createContact` or `contacts:create`

3. **Copy and paste this into the arguments field:**

```json
{
  "name": "John Smith",
  "email": "john.smith@techcorp.com", 
  "phone": "+1-555-0101",
  "company": "TechCorp Solutions",
  "leadSource": "WEBSITE",
  "leadHeat": "HOT",
  "leadHeatScore": 18,
  "status": "QUALIFIED",
  "notes": "Test contact for dashboard"
}
```

4. **Click "Run"** - you should see a success response with an ID

5. **Refresh your Lead Analytics page** - you should now see data!

## Option 2: Through Data Tab (Alternative)

1. **Go to Data tab** → Click `contacts` table
2. **Click "Add Document"**  
3. **Paste the JSON above**
4. **Click "Save"**

## Add More Contacts (Optional)

Once the first contact works, you can add more variety:

**Warm Lead:**
```json
{
  "name": "Sarah Johnson",
  "email": "sarah@designstudio.com",
  "company": "Design Studio", 
  "leadSource": "LINKEDIN",
  "leadHeat": "WARM",
  "leadHeatScore": 12,
  "status": "LEAD"
}
```

**Cold Lead:**  
```json
{
  "name": "Mike Chen",
  "email": "mike@retailplus.com",
  "company": "RetailPlus Inc",
  "leadSource": "FACEBOOK", 
  "leadHeat": "COLD",
  "leadHeatScore": 4,
  "status": "PROSPECT"
}
```

**Customer (Converted):**
```json
{
  "name": "Lisa Rodriguez", 
  "email": "lisa@healthcare.com",
  "company": "HealthCare Connect",
  "leadSource": "REFERRAL",
  "leadHeat": "HOT", 
  "leadHeatScore": 22,
  "status": "CUSTOMER"
}
```

## What You'll See

After adding contacts, your dashboard should show:
- **Total Leads**: Number of contacts added
- **Hot/Warm/Cold Leads**: Based on leadHeat values  
- **Charts**: Lead source distribution, heat trends
- **Pipeline**: Contacts organized by status (PROSPECT, LEAD, QUALIFIED, CUSTOMER)

## Troubleshooting

- **"Function not found"**: Look for `contacts:create` instead of `createContact`
- **Validation error**: Make sure all required fields are included
- **Still no data**: Check the debug info banner on the lead pages
- **Permission error**: Make sure you're authenticated in Convex dashboard