# Development Guide

## 1. Introduction

This document explains how developers can configure, run, develop, and test this project.

### Development Objectives

- Provide a consistent development environment.
- Follow the existing project architecture.
- Maintain code quality and security.
- Ensure changes are properly tested and documented.

## 2. Prerequisites

List the software and tools required before starting development.

| Tool | Required Version | Purpose |
|---|---|---|
| Operating System | | |
| Programming Language | | |
| Runtime | | |
| Package Manager | | |
| Database | | |
| Git | | |
| IDE / Editor | | |

## 3. Repository Setup

### Clone the Repository

```bash
git clone [REPOSITORY_URL]
cd [PROJECT_DIRECTORY]
```

### Install Dependencies

Document the actual installation commands.

```bash
# Example
npm install
```

### Environment Configuration

1. Locate the environment example file.
2. Create the required local environment file.
3. Configure the necessary environment variables.
4. Never commit actual secrets.

Document required variables separately without exposing their values.

| Variable | Purpose | Required |
|---|---|---|
| | | Yes / No |
| | | Yes / No |

## 4. Local Development Setup

Document how to start the application locally.

### Frontend

```bash
# Add the actual frontend development command
```

### Backend

```bash
# Add the actual backend development command
```

### Database

Document:
- Database creation
- Connection configuration
- Migration execution
- Seed data setup

## 5. Project Structure

Describe the main repository directories.

| Directory | Responsibility |
|---|---|
| | |
| | |
| | |

## 6. Git Workflow

Document the project's branching and collaboration strategy.

| Branch | Purpose |
|---|---|
| main | Production |
| develop | Development |
| feature/* | New features |
| fix/* | Bug fixes |

Replace these examples with the actual project branching strategy.

### Development Workflow

1. Start from the correct base branch.
2. Create a dedicated feature or bug-fix branch.
3. Implement the requested changes.
4. Run relevant tests.
5. Review the changes.
6. Commit using the project's commit conventions.
7. Create a Pull Request.
8. Complete the required review process.

## 7. Coding Standards

Document coding conventions used by the project.

- Naming conventions:
- Formatting rules:
- File organization:
- Error handling:
- Logging standards:
- Code commenting:
- Reusable component practices:

## 8. Testing Instructions

Document how to run the available tests.

| Test Type | Command | Purpose |
|---|---|---|
| Unit Tests | | |
| Integration Tests | | |
| API Tests | | |
| End-to-End Tests | | |
| Type Checking | | |
| Build | | |

### Testing Requirements

- Add tests for new functionality.
- Update tests when existing behavior changes.
- Test important edge cases.
- Do not ignore existing test failures.
- Report test results accurately.

## 9. Database Development

Document:
- Schema modification process
- Migration creation
- Migration execution
- Seed data management
- Rollback procedures
- Database testing requirements

Never run destructive database operations without authorization.

## 10. Build and Deployment

### Build Commands

Document the actual build commands.

### Deployment Environments

| Environment | Purpose | Deployment Method |
|---|---|---|
| Development | | |
| Staging | | |
| Production | | |

Document deployment approvals, migration precautions, and rollback procedures.

## 11. Troubleshooting

Document common development problems and their solutions.

| Problem | Possible Cause | Solution |
|---|---|---|
| | | |
| | | |

## 12. Pull Request Requirements

Before submitting a Pull Request:

- [ ] Code follows project conventions.
- [ ] Relevant tests pass.
- [ ] Type checking passes where applicable.
- [ ] Build completes successfully.
- [ ] No unintended files or secrets are included.
- [ ] Documentation is updated.
- [ ] Existing business logic is preserved.
- [ ] Changes are clearly explained.

## 13. AI-Assisted Development Guidelines

AI agents and AI coding assistants must:

1. Read the project documentation before making changes.
2. Inspect the existing implementation.
3. Follow the established development workflow.
4. Respect coding standards and architectural decisions.
5. Avoid unnecessary refactoring.
6. Never expose secrets or sensitive information.
7. Run relevant tests after implementation.
8. Explain changes and potential risks.
9. Never claim tests passed unless they were actually executed.
10. Request approval before destructive or high-impact operations.

## 14. Documentation Maintenance

Update relevant documentation whenever approved changes affect:

- Project architecture
- Database structure
- API contracts
- Business logic
- Development procedures
- Security requirements

**Important:** Commands and configuration examples in this template must be replaced with verified project-specific instructions before developers use them.

---

*Document Status: Template*  
*Last Updated: [Date]*