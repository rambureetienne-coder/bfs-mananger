# Project Specification: FS-Manager (Formula Student Management System)

## 1. Project Overview
The goal is to build a comprehensive Project Management and ERP system tailored for Formula Student (FS) teams. The system must handle engineering workflows (BOM, mass tracking), business operations (sponsorship, budget), and classic project management (Gantt, Tasks).

## 2. Tech Stack Recommendations
- **Frontend:** React.js or Next.js (App Router), Tailwind CSS, Shadcn/UI.
- **Backend:** Node.js (Express/NestJS) or Python (FastAPI).
- **Database:** PostgreSQL (Relational data is crucial for BOM).
- **Authentication:** Clerk or NextAuth.js.

## 3. Core Modules & Features

### A. Task & Timeline Management
- **Interactive Gantt Chart:** Visualization of the critical path (Chassis -> Assembly -> Testing).
- **Sub-system Workspaces:** Dedicated boards for Chassis, Aerodynamics, Powertrain, Electronics, and Business.
- **FS Milestones:** Preset deadlines for official competition documents (SES, IAD, VSA, etc.).
- **Kanban Boards:** Drag-and-drop tasks with priority levels and "Technical Difficulty" tags.

### B. Engineering & BOM (Bill of Materials)
- **Centralized BOM:** - Columns: Part ID, Name, Sub-system, Material, Manufacturer, Cost, Weight.
    - Status tracking: Designed, Ordered, In Manufacturing, Received, Assembled.
- **Live Mass Ledger:** A dashboard calculating total vehicle mass (Estimated vs. Real) with a progress bar towards the target weight.
- **CAD Integration:** URL fields for Onshape/SolidWorks/CATIA web viewers or folder links.

### C. Sponsorship & CRM
- **Sponsor Pipeline:** Tracking phases from "Initial Contact" to "Contract Signed."
- **Benefit Tracker:** Ensure promised logos are placed on the car/website/suits.
- **Resource Management:** Inventory of sponsored parts (e.g., tires, sensors, fluids).

### D. Budget & Procurement
- **Purchase Request (PR) Workflow:** - Members submit a request with a link and price.
    - Financial Lead approves/denies.
    - Automatic deduction from the sub-system's budget.
- **Financial Reporting:** Real-time chart of spent vs. remaining budget.

### E. Knowledge Base & Rules
- **Rulebook Wiki:** Categorized storage for FS rules with internal links to design choices.
- **Testing Logs:** Database to record track day results, sensor data, and driver feedback.
- **Scrutineering Checklist:** Digital version of the competition's technical inspection sheets to ensure compliance before the event.

## 4. Data Model (High-Level)
- **Users:** ID, Name, Role (Admin, Lead, Member, Alumni), Sub-system.
- **Tasks:** ID, Title, AssignedTo, Deadline, DependencyID, Status.
- **Parts (BOM):** ID, Name, Weight, Cost, Material, Status, OwnerID.
- **Transactions:** ID, Amount, Description, Category, ApprovalStatus.

## 5. UI/UX Requirements
- **Dashboard:** "Countdown to Competition" timer, upcoming deadlines, and weight summary.
- **Responsive Design:** Must work on tablets/phones for workshop use.
- **Performance:** Fast filtering for large tables (BOM can have 500+ items).
- **Dark Mode:** Standard for engineering tools.

## 6. Implementation Instructions for AI (Cursor)
- Use **PostgreSQL** for all relational data between Parts and Tasks.
- Prioritize **Type Safety** with TypeScript.
- Implement a **modular folder structure** (e.g., `/modules/bom`, `/modules/tasks`, `/modules/finance`).
- Ensure all tables have **export/import functionality** (CSV/Excel) for competition document submission.
