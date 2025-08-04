/**
 * Simple seed script - just copy and paste this into the Convex dashboard
 * Go to your Convex dashboard -> Functions -> Run any mutation -> Paste this code
 */

// Sample contacts to add
const contacts = [
  {
    name: "John Smith",
    email: "john.smith@techcorp.com",
    phone: "+1-555-0101",
    company: "TechCorp Solutions",
    leadSource: "WEBSITE",
    leadHeat: "HOT",
    leadHeatScore: 18,
    status: "QUALIFIED",
    notes: "Interested in enterprise solution"
  },
  {
    name: "Sarah Johnson", 
    email: "sarah.j@designstudio.com",
    phone: "+1-555-0102",
    company: "Creative Design Studio", 
    leadSource: "LINKEDIN",
    leadHeat: "WARM",
    leadHeatScore: 12,
    status: "LEAD",
    notes: "Downloaded whitepaper"
  },
  {
    name: "Mike Chen",
    email: "m.chen@retailplus.com", 
    phone: "+1-555-0103",
    company: "RetailPlus Inc",
    leadSource: "FACEBOOK",
    leadHeat: "COLD", 
    leadHeatScore: 4,
    status: "PROSPECT",
    notes: "Clicked on ad"
  },
  {
    name: "Lisa Rodriguez",
    email: "lisa@healthcareconnect.com",
    phone: "+1-555-0104", 
    company: "HealthCare Connect",
    leadSource: "REFERRAL",
    leadHeat: "HOT",
    leadHeatScore: 22,
    status: "CUSTOMER", 
    notes: "Converted! Signed contract"
  },
  {
    name: "David Kim",
    email: "david.kim@financepro.com",
    phone: "+1-555-0105",
    company: "FinancePro Services",
    leadSource: "WEBSITE", 
    leadHeat: "WARM",
    leadHeatScore: 14,
    status: "QUALIFIED",
    notes: "Demo scheduled"
  }
];

// Instructions:
// 1. Go to your Convex dashboard
// 2. Click on "Functions" tab
// 3. Find "contacts:createContact" or "contacts:create" 
// 4. Copy one contact object from above
// 5. Paste it into the arguments section
// 6. Click "Run"
// 7. Repeat for each contact

console.log("Copy these contacts one by one into your Convex dashboard:");
contacts.forEach((contact, index) => {
  console.log(`\n--- Contact ${index + 1} ---`);
  console.log(JSON.stringify(contact, null, 2));
});