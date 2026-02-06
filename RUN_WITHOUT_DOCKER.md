# Running WealthWise AI Without Docker

This guide explains how to run the WealthWise AI project locally without Docker.

## Prerequisites

Before running the project, ensure you have the following installed:

### 1. **Node.js & npm**
- Version: 18.x or higher
- Download: https://nodejs.org/
- Verify: `node --version` and `npm --version`

### 2. **Java JDK**
- Version: 17 or higher
- Download: https://www.oracle.com/java/technologies/downloads/
- Verify: `java -version`

### 3. **Maven**
- Version: 3.8+
- Download: https://maven.apache.org/download.cgi
- Verify: `mvn --version`

### 4. **Python**
- Version: 3.9+
- Download: https://www.python.org/downloads/
- Verify: `python --version`

### 5. **PostgreSQL**
- Version: 14+
- Download: https://www.postgresql.org/download/windows/
- Or use Docker: `docker run -d -p 5432:5432 -e POSTGRES_PASSWORD=root -e POSTGRES_DB=wealthwise postgres:15`

### 6. **Redis** (Optional)
- Download: https://github.com/microsoftarchive/redis/releases
- Or use Docker: `docker run -d -p 6379:6379 redis:7-alpine`

---

## Quick Start (Automated)

### Option 1: Use the Automated Script
```powershell
.\run-without-docker.ps1
```

This script will:
- Check all prerequisites
- Install dependencies
- Start all services in separate windows

---

## Manual Setup (Step-by-Step)

### Step 1: Setup Database

1. **Start PostgreSQL** (if not running)
2. **Create Database**:
   ```sql
   CREATE DATABASE wealthwise;
   ```

3. **Update Backend Configuration** (if needed):
   - File: `backend/src/main/resources/application.properties`
   - Ensure these settings:
     ```properties
     spring.datasource.url=jdbc:postgresql://localhost:5432/wealthwise
     spring.datasource.username=postgres
     spring.datasource.password=root
     ```

### Step 2: Start Backend (Spring Boot)

```powershell
# Navigate to backend directory
cd backend

# Build and run (this will also run database migrations)
mvn spring-boot:run -Dspring-boot.run.profiles=dev

# Or build JAR and run
mvn clean package -DskipTests
java -jar target/wealthwise-backend-0.0.1-SNAPSHOT.jar
```

**Backend will start on:** http://localhost:5000
**Swagger UI:** http://localhost:5000/swagger-ui/index.html

### Step 3: Start Frontend (React + Vite)

Open a **new terminal window**:

```powershell
# Navigate to frontend directory
cd frontend

# Install dependencies (first time only)
npm install

# Start development server
npm run dev
```

**Frontend will start on:** http://localhost:3000

### Step 4: Start AI Service (Python FastAPI) - Optional

Open a **new terminal window**:

```powershell
# Activate virtual environment
.\.venv\Scripts\Activate.ps1

# Navigate to AI service directory
cd ai-service

# Install dependencies (first time only)
pip install -r requirements.txt

# Start the service
python main.py
```

**AI Service will start on:** http://localhost:8000

---

## Environment Variables

### Backend (.env or application.properties)
```properties
# Database
spring.datasource.url=jdbc:postgresql://localhost:5432/wealthwise
spring.datasource.username=postgres
spring.datasource.password=root

# Razorpay (for payments)
razorpay.key.id=your_razorpay_key_id
razorpay.key.secret=your_razorpay_key_secret

# JWT
jwt.secret=your_jwt_secret_key_here
jwt.expiration=86400000

# Redis (optional)
spring.redis.host=localhost
spring.redis.port=6379
```

### Frontend (.env)
```env
VITE_API_BASE_URL=http://localhost:5000
VITE_AI_SERVICE_URL=http://localhost:8000
```

---

## Accessing the Application

Once all services are running:

1. **Open Browser**: http://localhost:3000
2. **Register/Login**: Create an account or login
3. **Navigate to Razorpay Payments**: Click on "Razorpay Payments" in the sidebar

---

## Troubleshooting

### Backend won't start
- **Check PostgreSQL**: Ensure PostgreSQL is running on port 5432
- **Check Database**: Ensure `wealthwise` database exists
- **Check Logs**: Look for errors in the terminal

### Frontend won't start
- **Port in use**: If port 3000 is busy, Vite will suggest another port
- **Dependencies**: Run `npm install` again
- **Clear cache**: Delete `node_modules` and run `npm install`

### Database Connection Error
```
Error: Connection refused
```
**Solution**: 
- Start PostgreSQL service
- Verify credentials in `application.properties`
- Check if database `wealthwise` exists

### Port Already in Use
```
Error: Port 5000 is already in use
```
**Solution**:
- Stop other services using that port
- Or change the port in `application.properties`:
  ```properties
  server.port=8080
  ```

---

## Stopping the Services

To stop all services:
1. Press `Ctrl + C` in each terminal window
2. Or close the PowerShell windows

---

## Development Tips

### Hot Reload
- **Frontend**: Vite automatically reloads on file changes
- **Backend**: Use Spring Boot DevTools for auto-restart
- **AI Service**: Uvicorn has auto-reload enabled

### Database Management
- **View Data**: Use pgAdmin or DBeaver
- **Reset Database**: 
  ```sql
  DROP DATABASE wealthwise;
  CREATE DATABASE wealthwise;
  ```
  Then restart backend to run migrations

### API Testing
- **Swagger UI**: http://localhost:5000/swagger-ui/index.html
- **Postman**: Import the API collection
- **curl**: Test endpoints directly

---

## Next Steps

1. ✅ Razorpay is now visible in the sidebar
2. ✅ All services can run without Docker
3. Configure Razorpay API keys in `application.properties`
4. Test payment functionality
5. Customize payment amounts and descriptions

---

## Need Help?

- Check the logs in each terminal window
- Verify all prerequisites are installed
- Ensure all ports are available (3000, 5000, 8000, 5432, 6379)
- Check the `.env` files for correct configuration
