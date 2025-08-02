# Data Models

## Core Business Entities

### Contact Model
**Purpose:** Central repository for all leads, prospects, and clients with comprehensive interaction tracking

**Key Attributes:**
- id: string (UUID) - Unique identifier
- name: string - Full contact name
- email: string - Primary email address
- phone: string - Primary phone number
- leadSource: enum - Origin of the contact
- leadHeat: number - Calculated engagement score
- status: enum - Customer journey stage
- socialProfiles: json - Social media account links
- customFields: json - Flexible additional data

```typescript
interface Contact {
  id: string;
  name: string;
  email: string;
  phone?: string;
  leadSource: LeadSource;
  leadHeat: number;
  status: ContactStatus;
  socialProfiles: SocialProfile[];
  customFields: Record<string, any>;
  createdAt: Date;
  updatedAt: Date;
  
  // Relations
  opportunities: Opportunity[];
  projects: Project[];
  interactions: Interaction[];
}

enum ContactStatus {
  UNQUALIFIED = "unqualified",
  PROSPECT = "prospect", 
  LEAD = "lead",
  QUALIFIED = "qualified",
  CUSTOMER = "customer",
  LOST = "lost"
}
```

### Opportunity Model
**Purpose:** Sales pipeline management with customizable stages and detailed tracking

```typescript
interface Opportunity {
  id: string;
  name: string;
  contactId: string;
  stage: string;
  value: number;
  eventType: string;
  eventDate: Date;
  guestCount: number;
  requiresCatering: boolean;
  roomAssignment?: string;
  customFields: Record<string, any>;
  createdAt: Date;
  updatedAt: Date;
  
  // Relations
  contact: Contact;
  project?: Project;
  documents: Document[];
  payments: Payment[];
}
```

### Project Model
**Purpose:** Post-sale project management with collaborative features

```typescript
interface Project {
  id: string;
  name: string;
  opportunityId: string;
  status: ProjectStatus;
  startDate: Date;
  endDate: Date;
  clientLink: string; // Unique client access URL
  settings: ProjectSettings;
  createdAt: Date;
  updatedAt: Date;
  
  // Relations
  opportunity: Opportunity;
  tasks: Task[];
  messages: Message[];
  documents: Document[];
  participants: ProjectParticipant[];
}

interface Task {
  id: string;
  projectId: string;
  title: string;
  description?: string;
  status: TaskStatus;
  assigneeId: string;
  dueDate?: Date;
  isInternal: boolean;
  createdAt: Date;
  updatedAt: Date;
  
  // Relations
  project: Project;
  assignee: User;
  comments: TaskComment[];
}
```
