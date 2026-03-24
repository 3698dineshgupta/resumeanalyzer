# Render Deployment Guide 🚀

Deploying your Resume AI project to Render is easy using the **Blueprint** (render.yaml) I've already added to your project.

## Step 1: Push Changes to GitHub
Make sure all recent changes (including `render.yaml`) are pushed to your repository:
```bash
git add .
git commit -m "Add Render deployment config"
git push origin main
```

## Step 2: Create a Blueprint on Render
1. Go to [dashboard.render.com](https://dashboard.render.com).
2. Click **New +** and select **Blueprint**.
3. Connect your GitHub repository (`3698dineshgupta/resumeanalyzer`).
4. Render will automatically detect the `render.yaml` and create two services:
   - `resume-analyzer-backend` (Web Service)
   - `resume-analyzer-frontend` (Static Site/Web Service)

## Step 3: Configure Environment Variables
During the Blueprint setup, Render will ask you to fill in these required variables:

### **Backend Service (`resume-analyzer-backend`):**
- **MONGO_URI**: Your MongoDB connection string (Atlas).
- **GROQ_API_KEY**: Your Groq API key.
- **FRONTEND_URL**: (Filled automatically by the Blueprint) — Ensure it points to your Frontend URL (e.g. `https://resume-analyzer-frontend.onrender.com`).

### **Frontend Service (`resume-analyzer-frontend`):**
- **VITE_API_URL**: Must be your Backend URL **WITH** `/api` suffix (e.g. `https://resume-analyzer-backend.onrender.com/api`).

## Step 5: Start Matching!
Your app will be live at the **Frontend URL** provided by Render.

---
> [!TIP]
> **Free Tier Sleep**: Note that Render's free tier services "sleep" after 15 minutes of inactivity. The first request might take 30-60 seconds to wake up the backend.
