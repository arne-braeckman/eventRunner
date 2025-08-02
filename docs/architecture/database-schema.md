# Database Schema

## Prisma Schema Definition

```prisma
// Contact and Lead Management
model Contact {
  id              String          @id @default(cuid())
  name            String
  email           String          @unique
  phone           String?
  leadSource      LeadSource
  leadHeat        Int             @default(0)
  status          ContactStatus   @default(UNQUALIFIED)
  socialProfiles  Json?
  customFields    Json?
  createdAt       DateTime        @default(now())
  updatedAt       DateTime        @updatedAt
  
  // Relations
  opportunities   Opportunity[]
  projects        Project[]
  interactions    Interaction[]
  
  @@map("contacts")
  @@index([status])
  @@index([leadHeat])
  @@index([createdAt])
}

// Sales Pipeline
model Opportunity {
  id              String      @id @default(cuid())
  name            String
  contactId       String
  stage           String      @default("prospect")
  value           Decimal?
  eventType       String?
  eventDate       DateTime?
  guestCount      Int?
  requiresCatering Boolean    @default(false)
  roomAssignment  String?
  customFields    Json?
  createdAt       DateTime    @default(now())
  updatedAt       DateTime    @updatedAt
  
  // Relations
  contact         Contact     @relation(fields: [contactId], references: [id], onDelete: Cascade)
  project         Project?
  documents       Document[]
  payments        Payment[]
  
  @@map("opportunities")
  @@index([stage])
  @@index([eventDate])
  @@index([contactId])
}

// Project Management
model Project {
  id            String              @id @default(cuid())
  name          String
  opportunityId String              @unique
  status        ProjectStatus       @default(ACTIVE)
  startDate     DateTime
  endDate       DateTime
  clientLink    String              @unique @default(cuid())
  settings      Json?
  createdAt     DateTime            @default(now())
  updatedAt     DateTime            @updatedAt
  
  // Relations
  opportunity   Opportunity         @relation(fields: [opportunityId], references: [id], onDelete: Cascade)
  tasks         Task[]
  messages      Message[]
  documents     Document[]
  participants  ProjectParticipant[]
  
  @@map("projects")
  @@index([status])
  @@index([clientLink])
}

// Task Management  
model Task {
  id          String        @id @default(cuid())
  projectId   String
  title       String
  description String?
  status      TaskStatus    @default(TODO)
  assigneeId  String
  dueDate     DateTime?
  isInternal  Boolean       @default(false)
  position    Int           @default(0)
  createdAt   DateTime      @default(now())
  updatedAt   DateTime      @updatedAt
  
  // Relations
  project     Project       @relation(fields: [projectId], references: [id], onDelete: Cascade)
  assignee    User          @relation(fields: [assigneeId], references: [id])
  comments    TaskComment[]
  
  @@map("tasks")
  @@index([projectId])
  @@index([status])
  @@index([assigneeId])
  @@index([dueDate])
}

// User Management with NextAuth.js integration
model User {
  id            String    @id @default(cuid())
  name          String?
  email         String    @unique
  emailVerified DateTime?
  image         String?
  role          UserRole  @default(STAFF)
  venueId       String?
  createdAt     DateTime  @default(now())
  updatedAt     DateTime  @updatedAt
  
  // NextAuth.js relations
  accounts      Account[]
  sessions      Session[]
  
  // Application relations
  venue         Venue?              @relation(fields: [venueId], references: [id])
  assignedTasks Task[]
  sentMessages  Message[]
  
  @@map("users")
}

// Enums
enum ContactStatus {
  UNQUALIFIED
  PROSPECT
  LEAD
  QUALIFIED
  CUSTOMER
  LOST
}

enum LeadSource {
  WEBSITE
  FACEBOOK
  INSTAGRAM
  LINKEDIN
  REFERRAL
  DIRECT
  OTHER
}

enum ProjectStatus {
  ACTIVE
  COMPLETED
  CANCELLED
  ON_HOLD
}

enum TaskStatus {
  TODO
  IN_PROGRESS
  ON_HOLD
  COMPLETED
}

enum UserRole {
  ADMIN
  SALES
  PROJECT_MANAGER
  STAFF
  CLIENT
}
```
