FROM postgres:16-alpine

# Set environment variables for default locale and timezone
ENV LANG en_US.utf8
ENV TZ UTC

# Copy initialization scripts
# Files in /docker-entrypoint-initdb.d/ are run in alphabetical order

# 1. Main Production Schema
COPY production_schema.sql /docker-entrypoint-initdb.d/01-schema.sql

# 2. Audit Immutability Enhancements
COPY enhance_audit_immutability.sql /docker-entrypoint-initdb.d/02-audit.sql

# 3. Initial Seed Data (Optional - Uncomment if needed)
# COPY production_seed.sql /docker-entrypoint-initdb.d/03-seed.sql

# Expose the default PostgreSQL port
EXPOSE 5432
