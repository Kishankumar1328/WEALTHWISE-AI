# WealthWise AI - System Enhancement Plan & Technical Review

**Role**: Principal Software Architect
**Date**: 2026-02-04
**Objective**: Elevate WealthWise AI V2 to a production-grade, investor-ready fintech platform.

---

## 1. Executive Summary
The current system provides a solid functional baseline but lacks the rigorous security, performance optimizations, and "wow" factor required for a Series A fintech product. The following improved roadmap addresses technical debt, security "hard rules", and AI reliability.

---

## 2. Backend & Security Architecture (Critical)
**Current Status**: 
- Stateless JWT using `Authorization` headers.
- Basic Spring Security configuration.
- Missing strict Controller-Service separation in some areas.

**Enhancement Actions**:
1.  **Auth Migration**: Move from `localStorage` tokens to **HttpOnly, Secure Cookies**. This eliminates XSS token theft vectors.
    - *Refactor `JwtAuthenticationFilter` to read from cookies.*
    - *Refactor `AuthController` to set cookies on response.*
    - *Update `frontend/src/api/api.js` to rely on `credentials: 'include'`.*
2.  **OAuth2 Integration**: Add Google/GitHub login support via `spring-boot-starter-oauth2-client`.
3.  **Rate Limiting**: Implement Bucket4j to prevent API abuse.
4.  **Audit Logs**: Enforce immutability via Database Triggers (completed in design, needs verification).

## 3. Database Layer (PostgreSQL)
**Current Status**: 
- Good use of `pgcrypto` and RLS.
- Missing performance indexes for time-series aggregation.

**Enhancement Actions**:
1.  **Time-Series Optimization**: Add BRIN indexes for `transaction_date` on the `transactions` table.
2.  **Immutability**: Add a `BEFORE DELETE/UPDATE` trigger to the `audit_logs` table to raise an exception.
3.  **Foreign Keys**: Ensure all `ON DELETE CASCADE` rules are intentional to prevent accidental data loss (recommend switching key entities to `SOFT DELETE`).

## 4. Frontend & User Experience
**Current Status**:
- React + Tailwind + ShadCN.
- Token stored in local storage (Security Risk).
- Potential for unnecessary re-renders.

**Enhancement Actions**:
1.  **Performance**:
    - Implement `React.memo` for chart components.
    - Use `React.lazy` for route-based code splitting.
2.  **Visuals**:
    - Enhance "Skeleton Loading" states instead of generic spinners.
    - Standardize Typography (Inter/Manrope) and Spacing.
3.  **Real-time**: Ensure `SockJS` / `Stomp` client handles reconnects gracefully.

## 5. AI Reasoning Engine
**Current Status**:
- Simple Mock Python service.
- Lacks structured schema validation for inputs.

**Enhancement Actions**:
1.  **Schema Enforcement**: strict Pydantic models matching the Financial Data Standard.
2.  **Logic Upgrade**: Implement rule-based heuristics that mimic "Financial Reasoning" until true LLM integration is live.
3.  **Prompt Engineering**: Add the "System Prompt" context into the Python service layer.

---

## 6. Deployment & Production Readiness
- **Docker**: Containerization is in place (good).
- **CI/CD**: Needs a GitHub Actions workflow for automated testing.
- **Monitoring**: Add Prometheus/Grafana or basic Actuator metrics.

---

**Next Immediate Steps**:
1. Update `ai-service/main.py` to match the required Financial Schema.
2. Add Database Immutability Trigger for Audit Logs.
3. Hardening Backend Security (Cookie transition).
