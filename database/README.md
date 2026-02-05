# WealthWise AI - Database Setup Guide

This folder contains the SQL scripts required to set up the PostgreSQL database manually.

## 📁 Files
- `schema.sql`: Contains the table definitions, constraints, and performance indices.
- `seed.sql`: Contains sample data to populate the platform for testing.

## 🚀 Setup Instructions

1. **Create the Database**:
   ```sql
   CREATE DATABASE wealthwise_db;
   ```

2. **Apply the Schema**:
   Run the following command in your terminal (ensure `psql` is in your PATH):
   ```bash
   psql -h localhost -U postgres -d wealthwise_db -f database/schema.sql
   ```
   *Alternatively, copy the contents of `schema.sql` into your SQL client (e.g., pgAdmin, DBeaver).*

3. **Populate Sample Data**:
   ```bash
   psql -h localhost -U postgres -d wealthwise_db -f database/seed.sql
   ```

4. **Verify**:
   Connect to the database and run:
   ```sql
   SELECT * FROM users;
   ```

## 🛠️ Connection Configuration
Ensure your `backend/src/main/resources/application.properties` matches these credentials:
- `spring.datasource.url`: `jdbc:postgresql://localhost:5432/wealthwise_db`
- `spring.datasource.username`: `postgres`
- `spring.datasource.password`: *Your Password*
