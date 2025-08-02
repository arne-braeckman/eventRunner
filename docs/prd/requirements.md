# Requirements

## Functional

* **FR1: Contact & Lead Management (Expanded Detail)**

    The system must provide a centralized database of all leads and clients, storing comprehensive rich data, displaying dynamic visual indicators for customer journey status and 'lead heat', and linking directly to opportunities.

    * **Rich Data Fields:** Beyond basic contact information, the database must securely store:
        * Lead source.
        * Associated social media accounts.
        * History of past events they have participated in that the venue organized (if any).
        * History of past events they have organized *with* the venue (if any).
        * Standard contact details: full name, address, email, and phone number, clearly distinguishing between personal and work contacts.
        * Geographic location (city/region).
        * Preferred event type interest.
        * Specific source details (e.g., campaign, referral).
    * **"Lead Heat" Determination & Visuals:** Lead heat must be determined by a configurable calculation algorithm with a weighted score based on specific interaction types and frequencies:
        * Following on any social platform.
        * Liking a social media post.
        * Attending an organized event.
        * Asking for more information (direct inquiry).
        * Requesting a price quote.
        * Participating in a site visit tour.
        * Having organized an event with the venue previously.
        * The system must display an intuitive icon visually representing the lead heat based on pre-defined score tiers.
    * **Customer Journey Milestones (Status Tracking):** The system must accurately track and visually represent the following distinct stages in the customer journey:
        * **Unqualified:** The contact is unknown, or interaction has been minimal and indirect (e.g., social media likes without direct engagement).
        * **Prospect:** The contact is aware of the venue (e.g., following on social media), but no direct engagement has occurred.
        * **Lead:** Direct interaction has occurred, and the contact has actively asked for more information.
        * **Qualified:** There is explicit interest demonstrated, and a formal proposal has been drafted and sent.
        * **Customer:** An agreement has been signed.
        * **Lost Deal:** The customer has turned down the offer; they should be moved back to the prospect stage for potential future re-engagement or to an unwanted/inactive list.
    * **Key Information for Linked Opportunities:** When an opportunity is linked to a contact, the following critical information must be immediately accessible and visible from the contact's record:
        * Type of event (e.g., wedding, company event, personal family event, personal party, corporate event, press conference, with the ability for users to define custom event types).
        * Estimated number of guests.
        * Estimated value of the event.
        * Indication of whether catering services are required.
        * Support for additional custom fields as needed for specific event details.
    * **Centralization of Lead Sources:** The system must utilize APIs or web scrapers to capture information from social media pages (Facebook, Instagram, LinkedIn). It must include integrations for bi-directional synchronization of direct messages (DMs) or private messages from Facebook, WhatsApp, Instagram, and LinkedIn. It must have the capability to transfer chats from these platforms directly into the system, providing a unified view. Furthermore, it needs a clear way to visualize who is being communicated with and on which platform, directly from the contact record. The system will attempt to match Google Analytics website visit data to contacts originating from social media to raise their lead heat score.

* **FR2: CRM Sales Pipeline Management (Expanded Detail)**

    The system must offer a highly customizable Kanban pipeline for opportunity management, with dynamically enforced configurable required fields per stage, enabling deals to progress seamlessly from lead to closed sale.

    * **Customization Elements:** The Kanban pipeline must allow for comprehensive customization by administrative users, including:
        * Defining and renaming column names to reflect specific opportunity stages.
        * Controlling the number and order of columns (opportunity stages).
        * Specifying information fields that an admin can choose to make required at each stage.
        * Setting up custom alert notifications triggered by defined criteria (e.g., stage progression).
    * **Configurable Required Fields per Stage:** The system must allow an admin to configure specific fields to become mandatory before an opportunity can progress to the next stage. For instance:
        * After the "Proposal Drafted" stage, the estimated price, estimated number of guests, and the customer-defined service options (e.g., catering requirements, open bar status, and other custom services) can be configured as mandatory.
        * A due date for planning must be required once the opportunity is qualified.
    * **Opportunity Card Information:** Each opportunity card within the Kanban board must prominently display key information at a glance, including:
        * Estimated revenue.
        * Date of planned event.
        * Number of guests.
        * Type of event.
        * An admin must be able to choose which of these fields (and other relevant data points) are visible on the Kanban card.
    * **Deal Progression & Conflict Management:**
        * The system must use **colored date indicators** to clearly communicate event date availability and conflicts:
            * **Default color of all text:** The date is free with no other opportunities currently targeting it.
            * **Yellow:** The date is free, but more than one opportunity is currently targeting it, indicating potential competition.
            * **Red:** The date is already taken by a booked event, highlighted with a notification, following a "first come, first served" principle.
        * The system must alert the user if there are other opportunities with the same target event date, and highlight in red with a notification if an event is already definitively booked on that date.
        * The system will allow the venue to assign specific rooms to an opportunity, and this room assignment will be factored into date conflict detection. This will be a manual required field. A fourth color indicator will be introduced for scenarios where multiple opportunities target the same date but are assigned to *different* rooms. For "private venue hires," an admin-configurable option will allow a single room booking to mark *all* rooms as booked for that day.
        * The system will allow venue administrators to manually block out specific days for non-event reasons (e.g., renovations, staff holidays), ensuring these dates appear as "Red" (booked) on the calendar.
        * The system will implement a set number of **retries** for outbound messages or sync attempts. If the problem persists after retries, it will **prompt a descriptive error message** to the user.
        * The system will incorporate **health checks for external APIs**. If no new information is received within a predefined period, it will **prompt the user to manually check their social media** or external communication channels for missed messages.
        * New requirements for a specific stage will only be triggered when an opportunity is *moved into* that stage. If a user attempts to move an opportunity to a stage where required fields are missing, the system will prevent the move and immediately display an **editable pop-up form** highlighting all the missing required fields. If the information is filled in, the card will move to the target stage. If the user cancels the input, it will move back to the stage it came from.
    * **Sales Metrics Integration:** Sales insights and performance metrics can be presented on a separate dedicated page or integrated into a broader reporting module. However, the total estimated revenue aggregated per sales stage must be prominently visible directly within the CRM Pipeline module for quick overview.

* **FR3: LLM-Powered Assistant (Tiered Detail)**

    The system must offer a tiered approach to intelligent assistance, providing foundational rule-based automation in a basic tier and enhanced LLM-powered capabilities in higher tiers.

    * **Basic Tier (Rule-Based Assistance):**
        * The system must provide basic note processing (e.g., keyword extraction or simple template-based summarization) for all information logged to a contact and an opportunity.
        * It must offer sales suggestions based on predefined "if-then" logic and heuristics (e.g., "IF proposal sent > X days AND no response, THEN suggest 'Follow up call'").
        * **User Interaction:** These features will operate passively or upon explicit user request.
    * **Higher Tiers (LLM-Enhanced Assistance):**
        * The system must include an LLM-powered assistant that **enhances** the basic rule-based logic for note summarization and sales suggestions within the CRM and sales pipeline.
        * **LLM Model & Training:** The system will utilize **open LLM models with specific instructions**. There will be **no user training or feedback mechanism** to improve the LLM's output within the system.
        * **LLM Note Summarization Specifics:**
            * The LLM must be capable of summarizing all information logged to a specific contact and associated opportunity. This includes meeting notes, call logs, email threads (from FR8), internal chat transcripts (from FR15), and long-form text entries.
            * Summaries should be presented in a concise bullet-point format, specifically highlighting key decisions and actionable items.
            * Summaries will be generated only upon explicit user request, ensuring on-demand relevance.
            * The LLM is expected to intelligently identify and indicate when slang or highly technical jargon is not fully understood, or when conflicting information is present within the notes, mirroring how a human might report such findings.
            * To ensure privacy and GDPR compliance, the system will enforce the use of **paid LLM services which have necessary privacy controls baked in**.
        * **LLM Sales Suggestions Specifics:**
            * The LLM must provide specific, actionable sales suggestions, including: identification of potential deal risks, recommendations for next best steps to strategically move clients to the subsequent sales stage, and proactive notifications to the user about new social interactions (e.g., likes, comments, shares) with the venue's social media platforms when the client is in an active opportunity stage, followed by suggestions for personalized next steps based on these interactions.
            * To generate these suggestions, the LLM will leverage a comprehensive data set comprising social history, current lead heat (from FR1), pipeline stage (from FR2), and all historical data within the database. It must prioritize time-sensitive new interactions once a contact transitions into the opportunity stage. The LLM model will require **good localized training data** to ensure culturally appropriate and relevant suggestions.
            * Suggestions will be presented in a dedicated AI recommendation panel that appears contextually when an opportunity card is opened in the CRM pipeline.
        * **LLM User Interaction & Quality Control:**
            * Proactive LLM functions (e.g., social interaction notifications) will be primarily triggered by new social activity when a contact is within the sales or opportunity pipeline, or during the process of creating a "hot lead" indicator. For all other functions, such as general note summarization, the LLM will operate passively and activate only upon specific user request.
            * All suggestions provided by the LLM must be clearly and distinctly marked as AI-generated.
            * All AI-generated data (including summaries and suggestions) must be **removable by the user after generation**.
            * The LLM will **not directly interact with or analyze the content of social media comments**. Its measurement of social interaction will be limited to tracking explicit actions like follows, likes, and general comment interactions (without semantic analysis of the comment's content itself) to inform lead heat and triggers.
            * When activating AI features that process social or other personal data, the system must require a **formal consent form**. This form will clearly state the usage rights of the data and any associated risks, which must be explicitly accepted by the user before the AI model can be activated for that data.

* **FR4: Document & Contract Management (Expanded Detail)**

    The system must facilitate the generation and management of document templates linked to specific services; include e-signature capability, user-managed version history, configurable access controls, and secure sharing mechanisms linked to clients and projects.

    * **Document Template Generation & Linking:**
        * Document creation can be initiated either through a **drag-and-drop builder** or by generating documents automatically **from pre-defined templates**.
        * Users can select a specific service to automatically create a document from its linked template, or they can drag and drop a custom document into the system and assign the correct service label to it.
        * Common document types supported initially include **proposals, invoices, and sales literature**. The system must be extensible to allow for the addition of all types of documents once a customer is onboarded into the client portal (FR6).
    * **E-signature Capability:**
        * The system must integrate with a reputable third-party e-signature provider, specifically **DocuSign or a similar, legally equivalent alternative**.
        * Signed documents will be automatically attached to the relevant customer record and clearly labeled as "signed contract" within the system. These signed contracts will later be accessible within the customer portal (FR6).
    * **Version History:**
        * Version history functionality will be provided for **custom uploaded documents** managed through the drag-and-drop builder.
        * Users will be responsible for distinguishing between different versions of a document by adhering to their own **naming conventions** (e.g., adding version numbers to filenames).
    * **Access Controls & Secure Sharing:**
        * Admins can assign signature privileges to specific users within the venue staff.
        * In this initial phase, before the dedicated customer portal (FR6) is available, document sharing with clients is facilitated directly through the **DocuSign integration** or via **email**.
    * **Integration with Other Modules:**
        * Documents (e.g., proposals) can be directly assigned to **opportunities** (FR2) within the CRM pipeline.
        * Documents can be shared with clients via email. If email integration (FR8) is available, the sent email communication can be automatically attached to the opportunity/contact record; otherwise, a designated mail address will be linked for tracking.
        * **No direct link to the payment module (FR5) is needed** for automatic invoice generation; invoices will be managed as a specific document type within this module.

* **FR5: Payment Management (Expanded Detail)**

    The system must support flexible down payments and staged billing, integrate with key payment gateways, and enable clear, automated payment requests to ensure timely revenue realization.

    * **Down Payments & Staged Billing Configuration:**
        * Down payments must be configurable as a **variable amount**.
        * Staged billing should default to being **milestone triggered** and seamlessly integrated into the default templates. The amount for each stage must be configurable in the system settings and overridable at the individual project creation level.
        * Payment schedules must be **customizable per client/event**.
        * Automated reminders for upcoming payments should be handled by the system, with the **number of days before a milestone** being the default trigger for these reminders.
    * **Payment Gateway Integration Details:**
        * Integrations with **Bancontact and Payconiq** are essential defaults in Belgium and must be made available alongside PayPal, Stripe, and KBC.
        * All integrations must adhere to **default payment security and processing requirements** (e.g., secure transaction processing, real-time payment status updates, automatic reconciliation with internal records).
        * For payment processing, the system will primarily **redirect clients to the respective payment gateway's secure page**.
    * **Payment Request Mechanism:**
        * Payment requests sent via email or the customer portal (FR6) must comprehensively include the **amount, due date, a clear payment link, a QR code embedded with the payment link, relevant references, and a concise description**.
        * Payment requests must be **automatable** based on the defined payment schedule.
        * Payment statuses (e.g., paid, partially paid, overdue) must be tracked and displayed with a corresponding **visible label** for easy user comprehension within the system.
    * **Handling of Refunds, Partial Payments, and Disputes:**
        * For partial payments, the system must clearly **highlight any insufficient amount** received.
        * Payment **disputes and refunds are to be handled externally** to `eventRunner`. Their status within `eventRunner` will be manually tracked if necessary.

* **FR6: Project Link & Collaboration (Expanded Detail)**

    The system must provide a comprehensive shared workspace between venue staff and clients, centralizing collaborative tools and information, primarily accessible via a unique, project-specific link.

    * **Shared Workspace Access & Branding:**
        * Clients must access their dedicated shared workspace via a **unique, project-specific link** (rather than a general portal login). This approach simplifies access management and facilitates easier role-based permissions.
        * The workspace must support **customer branding**, allowing the venue's logo and primary colors to be applied following a specific template, ensuring a consistent brand experience.
    * **Collaborative Rich-Text Chat:**
        * This component will function as a **real-time chat window using rich text**, displaying sequential chat messages and maintaining a comprehensive history (emulating WhatsApp, Teams chat, or Messenger chat interactions).
        * For chat history, **version management will not be included**; users will manage content and decisions within the chat. The chat history is intended to be isolated within its correct project.
        * The chat feature will be integrated with the LLM (FR3) to allow users to be prompted with **summaries of chat conversations upon request**.
        * The dedicated document space within the workspace will specifically house a **drag-and-drop builder** (from FR4) for new documents and a structured list displaying all previously shared and relevant documents.
    * **File Upload/Storage Details:**
        * The system will support **default file formats** without specific initial requirements for file types or size limits.
        * Signed contracts (from FR4) will be **automatically added** to the relevant project within the workspace once the project is created, ensuring easy access for the client.
    * **Kanban Board Functionality (Client View):**
        * Clients (customers) will have **view-only access to all project tasks** displayed on the Kanban board and the ability to **comment on tasks**. They **cannot create new tasks** directly and must communicate new task requests to the venue staff via the general chat.
        * Venue staff can mark specific tasks as "internal" via a **checkbox** (validated in code), ensuring these tasks are visible only to internal venue personnel (identified in general settings).
        * All tasks must have an **assigned owner** clearly indicating responsibility.
        * **Due date, assigned person, and task title** should be prominently visible on each task/subtask card.
        * Tasks will use **four default statuses**: To-Do, In Progress, On Hold, and Completed. These can serve as the default Kanban board "buckets."
        * The system must allow for the creation of **custom buckets/columns** to accurately resemble specific stages of a project, providing flexibility similar to Trello.
    * **Real-time Chat & Comment Threads:**
        * The in-house chat system must support **@mentions** to direct communication to specific individuals.
        * The chat owner (venue staff) can **add staff members to the chat**, transforming it into a group chat for the entire project team.
        * Comments are directly **connected to specific tasks** for contextual discussions.
    * **Client Notifications:**
        * The system must allow for all types of project-related activities to generate notifications.
        * Both the **customer and the user (venue staff) must be able to customize** the specific notifications they want to receive (e.g., new messages, task updates, approaching deadlines) and how they want to receive them (e.g., in-app within the workspace, email alerts from FR9, SMS from FR9).
    * **Third-Party Vendor Involvement:** Direct integration and management of third-party vendors within the customer-facing project workspace will not be a functional requirement for the initial MVP; it is considered a future "nice to have" as it depends on vendor system compatibility and willingness to adopt the tool.

* **FR7: Multi-User Roles & Customization (Expanded Detail)**

    The system must robustly support a multi-user role architecture, enabling granular permission assignments and extensive administrative customization across modules and tool branding.

    * **Default System Roles & Permissions:** The system must come with the following predefined roles, each with a set of default permissions:
        * **Admin:** Full access (view, create, edit, delete, assign, sign, configure) across all modules including Contact & Lead Management (FR1), CRM Sales Pipeline (FR2), Document & Contract Management (FR4), Payment Management (FR5), Project Link & Collaboration (FR6), Centralized Communication Integrations (FR8), Notifications System (FR9), Onboarding Wizard (FR10), Robust Analytics & Reporting (FR11), Project Automation (FR13), Proposal Tracking & Visibility (FR14), and Event-Specific Communication Workflow (FR15). Admins have full user management capabilities.
        * **Sales:** Primarily focused on lead and sales activities.
            * **FR1 (Contact & Lead Mgmt):** View all contacts/leads, create new, edit assigned, manage lead heat.
            * **FR2 (CRM Sales Pipeline):** View all pipelines, move opportunities, edit opportunity details.
            * **FR4 (Document & Contract Mgmt):** View documents, upload sales-related documents (e.g., proposals, sales literature), send for e-signature.
            * **FR5 (Payment Mgmt):** View associated client payment statuses and requests.
            * **FR8 (Comm Integrations):** Utilize integrations for sales communications (e.g., email, social chats).
            * **FR9 (Notifications):** Receive and customize sales-related notifications.
            * **FR11 (Analytics):** View sales-specific reports.
            * **FR14 (Proposal Tracking):** View and update proposal statuses.
            * **FR15 (In-house Chat):** Participate in client chats for sales-related discussions.
        * **Project Manager:** Primarily focused on event planning and delivery.
            * **FR1 (Contact & Lead Mgmt):** View associated client contacts for assigned projects.
            * **FR4 (Document & Contract Mgmt):** View project documents, upload event-related documents, manage templates (use pre-defined templates).
            * **FR5 (Payment Mgmt):** View associated client payment statuses for assigned projects.
            * **FR6 (Project Link & Collaboration):** Full management capabilities for assigned projects (view, edit tasks, assign tasks, manage files, chat).
            * **FR9 (Notifications):** Receive and customize project-related notifications.
            * **FR12 (Third-Party Vendor Mgmt - future):** If implemented, view vendor information and assign tasks to vendors.
            * **FR15 (In-house Chat):** Participate in client and internal project chats.
        * **Staff:** Operational roles with limited, assigned access.
            * **FR1 (Contact & Lead Mgmt):** View assigned contact details for specific events.
            * **FR6 (Project Link & Collaboration):** View assigned tasks, update task status, participate in chat for assigned projects.
            * **FR9 (Notifications):** Receive assigned task notifications.
            * **FR15 (In-house Chat):** Participate in assigned project chats.
        * **Client:** External, limited view-only access primarily for project collaboration.
            * **FR6 (Project Link & Collaboration):** View project details, view tasks on Kanban board (without creating), comment on tasks, view shared files, participate in real-time chat.
            * **FR4 (Document & Contract Mgmt):** View signed contracts relevant to their project.
            * **FR5 (Payment Mgmt):** View their payment statuses and requests.
            * **FR9 (Notifications):** Receive and customize project-related notifications.
    * **Administrative User Management:** Administrators must have the capability to:
        * Invite new users to the system.
        * Assign and change user roles.
        * Deactivate or archive user accounts.
        * Reset user passwords.
    * **Extensive Customization Scope (Admin-Configurable):** Beyond basic pipeline stages, templates, and Kanban columns (as defined in FR2, FR4, FR6), administrators must be able to customize:
        * **Custom fields:** Across various modules (e.g., contacts, opportunities, projects).
        * **Default notification settings:** For different user roles and event types.
        * **Labels:** For categorization and organization within the system.
        * **Venue Room Configuration:** The ability to add and manage rooms within the venue (implying a 'Venue Management' or 'Availability' setting) to be factored into event planning and date conflict management (FR2).
        * **Integration settings:** For various third-party communication and payment providers.
        * **Customer portal layout branding:** Specific to individual project workspaces (FR6).
        * **Overall tool branding:** Applying the venue's brand elements across the entire `eventRunner` interface.
        * All configurable elements should be accessible and manageable within dedicated admin settings.
    * **Custom Role Creation & Granular Permissions:** The system's core capability must allow an **admin to create custom roles** and assign highly specific permissions *within* each module. This enables tailored access control, ensuring, for instance, that a "Sales" custom role only sees sales-related modules and specific functions, while a "Project Operations" role only sees project-related modules and their associated permissions.

* **FR8: Centralized Communication Integrations (Expanded Detail)**

    The system must centralize and synchronize communication streams by integrating with external platforms to provide a unified view of all client interactions, enabling a seamless transition to an in-house project chat system.

    * **Integration Scope & Data Flow:**
        * The system must capture and centralize **as much interaction data as possible** from integrated external platforms.
        * It must utilize APIs for **real-time, bi-directional synchronization** of messages and interactions between `eventRunner` and these platforms.
        * All centralized communications must be primarily visible on the **contact page**, with the capability to link or integrate this communication history with the corresponding opportunity stage.
        * The in-house chat (FR15) will be a standalone chat instance, specifically initiated upon project creation.
        * **Failure to Send/Sync (Outbound):** The system will implement a set number of **retries** for outbound messages or sync attempts. If the problem persists after retries, it will **prompt a descriptive error message** to the user, indicating the failure.
        * **Failure to Pull (Inbound):** The system will incorporate **health checks for external APIs**. If no new information is received within a predefined period, it will **prompt the user to manually check their social media** or external communication channels for missed messages.
    * **Specific Platform Prioritization:**
        * Initial social media integrations will prioritize **Facebook, Instagram, and LinkedIn**.
        * Messaging integration will be handled via **WhatsApp**.
        * Web form submissions will continue to be integrated for lead capture.
    * **Email Integration Details:**
        * The system must support **sending emails directly from the venue's custom email domains**.
        * To manually link external email communications, the system will enable the creation of **unique email addresses for opportunities or chats** that can be added as BCC addresses in external email clients (e.g., Outlook, Gmail), thus manually associating the message with the correct contact or opportunity.
    * **Softphone Integration Details:**
        * **SMS integration is not required**; WhatsApp integration will serve this purpose.
        * The system must provide **click-to-call functionality** that leverages any softphone application installed on the user's system (e.g., Teams, 3CX).
        * Users must have the option to manually log call details into the contact page or opportunity record.
    * **Communication Shift to In-house Chat (FR15):**
        * The shift to the in-house project chat system is initiated upon **project creation** and is included as part of the project invite sent to the client.
        * No direct knowledge transfer mechanism is needed as a separate stage when shifting to the in-house chat. However, to provide context, the system will include a **"Summary on Demand" button** (integrated with LLM from FR3) that summarizes customer information provided during the sales stage.
        * **API Changes:** `eventRunner` will aim to centrally manage and update its configurations to adapt to external platform API changes. If direct, central updates are not possible, the system will **communicate necessary configuration changes** or provide guidance to venue owners on how to adapt their setup.
        * **Authentication Expiry:** Authentication expirations or re-authentication requirements will be **clearly communicated** to the user. Alternatively, this may be handled through **paid services** (e.g., managed integration services) that abstract away such complexities.
        * **Client Preference for External Communication:** The system will allow the venue owner to choose whether to comply with a client's request to continue external platform communication. However, it will **clearly highlight to the venue owner the loss of specific `eventRunner` functionalities** (e.g., direct task linking in FR6, LLM summarization in FR3) and the increased operational overhead that results from not shifting to the in-house chat. This is presented as part of the cost of doing business.

* **FR9: Notifications System (Expanded Detail)**

    The system must deliver automated, highly customizable notifications for various project activities to ensure timely and relevant communication for both venue staff and clients, supporting a proactive workflow.

    * **Notification Triggers & Content:**
        * The system must be capable of generating all types of notifications based on the current scope of the project, including for task assignments, tasks due soon, overdue tasks, payment requests, overdue payments (from FR5), contracts due for signature (from FR4), new messages in project chat (from FR6/FR15), lead heat changes (from FR1), and pipeline stage changes (from FR2).
        * Each notification must be explicitly categorized by its **type** (e.g., "action" requiring a response, or "informational").
        * A concise **description** of the notification's purpose or content must be provided where possible.
        * The **timing of the notification trigger** (e.g., X days before a due date, immediately upon an action) must be configurable by an admin.
        * A **direct link** to the specific task, opportunity, or other field that has triggered the notification must be included to facilitate immediate action or context.
        * Key information included will dynamically adapt to the trigger type (e.g., task name, due date, assigned to for tasks; amount due, due date, payment link for payments).
    * **Delivery Channels & Customization:**
        * **In-app notifications** will be available for all notification types and will be the primary channel for all activities.
        * **Email notifications** will be the default for all actionable notifications.
        * Users (venue staff) and customers (clients) must have the ability to override the default notification settings and customize which types of notifications they receive, through which channels, and at what frequency.
        * Notification delivery options will include: **silent in-app notifications** (displayed in a dedicated center without immediate sound/pop-up), **push in-app notifications** (with immediate visual/sound alerts), and **push email notifications**.
        * An option to add a **daily digest email** will be available for a summarized overview of activities.
        * A "do not disturb" or quiet hours setting is explicitly **not required**.
    * **In-app Notifications Details:**
        * In-app notifications will be displayed in a dedicated notification center, likely accessible from the main navigation, with a badge indicator for unread notifications.
        * Users must be able to manage these notifications (e.g., mark as read, archive, dismiss).
    * **Admin Configurability:**
        * Admins (from FR7) must have the capability to define new custom notification types, set default triggers for the entire organization, and customize the templates for email and in-app notifications.
        * They should also manage integration settings for SMS/WhatsApp gateways (from FR8) that facilitate notification delivery.
    * **Audit Trail/History:**
        * The system must maintain a comprehensive history or log of all notifications sent, linked to the specific user, contact, opportunity, or project that triggered or received the notification.

* **FR10: Onboarding Wizard (Expanded Detail)**

    The system must provide a flexible onboarding wizard for new venue staff users and clients, offering distinct, tailored experiences to facilitate efficient initial setup and understanding.

    * **Target Users & Journey Customization:**
        * New **venue staff users** will have the option for: **guided training** (within the wizard), **in-house training** (materials for internal use), or **external training** (referencing external resources) for the entire `eventRunner` system.
        * New **clients** will receive a **guided experience** exclusively focused on the **project management module (FR6)** and the **in-house chat (FR6/FR15)**. The venue owner retains the option to opt-out of this guided experience for clients.
        * The onboarding process for either staff or clients operates as an **all-or-nothing** choice: if a guided experience is selected, it must be completed; otherwise, it is opted out of entirely.
        * The onboarding journey will **not be customized** based on the user's assigned role (beyond the staff/client distinction) or the client's project type.
    * **Key Setup Steps/Content:**
        * For new **venue staff users**, the wizard should strictly highlight **default user interactions**, explicitly excluding any admin-related setup or configuration options.
        * For new **clients**, the wizard should solely focus on highlighting their **default user interactions** pertinent to the project management module and in-house chat.
    * **Guidance & Interaction:**
        * The wizard should primarily provide **step-by-step contextual guidance** accompanied by **progress indicators**.
        * More detailed video tutorials can be linked to *after* the completion of the basic step-by-step guide.
        * The onboarding wizard is designed to operate independently and should **not be integrated** with a human Service Delivery Manager (SDM) or an AI chat-based system; these are considered separate, optional services chosen during the buying process.
        * The wizard must allow users to skip steps and return later to complete the process.
    * **Completion & Beyond:**
        * Successful completion of the onboarding process is marked by either the user **finishing the step-by-step guide** or **dismissing it**.
        * Upon completion, a **link to a knowledge base** with more detailed videos should be presented, along with a **request for training link** for further support options.
        * **User Engagement & Completion Edge Cases:** If a user skips steps or dismisses the tutorial prematurely, they will be considered to have opted out of the guided experience. The system will not provide intrusive reminders; users will then be responsible for learning on their own or requesting professional services. If users consistently dismiss the wizard, the system will not enforce completion or provide alternative, system-driven guidance for critical uncompleted tasks, reinforcing the "all-or-nothing" principle.
        * **Content Maintenance & Outdated Information Edge Cases:** Responsibility for updating the content of the step-by-step guide and linked video tutorials lies with the product team. Each significant update or new feature shipped will necessitate the creation of a new, corresponding tutorial, and the same principle will apply to the knowledge base.
        * **Client Opt-Out Experience Edge Cases:** When a venue owner "opts out" of the guided experience for a new client, the system itself will not provide alternative initial guidance upon client access to the project link. The venue owner assumes full responsibility for the client's onboarding experience in this scenario. At best, `eventRunner` could provide a generic welcome video that venue owners can choose to share with their clients externally.

* **FR11: Robust Analytics & Reporting (Expanded Detail)**

    The system must offer robust analytics including sales pipeline/funnel, payment tracking, Kanban analytics, and customizable KPIs, providing insights on tasks, project statuses, and pipeline values to empower data-driven decisions.

    * **Dashboard & Reporting Views:**
        * Analytics will be presented in a dedicated **report section** with distinct tabs representing different modules.
        * Key module tabs will include: **Leads, Sales, Pipelines, Touch points with customers, Projects, and Payments**.
        * Dashboards will **not be customizable** in the initial phase, but **filtering options** must be included for data segmentation.
        * Customer Acquisition Cost (CAC) will **not be relevant** in the dashboard and will be excluded from the scope of analytics in the initial phase.
    * **Sales Pipeline/Funnel Analytics (from FR1, FR2):**
        * Relevant dashboards for sales will include:
            * **Sales Overview Dashboard:** Displaying total estimated revenue in the pipeline, number of deals by stage, and high-level conversion rates between stages (from FR2).
            * **Lead Performance Dashboard:** Tracking lead source performance (from FR1) and lead-to-opportunity conversion rates.
            * **Pipeline Velocity:** Showing average time opportunities spend in each stage.
            * **Lost Deal Analysis:** Summarizing reasons for lost deals.
        * Timeframe options for sales reports should include: **Daily, Weekly, Monthly, Quarterly, Yearly, and Custom ranges**.
    * **Payment Tracking Analytics (from FR5):**
        * Crucial payment metrics will include: **total collected revenue, outstanding payments, overdue payments, payment installment completion rates, and revenue breakdown by event type or service**.
        * Reports must offer **filter options** for these metrics, including filtering by specific payment gateways (from FR5).
    * **Kanban Analytics (from FR6):**
        * Key insights for project Kanban boards will include: **number of running projects, expected completion versus real completion of tasks and due dates**.
        * Analytics on **tasks per owner** and **tasks per status** will be provided.
        * It is explicitly stated that **no time tracking** is needed for Kanban board analytics.
        * Task reports within Kanban analytics will be **available only to venue staff**.
    * **Customizable KPIs:**
        * While CAC is excluded, administrators (from FR7) should have the ability to define and track other customizable KPIs. Initial examples could include: average deal closing time, average project duration, or client satisfaction scores.
    * **Real-time Insights & Drill-down:**
        * Insights will be provided as a **daily snapshot**, with a **manual sync trigger** available to refresh data.
        * **No drill-down functionality** is needed initially, but it could be considered an option for future development.

* **FR12: Third-Party Vendor Management**

    The system must enable the involvement of third-party vendors (e.g., caterers, sound) and preferred partners into the project plan; facilitate crucial information sharing among all stakeholders. Direct integration and management of third-party vendors within the customer-facing project workspace will not be a functional requirement for the initial MVP; it is considered a future "nice to have" as it depends on vendor system compatibility and willingness to adopt the tool.

* **FR13: Project Automation**

    The system must offer automations such as automatically figuring out lead times from the day of first entry to the event due date and planning project items accordingly; enable relationship-centric triggers for automation.

* **FR14: Proposal Tracking & Visibility**

    The system must provide mechanisms to track proposals and ensure clear visibility of their follow-up status, preventing missed opportunities due to unresponsiveness.

* **FR15: Event-Specific Communication Workflow**

    The system must manage a communication channel shift from external methods to an in-house chat system for post-agreement project-related discussions, with all information linked to the project board.

## Non Functional

* **NFR1: Deployment Flexibility:** The system must support multi-tenant SaaS deployment while also offering the option for standalone deployments configurable per client.
* **NFR2: Performance & Responsiveness:** The system must deliver a highly responsive user interface and efficient backend processing to ensure a smooth user experience, even under peak loads.
* **NFR3: Security & Data Protection:** The system must implement robust security measures, including data encryption (at rest and in transit), granular access controls, and strict adherence to European data privacy regulations (e.g., GDPR) to protect sensitive client and event data.
* **NFR4: Scalability:** The system must be scalable to accommodate growth in user base, number of events, and data volume without significant degradation in performance.
* **NFR5: Reliability & Availability:** The system must maintain high levels of reliability and availability, minimizing downtime and ensuring continuous access to critical functionalities.
* **NFR6: Usability & Intuition:** The system must provide an intuitive and easy-to-use interface, minimizing the need for extensive technical expertise for both venue staff and clients.
