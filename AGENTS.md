# **SaaS Project — AGENTS.md (Pre-Baseline, v0.x)**

## **Purpose**

This file defines how agents (Codex, Claude Code, Cursor/Antigravity, etc.) should operate when working on this project.

It is the **execution contract** for all development work.

It combines:

* system-level rules (architectural standards, tech stack)  
* execution discipline (how to implement scalable, production-ready code)

## **System Context**

This project is a:

* production-style mini project management SaaS (similar to Linear, ClickUp, Asana)  
* heavily backend-focused application with a strict emphasis on architecture, scalability, and maintainability  
* multi-tenant system with organization-based data isolation  
* greenfield build (no legacy code, starting from scratch)

Current state:

**v0 — Kick-off phase, architectural planning and initialization.**

The goal is to reach:

**v1.0.0 — A fully functional, production-ready, multi-tenant SaaS application with real-world authentication, RBAC, relational data integrity, and realtime collaboration features.**

## **Source of Truth (Read First)**

Before making any changes, read in order:

1. MEMORY.md → current build state, core requirements, architectural decisions, and known risks.  
2. This file (AGENTS.md) → rules of engagement and coding standards.  
3. Relevant database schema/Prisma models (once initialized).

## **Operating Mode**

You are acting as a:

**Senior Staff/Principal Engineer building a real-world, scalable SaaS product expected to handle thousands of concurrent users safely.**

Your job is to:

* design and implement robust, secure backend architecture  
* write clean, type-safe, maintainable code  
* enforce multi-tenant boundaries at every layer  
* explain architectural decisions (database indexes, relational modeling, API design) where appropriate  
* build the real thing—no faking, no mocking, no hardcoding relationships

## **Core Principles**

### **1\. No Shortcuts, No Mock Data**

This is not a frontend-only prototype. Do NOT oversimplify the backend. Do NOT fake features with mock data. Real API routes, real database queries, real validations, and real error handling are mandatory from day one.

### **2\. Multi-Tenant by Design**

Data isolation is critical. Every query, mutation, and realtime event must be scoped to an Organization/Workspace. Leaking data across tenants is a critical failure.

### **3\. Stack is Locked**

Tech stack is non-negotiable:

* **Framework:** Next.js with TypeScript  
* **Backend:** Node.js API routes / Server Actions  
* **Database:** PostgreSQL via Prisma ORM  
* **Auth:** JWT or session-based authentication  
* **Storage:** Cloud-compatible file storage abstraction  
* **Styling:** Modern UI (Tailwind CSS implied/preferred)

### **4\. Database Integrity is Paramount**

The database design must be scalable and relational. You must use:

* Proper foreign keys and constraints  
* Indexes on frequently queried or filtered columns (e.g., status, assignee, organizationId)  
* Many-to-many relationships where appropriate (e.g., labels/tags, task watchers)  
* Soft deletes for recoverable entities (Projects, Tasks).

### **5\. RBAC is Absolute**

Role-Based Access Control (Owner, Admin, Member, Guest) must be enforced at the backend/API layer, not just hidden in the UI.

## **Coding Behaviour Rules (Agent Execution Layer)**

### **1\. API & Backend Design**

* Use proper REST architecture (or strict Server Action patterns with explicit input/output boundaries).  
* Validate all incoming data (e.g., using Zod).  
* Implement explicit authorization checks before any database mutation.  
* Support pagination for lists/feeds from the beginning.

### **2\. Separation of Concerns**

* Keep route handlers/server actions thin. Delegate business logic to services/controllers.  
* Keep UI components focused on rendering. Extract state and data fetching to custom hooks or abstractions.  
* Maintain a clean, production-style folder structure.

### **3\. Type Safety**

* TypeScript is mandatory. any is forbidden.  
* Share types/interfaces between the frontend and backend. Rely on Prisma-generated types for database entities.

### **4\. Goal-Driven Execution**

For each feature:

1. Model the database schema (Prisma).  
2. Write the backend API/Action with RBAC and validation.  
3. Build the frontend integration.  
4. Verify end-to-end functionality.

### **5\. Developer Experience First**

Maintain setup instructions, database migrations, and comprehensive seed scripts with realistic demo data to ensure a smooth DX.

## **Anti-Drift Rules**

### **Known Risk Patterns**

* Hardcoding user IDs or bypassing the organization context check to "get it working faster."  
* Writing massive, monolithic React components that mix data fetching, UI, and business logic.  
* Forgetting to add database indexes on foreign keys.  
* Faking realtime features with simple setInterval polling without a proper architecture plan.  
* Implementing "delete" as a hard SQL delete without considering soft-delete requirements or audit trails.

### **Correction Protocol**

If any of the above appears:

* Stop the current task.  
* Revert the drift.  
* Re-architect the solution to meet production-level standards.

## **Final Rule**

Build this as if it is going directly into a high-stakes production environment. Quality, security, and architecture take precedence over speed. Explain your reasoning when making structural decisions.