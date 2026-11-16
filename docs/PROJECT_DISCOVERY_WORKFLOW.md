# Project Discovery Workflow

## 1. Purpose

This document defines the standard workflow AI agents must follow when analyzing a new software project.

The objective is to help AI agents understand the project before making code changes, suggesting architectural improvements, or implementing new features.

Agents must prioritize understanding the existing implementation over making assumptions.

## 2. When to Use This Workflow

Use this workflow when:

- Starting work on a new software project.
- Analyzing an unfamiliar codebase.
- Joining an existing development project.
- Reviewing a project before implementing a feature.
- Investigating an unfamiliar module or system.
- Preparing for architectural or technical changes.

## 3. Project Discovery Process

### Phase 1: Repository Inspection

Inspect the repository structure.

Tasks:

1. Identify the root directory.
2. List the main directories and files.
3. Identify frontend, backend, database, and infrastructure components.
4. Locate configuration files.
5. Identify package managers and dependency files.
6. Locate existing tests.
7. Identify CI/CD and deployment configuration.

Expected Result:

A high-level understanding of the repository structure.

### Phase 2: Documentation Review

Locate and read available project documentation.

Priority documents:

1. `README.md`
2. `PROJECT_OVERVIEW.md`
3. `TECHNICAL_ARCHITECTURE.md`
4. `DATABASE_SCHEMA.md`
5. `API_DOCUMENTATION.md`
6. `BUSINESS_LOGIC.md`
7. `DEVELOPMENT_GUIDE.md`

Also inspect other relevant documentation available in the repository.

Tasks:

- Understand the project purpose.
- Identify target users.
- Understand major features.
- Review documented architecture.
- Understand business rules.
- Identify development constraints.

Important:

Documentation may be outdated or incomplete. Verify important information against the actual implementation.

### Phase 3: Technology Stack Analysis

Identify the technologies used by the project.

Inspect relevant files such as:

- `package.json`
- `tsconfig.json`
- `vite.config.*`
- `next.config.*`
- `prisma/schema.prisma`
- `Dockerfile`
- `docker-compose.yml`
- Dependency and configuration files.

Identify:

- Programming languages
- Frontend frameworks
- Backend frameworks
- Database technologies
- ORMs
- Authentication libraries
- Testing frameworks
- Build tools
- Deployment platforms

Do not assume a technology is used only because it appears in documentation.

### Phase 4: Architecture Analysis

Understand how the system is organized.

Tasks:

1. Identify frontend and backend boundaries.
2. Locate API routes and controllers.
3. Identify service and business logic layers.
4. Understand database access patterns.
5. Identify middleware and shared components.
6. Review external integrations.
7. Understand background jobs and event processing.
8. Identify important dependencies between modules.

Expected Result:

A clear understanding of how the major components interact.

### Phase 5: Database Analysis

Inspect the actual database implementation.

Tasks:

- Identify database models and tables.
- Review columns and data types.
- Understand primary and foreign keys.
- Identify relationships.
- Review indexes and constraints.
- Inspect migrations.
- Identify transaction-related operations.
- Understand important data integrity rules.

Never execute database modifications during the discovery process.

### Phase 6: API Analysis

Inspect the API implementation.

Tasks:

- Identify API routes and endpoint groups.
- Understand HTTP methods.
- Review request validation.
- Inspect response structures.
- Identify authentication middleware.
- Understand authorization and permission checks.
- Review error handling.
- Identify external API integrations.

### Phase 7: Business Logic Analysis

Understand how the application behaves from a business perspective.

Tasks:

1. Identify major business workflows.
2. Understand user roles and responsibilities.
3. Review permission restrictions.
4. Identify important validations.
5. Understand status transitions.
6. Identify approval and confirmation processes.
7. Review special conditions and edge cases.
8. Identify rules that must not be bypassed.

Critical Requirement:

Never change existing business behavior without an explicit requirement or approval.

### Phase 8: Security Analysis

Identify important security mechanisms.

Review:

- Authentication
- Authorization
- Role-based access control
- Input validation
- Sensitive data handling
- Secrets management
- API security
- Rate limiting
- Database access restrictions

Do not reveal secret values in reports or logs.

Do not attempt unauthorized security testing.

### Phase 9: Testing and Development Analysis

Understand how the project is developed and validated.

Inspect:

- Unit tests
- Integration tests
- API tests
- End-to-end tests
- Performance tests
- Type checking
- Build commands
- Git workflow
- Deployment process

Identify known test failures and existing development limitations where possible.

Do not modify code merely to complete the discovery process.

### Phase 10: Project Understanding Report

After completing discovery, prepare a structured report.

The report must include:

#### 1. Project Summary

- Project name
- Main purpose
- Target users
- Main objectives

#### 2. Technology Stack

- Frontend
- Backend
- Database
- Infrastructure
- External services

#### 3. Architecture Summary

Explain the major components and their communication.

#### 4. Database Summary

Describe the main tables, relationships, and data flow.

#### 5. API Summary

Identify important endpoint groups and authentication mechanisms.

#### 6. Business Logic Summary

Describe important workflows, user roles, permissions, and restrictions.

#### 7. Security Summary

Identify important security mechanisms and access boundaries.

#### 8. Testing Summary

Describe available test suites and validation commands.

#### 9. Risks and Unknowns

List:

- Missing documentation
- Unclear business rules
- Potential technical risks
- Unverified assumptions
- Areas requiring developer clarification

#### 10. Recommendations

Provide recommendations only when supported by findings from the actual project.

## 4. Missing Information Handling

If important information is missing:

1. Do not invent details.
2. Inspect relevant source code and configuration.
3. Clearly identify what is documented and what is verified.
4. Record unresolved questions.
5. Ask the developer for clarification when necessary.

## 5. Discovery Safety Rules

During project discovery, agents must:

- Operate in read-only mode whenever possible.
- Never modify source code.
- Never modify database schemas or data.
- Never execute destructive commands.
- Never install or remove dependencies without approval.
- Never expose secrets or credentials.
- Never change environment configurations.
- Never deploy application changes.

## 6. Discovery Completion Checklist

- [ ] Repository structure inspected.
- [ ] Available documentation reviewed.
- [ ] Technology stack identified.
- [ ] Architecture analyzed.
- [ ] Database structure reviewed.
- [ ] API structure reviewed.
- [ ] Business workflows understood.
- [ ] Security mechanisms reviewed.
- [ ] Testing approach identified.
- [ ] Unknowns and risks documented.
- [ ] Project understanding report prepared.

## 7. Completion Criteria

Project discovery is complete when the agent can explain:

1. What the application does.
2. Why the application exists.
3. Who uses the application.
4. How the application is structured.
5. How data flows through the system.
6. How the database is organized.
7. How APIs work.
8. What important business rules must be preserved.
9. How security and permissions are enforced.
10. How developers test and deploy the application.

If important information remains unknown, discovery must be reported as partially complete.

## 8. Agent Behavior After Discovery

After preparing the report:

1. Present the findings to the developer.
2. Highlight important risks and unknowns.
3. Ask questions about unclear requirements.
4. Wait for the developer's requested task.
5. Use the discovered project context when implementing approved changes.

**Important Principle:**

Understand first. Plan second. Implement only after the requirements and expected behavior are clear.

---

*Document Status: Workflow Definition*  
*Last Updated: [Date]*