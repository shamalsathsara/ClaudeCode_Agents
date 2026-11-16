# API Documentation

## 1. API Overview

| Field | Details |
|---|---|
| API Name | |
| API Style | REST / GraphQL / Other |
| Base URL | |
| API Version | |
| Backend Framework | |
| Authentication Method | |

### API Purpose

Describe what the API does and how clients interact with the application.

## 2. API Architecture

Describe how API requests are received, validated, processed, and returned.

```text
Client
  |
  v
API Request
  |
  v
Authentication
  |
  v
Authorization
  |
  v
Request Validation
  |
  v
Business Logic
  |
  v
Database / External Service
  |
  v
API Response
```

## 3. API Endpoint Groups

List the main endpoint groups.

| Endpoint Group | Base Path | Purpose | Authentication |
|---|---|---|---|
| | | | Required / Public |
| | | | |

## 4. Endpoint Documentation

Use the following format for each important endpoint.

### Endpoint: `[ENDPOINT_NAME]`

| Property | Details |
|---|---|
| HTTP Method | GET / POST / PUT / PATCH / DELETE |
| URL | |
| Purpose | |
| Authentication | Required / Not Required |
| Required Role | |
| Request Content-Type | |

**Path Parameters:**

| Parameter | Type | Required | Description |
|---|---|---|---|
| | | Yes / No | |

**Query Parameters:**

| Parameter | Type | Required | Description |
|---|---|---|---|
| | | Yes / No | |

**Request Body:**

```json
{
  "example": "value"
}
```

Replace this example with the actual request structure.

**Successful Response:**

```json
{
  "success": true,
  "data": {}
}
```

**Possible Error Responses:**

| HTTP Status | Error Code | Description |
|---|---|---|
| 400 | | Invalid request |
| 401 | | Unauthorized |
| 403 | | Forbidden |
| 404 | | Resource not found |
| 409 | | Conflict |
| 500 | | Internal server error |

**Validation Rules:**
- 
- 

**Business Rules:**
- 
- 

**Additional Notes:**
- 

---

## 5. Authentication and Authorization

Describe how API access is protected.

- Authentication mechanism:
- Token/session management:
- Token expiration:
- Role-based access control:
- Permission validation:
- Public endpoint restrictions:

## 6. Request Validation

Document validation rules applied to API requests.

| Field | Data Type | Required | Validation Rules |
|---|---|---|---|
| | | Yes / No | |
| | | | |

## 7. Response Standards

Describe the standard API response structure.

### Success Response

```json
{
  "success": true,
  "message": "Operation completed successfully",
  "data": {}
}
```

### Error Response

```json
{
  "success": false,
  "message": "An error occurred",
  "code": "ERROR_CODE"
}
```

These are illustrative examples. Document the actual response format used by the project.

## 8. Error Handling

Document how API errors are handled.

- Centralized error handling:
- Validation errors:
- Authentication errors:
- Authorization errors:
- Database errors:
- External service failures:
- Logging and monitoring:

## 9. Rate Limiting

| Endpoint / Group | Limit | Time Window | Behavior When Exceeded |
|---|---|---|---|
| | | | |

## 10. External API Integrations

| External Service | Endpoint | Purpose | Authentication |
|---|---|---|---|
| | | | |
| | | | |

## 11. API Testing

Document:
- API testing framework
- Automated test locations
- Authentication test coverage
- Validation test coverage
- Error scenario coverage
- Performance testing approach

## 12. API Versioning and Compatibility

Describe:
- API versioning strategy
- Backward compatibility requirements
- Deprecated endpoints
- Breaking-change handling

## 13. AI Agent API Review Instructions

Before modifying API-related code, AI agents must:

1. Read this document completely.
2. Inspect the actual route and controller definitions.
3. Verify HTTP methods and endpoint paths.
4. Trace middleware, authentication, and authorization.
5. Inspect request validation and response structures.
6. Review related business logic and database operations.
7. Check existing API consumers before changing contracts.
8. Maintain backward compatibility where required.
9. Add or update relevant API tests.
10. Update this document when approved API changes are implemented.

**Important:** Actual route definitions, validation schemas, controllers, and automated tests are the source of truth. Agents must verify the documentation against the implementation.

---

*Document Status: Template*  
*Last Updated: [Date]*