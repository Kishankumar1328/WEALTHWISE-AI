# wealthwise-deployment-guide

This guide helps you deploy the WealthWise AI stack for **free** (or very generic usage) using modern cloud platforms.

## Architecture & Hosting Plan

| Component | Tech Stack | Recommended Free Host |
| :--- | :--- | :--- |
| **Frontend** | React (Vite) | **Vercel** (Best for React) |
| **Backend** | Java Spring Boot | **Render** (Docker Support) |
| **AI Service** | Python FastAPI | **Render** (Docker Support) |
| **Database** | PostgreSQL | **Neon** or **Supabase** |

---

## Step 1: Set up the Database (PostgreSQL)

1.  Go to [Neon.tech](https://neon.tech/) and sign up.
2.  Create a new Project (e.g., `wealthwise-db`).
3.  **Copy the Connection String**. It looks like:
    `postgres://user:password@ep-xyz.region.aws.neon.tech/neondb?sslmode=require`
4.  Save this; you will need it for the Backend environment variables.

---

## Step 2: Deploy the Backend (Java)

1.  Push your code to **GitHub** if you haven't already.
2.  Go to [Render.com](https://render.com/) and sign up.
3.  Click **New +** -> **Web Service**.
4.  Connect your GitHub repository.
5.  Select the `backend` directory (Root Directory setting: `backend`).
    *   *Note: Render might auto-detect Docker. Ensure it uses the Docker Runtime.*
6.  **Settings**:
    *   **Runtime**: Docker
    *   **Instance Type**: Free
7.  **Environment Variables** (Add these):
    *   `SPRING_DATASOURCE_URL`: (Your Neon JDBC URL, e.g., `jdbc:postgresql://ep-xyz...`)
    *   `SPRING_DATASOURCE_USERNAME`: (Your DB User)
    *   `SPRING_DATASOURCE_PASSWORD`: (Your DB Password)
    *   `PORT`: `5000`
8.  Click **Create Web Service**.
9.  Wait for the build to finish. Copy the **Service URL** (e.g., `https://wealthwise-backend.onrender.com`).

---

## Step 3: Deploy the AI Service (Python)

1.  Go to Render Dashboard.
2.  Click **New +** -> **Web Service**.
3.  Connect the same GitHub repo.
4.  **Root Directory**: `ai-service`.
5.  **Runtime**: Docker.
6.  **Instance Type**: Free.
7.  Click **Create Web Service**.
8.  Copy the **Service URL** (e.g., `https://wealthwise-ai.onrender.com`).

---

## Step 4: Deploy the Frontend (React)

1.  Go to [Vercel.com](https://vercel.com/) and sign up.
2.  Click **Add New...** -> **Project**.
3.  Import your GitHub repository.
4.  **Framework Preset**: Vite.
5.  **Root Directory**: `frontend`.
6.  **Environment Variables**:
    *   `VITE_API_URL`: (Your Backend URL from Step 2, e.g., `https://wealthwise-backend.onrender.com`)
    *   `VITE_AI_REQ_URL`: (Your AI Service URL from Step 3)
7.  Click **Deploy**.

---

## troubleshooting

*   **Java Backend Crashing?** The free tier has 512MB RAM. If Spring Boot runs out of memory, try setting this JAVA_OPTS env var in Render:
    `JAVA_OPTS`: `-Xmx300m -Xss512k -XX:CICompilerCount=2 -Dserver.port=5000`
*   **Cold Starts**: Render's free tier spins down after 15 minutes of inactivity. The first request might take 50+ seconds. Use [UptimeRobot](https://uptimerobot.com/) to keep it awake if necessary (but be mindful of free usage limits).
