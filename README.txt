ResolveIT Project ZIP (Option C) - assembled 2025-11-30T08:00:27.917448 UTC

Contents:
- resolveit-db.sql (full SQL from your spec)
- resolveit-backend/ (Spring Boot project: pom.xml, resources, java sources for models, repos, security, application class)
- resolveit-frontend/ (React scaffold with basic pages and API service)

Notes:
- Update application.properties with your DB password and JWT secret.
- Backend SecurityConfig.java ends where provided; you may want to complete configuration (CORS, filter chain).
- Frontend is a scaffold; wire up auth storage and UI as needed.

