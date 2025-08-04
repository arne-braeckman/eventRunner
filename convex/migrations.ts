import { mutation } from "./_generated/server";
import { v } from "convex/values";

// Migration to initialize missing fields on existing contacts
export const migrateContactsWithMissingFields = mutation({
  args: {},
  handler: async (ctx) => {
    // Get all contacts
    const contacts = await ctx.db.query("contacts").collect();
    
    let migratedCount = 0;
    
    for (const contact of contacts) {
      const updates: any = {};
      let needsUpdate = false;
      
      // Initialize missing leadHeatScore
      if (contact.leadHeatScore === undefined) {
        updates.leadHeatScore = 0;
        needsUpdate = true;
      }
      
      // Initialize missing socialProfiles
      if (contact.socialProfiles === undefined) {
        updates.socialProfiles = [];
        needsUpdate = true;
      }
      
      // Initialize missing customFields
      if (contact.customFields === undefined) {
        updates.customFields = {};
        needsUpdate = true;
      }
      
      // Update the contact if any fields were missing
      if (needsUpdate) {
        await ctx.db.patch(contact._id, {
          ...updates,
          updatedAt: Date.now(),
        });
        migratedCount++;
      }
    }
    
    return {
      message: `Migration completed. Updated ${migratedCount} contacts with missing fields.`,
      migratedCount,
      totalContacts: contacts.length,
    };
  },
});

// Helper function to check which contacts need migration
export const checkContactsNeedingMigration = mutation({
  args: {},
  handler: async (ctx) => {
    const contacts = await ctx.db.query("contacts").collect();
    
    const needingMigration = contacts.filter(contact => 
      contact.leadHeatScore === undefined ||
      contact.socialProfiles === undefined ||
      contact.customFields === undefined
    );
    
    return {
      totalContacts: contacts.length,
      needingMigration: needingMigration.length,
      contactsNeedingMigration: needingMigration.map(c => ({
        id: c._id,
        name: c.name,
        email: c.email,
        missingFields: {
          leadHeatScore: c.leadHeatScore === undefined,
          socialProfiles: c.socialProfiles === undefined,
          customFields: c.customFields === undefined,
        }
      })),
    };
  },
});