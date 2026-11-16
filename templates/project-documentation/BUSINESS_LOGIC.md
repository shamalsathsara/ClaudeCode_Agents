# Business Logic Documentation

## 1. Business Overview

### Business Purpose

Describe the main business purpose of the application.

### Problems Being Solved

- 
- 
- 

### Main Business Objectives

- 
- 
- 

## 2. Business Terminology

Document important terms used throughout the application.

| Term | Definition | Context |
|---|---|---|
| | | |
| | | |

## 3. User Roles and Responsibilities

Document all user roles and their responsibilities.

| Role | Description | Main Responsibilities |
|---|---|---|
| | | |
| | | |

## 4. Permission and Access Rules

Document what each role can and cannot do.

| Feature / Action | Role | Allowed? | Conditions |
|---|---|---|---|
| | | Yes / No | |
| | | | |

Include:
- Role-based access rules
- Ownership restrictions
- Approval permissions
- Restricted actions
- Data visibility rules

## 5. Core Business Rules

Document the application's most important business rules.

Use this format for each rule.

### Rule: [RULE_NAME]

**Rule ID:**

**Description:**

**Conditions:**

**Expected Behavior:**

**Exceptions:**

**Affected Features:**

**Related Roles:**

**Priority:** Critical / High / Medium / Low

---

## 6. Business Workflows

Describe the main business processes step by step.

### Workflow: [WORKFLOW_NAME]

**Purpose:**

**Starting Condition:**

**Responsible Role:**

**Steps:**

1. 
2. 
3. 
4. 

**Expected Result:**

**Failure Scenarios:**

**Exceptions:**

## 7. Status and State Transitions

Document important application statuses and how they change.

| Current Status | Action / Condition | Next Status | Responsible Role |
|---|---|---|---|
| | | | |
| | | | |

### Transition Rules

- 
- 
- 

Document invalid or restricted transitions as well.

## 8. Business Validations

Document validations required by business requirements.

| Field / Action | Validation Rule | Error Behavior | Reason |
|---|---|---|---|
| | | | |
| | | | |

## 9. Approval and Confirmation Processes

Describe processes requiring approval or confirmation.

| Process | Requested By | Approved By | Conditions |
|---|---|---|---|
| | | | |
| | | | |

Document:
- Approval requirements
- Rejection conditions
- Confirmation rules
- Re-submission rules
- Audit history requirements

## 10. Notifications and Communication

| Event | Recipient | Notification Method | Conditions |
|---|---|---|---|
| | | | |
| | | | |

## 11. Business Exceptions and Edge Cases

Document unusual situations and how the system should behave.

| Scenario | Expected Behavior | Restrictions |
|---|---|---|
| | | |
| | | |

## 12. Business Data Rules

Document rules governing how business information is created, updated, and maintained.

- Required information:
- Unique business identifiers:
- Duplicate prevention:
- Data ownership:
- Data retention:
- Record deletion restrictions:

## 13. Audit and History Requirements

Document actions that must be recorded.

| Action | What Must Be Recorded | Responsible User |
|---|---|---|
| | | |
| | | |

## 14. Known Business Limitations

| Limitation | Description | Expected Future Behavior |
|---|---|---|
| | | |
| | | |

## 15. Business Decisions

Record important business decisions and their reasons.

| Decision | Reason | Date | Approved By |
|---|---|---|---|
| | | | |
| | | | |

## 16. AI Agent Business Logic Protection Rules

Before changing business-related code, AI agents must:

1. Read this document completely.
2. Identify the relevant business rules.
3. Inspect the existing implementation.
4. Trace all affected workflows.
5. Check role and permission requirements.
6. Identify related validations and status transitions.
7. Preserve existing business behavior unless a change is explicitly requested.
8. Never remove or bypass a business restriction without approval.
9. Identify possible impacts on other features.
10. Ask for clarification when business requirements are unclear.
11. Add or update tests for changed business rules.
12. Update this document when approved business logic changes are implemented.

**Critical Principle:** Existing business behavior must not be changed simply because an AI agent believes another implementation would be better. Business rule changes require clear requirements and appropriate approval.

---

*Document Status: Template*  
*Last Updated: [Date]*