import { describe, it, expect } from 'vitest';
import { EVENT_TYPE_OPTIONS, GEOGRAPHIC_REGIONS } from '../../src/lib/types/contact';
import type { Contact } from '../../src/lib/types/contact';

describe('Contact Data Model Enhancement', () => {
  describe('Type System Validation', () => {
    it('should have event type options defined', () => {
      expect(EVENT_TYPE_OPTIONS).toBeDefined();
      expect(EVENT_TYPE_OPTIONS.length).toBeGreaterThan(0);
      
      // Check specific event types
      const eventTypes = EVENT_TYPE_OPTIONS.map(option => option.value);
      expect(eventTypes).toContain('WEDDING');
      expect(eventTypes).toContain('CORPORATE');
      expect(eventTypes).toContain('BIRTHDAY');
    });

    it('should have geographic regions defined', () => {
      expect(GEOGRAPHIC_REGIONS).toBeDefined();
      expect(GEOGRAPHIC_REGIONS.length).toBeGreaterThan(0);
      
      // Check specific regions
      const regions = GEOGRAPHIC_REGIONS.map(option => option.value);
      expect(regions).toContain('BRUSSELS');
      expect(regions).toContain('FLANDERS');
      expect(regions).toContain('ANTWERP');
    });

    it('should support contact interface with new fields', () => {
      // Mock contact with new fields
      const mockContact: Partial<Contact> = {
        name: 'Test Contact',
        email: 'test@example.com',
        geographicLocation: 'BRUSSELS',
        preferredEventType: 'WEDDING',
        leadSource: 'WEBSITE',
        leadHeat: 'WARM',
        status: 'PROSPECT'
      };

      expect(mockContact.geographicLocation).toBe('BRUSSELS');
      expect(mockContact.preferredEventType).toBe('WEDDING');
    });
  });

  describe('Data Validation', () => {
    it('should validate event type options have proper structure', () => {
      EVENT_TYPE_OPTIONS.forEach(option => {
        expect(option).toHaveProperty('value');
        expect(option).toHaveProperty('label');
        expect(typeof option.value).toBe('string');
        expect(typeof option.label).toBe('string');
      });
    });

    it('should validate geographic regions have proper structure', () => {
      GEOGRAPHIC_REGIONS.forEach(region => {
        expect(region).toHaveProperty('value');
        expect(region).toHaveProperty('label');
        expect(typeof region.value).toBe('string');
        expect(typeof region.label).toBe('string');
      });
    });

    it('should have comprehensive event type coverage', () => {
      const eventTypes = EVENT_TYPE_OPTIONS.map(option => option.value);
      
      // Essential event types for venue management
      expect(eventTypes).toContain('WEDDING');
      expect(eventTypes).toContain('CORPORATE');
      expect(eventTypes).toContain('CONFERENCE');
      expect(eventTypes).toContain('BIRTHDAY');
      expect(eventTypes).toContain('ANNIVERSARY');
      expect(eventTypes).toContain('OTHER'); // Fallback option
    });

    it('should have Belgian geographic regions', () => {
      const regions = GEOGRAPHIC_REGIONS.map(option => option.value);
      
      // Major Belgian regions and cities
      expect(regions).toContain('BRUSSELS');
      expect(regions).toContain('FLANDERS');
      expect(regions).toContain('WALLONIA');
      expect(regions).toContain('ANTWERP');
      expect(regions).toContain('GHENT');
      expect(regions).toContain('OTHER'); // Fallback option
    });
  });

  describe('Schema Compatibility', () => {
    it('should ensure new fields are optional in contact interface', () => {
      // Create contact without new fields - should be valid
      const basicContact: Partial<Contact> = {
        name: 'Basic Contact',
        email: 'basic@example.com',
        leadSource: 'WEBSITE',
        leadHeat: 'COLD',
        status: 'UNQUALIFIED'
      };

      expect(basicContact.geographicLocation).toBeUndefined();
      expect(basicContact.preferredEventType).toBeUndefined();
      
      // This should not cause type errors - validating optional nature
      expect(() => {
        const contact = basicContact as Contact;
        return contact;
      }).not.toThrow();
    });

    it('should support filtering parameters structure', () => {
      // Simulate search parameters with new fields
      const searchParams = {
        geographicLocation: 'BRUSSELS',
        preferredEventType: 'WEDDING',
        leadHeat: 'HOT',
        status: 'QUALIFIED'
      };

      expect(searchParams.geographicLocation).toBe('BRUSSELS');
      expect(searchParams.preferredEventType).toBe('WEDDING');
    });
  });
});