/**
 * Script to seed test lead data for dashboard testing
 * Run with: npx tsx scripts/seed-test-leads.ts
 */

import { ConvexHttpClient } from "convex/browser";
import { api } from "../convex/_generated/api";

const client = new ConvexHttpClient(process.env.NEXT_PUBLIC_CONVEX_URL!);

const sampleLeads = [
  {
    name: "John Smith",
    email: "john.smith@techcorp.com",
    phone: "+1-555-0101",
    company: "TechCorp Solutions",
    leadSource: "WEBSITE" as const,
    leadHeat: "HOT" as const,
    leadHeatScore: 18,
    status: "QUALIFIED" as const,
    notes: "Interested in enterprise solution, budget approved",
    customFields: {
      industry: "Technology",
      companySize: "500-1000",
      budget: "50000"
    },
    socialProfiles: [
      { platform: "linkedin", handle: "johnsmith-tech", url: "https://linkedin.com/in/johnsmith-tech" }
    ]
  },
  {
    name: "Sarah Johnson",
    email: "sarah.j@designstudio.com",
    phone: "+1-555-0102", 
    company: "Creative Design Studio",
    leadSource: "LINKEDIN" as const,
    leadHeat: "WARM" as const,
    leadHeatScore: 12,
    status: "LEAD" as const,
    notes: "Downloaded whitepaper, attended webinar",
    customFields: {
      industry: "Design",
      companySize: "10-50",
      budget: "10000"
    },
    socialProfiles: [
      { platform: "linkedin", handle: "sarah-johnson-design", url: "https://linkedin.com/in/sarah-johnson-design" },
      { platform: "instagram", handle: "@sarahdesigns", url: "https://instagram.com/sarahdesigns" }
    ]
  },
  {
    name: "Mike Chen",
    email: "m.chen@retailplus.com",
    phone: "+1-555-0103",
    company: "RetailPlus Inc",
    leadSource: "FACEBOOK" as const,
    leadHeat: "COLD" as const,
    leadHeatScore: 4,
    status: "PROSPECT" as const,
    notes: "Clicked on ad, visited pricing page",
    customFields: {
      industry: "Retail",
      companySize: "100-500",
      budget: "25000"
    },
    socialProfiles: [
      { platform: "facebook", handle: "retailplus.official", url: "https://facebook.com/retailplus.official" }
    ]
  },
  {
    name: "Lisa Rodriguez",
    email: "lisa@healthcareconnect.com", 
    phone: "+1-555-0104",
    company: "HealthCare Connect",
    leadSource: "REFERRAL" as const,
    leadHeat: "HOT" as const,
    leadHeatScore: 22,
    status: "CUSTOMER" as const,
    notes: "Converted! Signed annual contract",
    customFields: {
      industry: "Healthcare",
      companySize: "200-500",
      budget: "75000"
    },
    socialProfiles: [
      { platform: "linkedin", handle: "lisa-rodriguez-hc", url: "https://linkedin.com/in/lisa-rodriguez-hc" }
    ]
  },
  {
    name: "David Kim",
    email: "david.kim@financepro.com",
    phone: "+1-555-0105",
    company: "FinancePro Services",
    leadSource: "WEBSITE" as const,
    leadHeat: "WARM" as const,
    leadHeatScore: 14,
    status: "QUALIFIED" as const,
    notes: "Scheduled demo for next week",
    customFields: {
      industry: "Finance",
      companySize: "50-100", 
      budget: "40000"
    },
    socialProfiles: [
      { platform: "linkedin", handle: "david-kim-finance", url: "https://linkedin.com/in/david-kim-finance" }
    ]
  },
  {
    name: "Emma Wilson",
    email: "emma@marketingworks.com",
    phone: "+1-555-0106",
    company: "Marketing Works Agency",
    leadSource: "INSTAGRAM" as const,
    leadHeat: "COLD" as const,
    leadHeatScore: 6,
    status: "UNQUALIFIED" as const,
    notes: "Not ready to purchase, will follow up in 6 months",
    customFields: {
      industry: "Marketing",
      companySize: "10-50",
      budget: "5000"
    },
    socialProfiles: [
      { platform: "instagram", handle: "@marketingworks", url: "https://instagram.com/marketingworks" },
      { platform: "facebook", handle: "marketingworks.agency", url: "https://facebook.com/marketingworks.agency" }
    ]
  },
  {
    name: "Robert Brown",
    email: "r.brown@edutech.org",
    phone: "+1-555-0107",
    company: "EduTech Solutions",
    leadSource: "DIRECT" as const,
    leadHeat: "HOT" as const,
    leadHeatScore: 20,
    status: "QUALIFIED" as const,
    notes: "Urgent need, decision maker engaged",
    customFields: {
      industry: "Education",
      companySize: "500-1000",
      budget: "100000"
    },
    socialProfiles: [
      { platform: "linkedin", handle: "robert-brown-edutech", url: "https://linkedin.com/in/robert-brown-edutech" }
    ]
  },
  {
    name: "Jennifer Davis",
    email: "jennifer@legalcorp.com",
    phone: "+1-555-0108",
    company: "Legal Corp",
    leadSource: "LINKEDIN" as const,
    leadHeat: "WARM" as const,
    leadHeatScore: 11,
    status: "LEAD" as const,
    notes: "Interested in compliance features",
    customFields: {
      industry: "Legal",
      companySize: "100-200",
      budget: "30000"
    },
    socialProfiles: [
      { platform: "linkedin", handle: "jennifer-davis-legal", url: "https://linkedin.com/in/jennifer-davis-legal" }
    ]
  }
];

const sampleInteractions = [
  {
    contactEmail: "john.smith@techcorp.com",
    type: "email_open" as const,
    platform: "linkedin",
    content: "Opened enterprise solution email",
    metadata: { campaign: "enterprise-2024", subject: "Enterprise Solutions Demo" }
  },
  {
    contactEmail: "sarah.j@designstudio.com", 
    type: "website_visit" as const,
    platform: "website",
    content: "Visited pricing page",
    metadata: { page: "/pricing", duration: "00:03:45" }
  },
  {
    contactEmail: "mike.chen@retailplus.com",
    type: "social_engagement" as const,
    platform: "facebook",
    content: "Liked post about retail automation",
    metadata: { postId: "fb_post_123", reactionType: "like" }
  },
  {
    contactEmail: "lisa@healthcareconnect.com",
    type: "email_click" as const,
    platform: "email",
    content: "Clicked contract signing link",
    metadata: { linkUrl: "/contracts/sign", campaign: "healthcare-follow-up" }
  },
  {
    contactEmail: "david.kim@financepro.com",
    type: "meeting_scheduled" as const,
    platform: "calendar",
    content: "Scheduled product demo",
    metadata: { meetingType: "demo", duration: "60min", date: "2024-01-15" }
  }
];

async function seedTestData() {
  console.log("🌱 Starting to seed test lead data...");
  
  try {
    // Create contacts
    console.log("Creating contacts...");
    const contactIds = [];
    
    for (const lead of sampleLeads) {
      const contactId = await client.mutation(api.contacts.create, lead);
      contactIds.push(contactId);
      console.log(`✅ Created contact: ${lead.name} (${lead.email})`);
    }

    // Create interactions
    console.log("\nCreating interactions...");
    for (const interaction of sampleInteractions) {
      // Find contact by email
      const contacts = await client.query(api.contacts.getAllContacts);
      const contact = contacts.find(c => c.email === interaction.contactEmail);
      
      if (contact) {
        await client.mutation(api.interactions.create, {
          contactId: contact._id,
          type: interaction.type,
          platform: interaction.platform,
          content: interaction.content,
          metadata: interaction.metadata
        });
        console.log(`✅ Created interaction for: ${interaction.contactEmail}`);
      }
    }

    console.log("\n🎉 Test data seeding completed successfully!");
    console.log(`📊 Created ${sampleLeads.length} contacts and ${sampleInteractions.length} interactions`);
    console.log("\n🚀 You can now test the dashboard at:");
    console.log("   📈 Dashboard: http://localhost:3000/leads");
    console.log("   🔄 Pipeline: http://localhost:3000/leads/pipeline");
    
  } catch (error) {
    console.error("❌ Error seeding test data:", error);
    process.exit(1);
  }
}

// Run the seeding function
seedTestData();