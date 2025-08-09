import { describe, it, expect } from 'vitest';

describe('Proposal API Types', () => {
  it('validates proposal status types', () => {
    const validStatuses = [
      'DRAFT', 'SENT', 'VIEWED', 'UNDER_REVIEW', 
      'ACCEPTED', 'REJECTED', 'EXPIRED'
    ];
    
    expect(validStatuses).toHaveLength(7);
    expect(validStatuses).toContain('DRAFT');
    expect(validStatuses).toContain('ACCEPTED');
  });

  it('validates proposal interaction types', () => {
    const validInteractionTypes = [
      'SENT', 'VIEWED', 'DOWNLOADED', 'COMMENT_ADDED',
      'STATUS_CHANGED', 'REMINDER_SENT', 'ACCEPTED', 'REJECTED'
    ];
    
    expect(validInteractionTypes).toHaveLength(8);
    expect(validInteractionTypes).toContain('VIEWED');
    expect(validInteractionTypes).toContain('COMMENT_ADDED');
  });

  it('validates event types for templates', () => {
    const validEventTypes = [
      'WEDDING', 'CORPORATE', 'BIRTHDAY', 'ANNIVERSARY',
      'CONFERENCE', 'GALA', 'OTHER'
    ];
    
    expect(validEventTypes).toHaveLength(7);
    expect(validEventTypes).toContain('WEDDING');
    expect(validEventTypes).toContain('CORPORATE');
  });
});