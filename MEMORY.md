# **Memory \- SaaS Project Management App**

*Last updated: Project Kick-off*

## **Memory**

* **Project Core** \- A production-style mini project management SaaS (Linear, ClickUp, Asana clone). The primary focus is backend architecture, scalability, maintainability, relational data modeling, and permissions. (added at kick-off)  
* **Tech Stack Locked** \- Next.js \+ TypeScript, Node.js API/Server actions, PostgreSQL, Prisma ORM. (added at kick-off)  
* **Authentication** \- JWT or session-based. Must include signup, login, logout, password hashing, forgot password flow, and protected routes. (added at kick-off)  
* **Multi-Tenant Architecture** \- Organizations/Workspaces are the root boundary. Users create orgs, invite members via email. All project/task data must be strictly isolated by organization. (added at kick-off)  
* **RBAC Matrix** \- Enforced at the API level:  
  * **Owner**: Can delete projects, manage billing (if applicable).  
  * **Admin**: Can invite/remove users.  
  * **Member**: Can create/edit tasks.  
  * **Guest**: Can only view assigned tasks. (added at kick-off)  
* **Data Model Core Entities**:  
  * **Projects**: name, description, status, createdBy, timestamps.  
  * **Tasks**: title, description, status, priority, due date, labels/tags, assignee, attachments, subtasks, comments, activity history.  
  * **Relationships**: Tasks \-\> Projects, Tasks \-\> Orgs. Many-to-many for labels, comments, watchers. (added at kick-off)  
* **Audit & Activity Trail** \- Must track events (task created, updated, status changed, user invited, file uploaded) storing actor, action, timestamp, and metadata. (added at kick-off)  
* **Realtime Requirement** \- Live task updates, live comments, and typing indicators (architecture TBD: websockets, Server-Sent Events, or third-party like Pusher/Supabase realtime). (added at kick-off)  
* **No Faking Rule** \- Do NOT use mock data. Build real DB migrations, actual API logic, and production-ready abstractions. (added at kick-off)

## **Resolved Ambiguities**

* *None yet. To be populated as architectural decisions are made.*

## **Build State**

* Phase: **Pre-build / Initialization**  
* Status:  
  * Kick-off prompt provided.  
  * Core requirements documented.  
  * Database schema and folder structure pending initial creation.  
* Repo: Not yet initialized.

## **Open Decisions**

* \[ \] **State Management**: Zustand, React Query, or Next.js native cache? (Recommendation: React Query for server state, Zustand for client UI state).  
* \[ \] **Realtime Infrastructure**: WebSockets vs. Server-Sent Events (SSE) vs. third-party service (Pusher/Ably).  
* \[ \] **Authentication Provider**: Custom Auth implementation (Bcrypt/Jose) vs. Auth.js (NextAuth) vs. external provider.  
* \[ \] **File Storage**: Local abstraction initially, but needs an interface to swap out for AWS S3 / Cloudflare R2 easily.

## **Known Risks (carry forward)**

* **RBAC Complexity**: Ensuring every single query and mutation correctly validates the user's role against the specific Organization ID can lead to bugs if not abstracted into a reusable middleware/service.  
* **Realtime Syncing in Next.js**: Next.js Server Actions and API routes are stateless. Implementing true realtime (typing indicators) will require careful architectural planning outside standard request/response cycles.  
* **Database Performance**: The Activity Log / Audit Trail table will grow extremely fast. It must be indexed properly from the start.

## **Rules for Updating Memory**

Only update when explicitly instructed. Triggers: "remember this", "log this", "update memory", "capture this", "make a note", "save this", "don't forget".

Persistent by default. Entries stay until asked to remove them.

If a new entry contradicts an existing one, flag the conflict \- do not silently overwrite.