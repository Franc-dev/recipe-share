# 🚀 Deployment Steps - Same Repository, Separate Deployments

## 📋 Overview
You have **ONE Git repository** with both frontend and backend code, but you deploy them **separately** to different platforms.

## 🎯 Step 1: Prepare Your Repository

### 1.1 Push your code to GitHub
```bash
git add .
git commit -m "Complete RecipeShare application"
git push origin main
```

### 1.2 Verify your repository structure
```
your-repo/
├── client/          # React frontend
├── server/          # Express backend
├── package.json     # Root package.json
├── render.yaml      # Render configuration
├── vercel.json      # Vercel configuration
└── README.md
```

## 🌐 Step 2: Deploy Backend to Render

### 2.1 Create Render Account
1. Go to [Render.com](https://render.com)
2. Sign up with your GitHub account

### 2.2 Create Web Service
1. Click **"New +"** → **"Web Service"**
2. **Connect your GitHub repository** (the one with both client/server)
3. Select your repository

### 2.3 Configure Backend Deployment
```
Name: recipe-share-backend
Environment: Node
Region: Choose closest to you
Branch: main
Root Directory: (leave empty)
Build Command: cd server && npm install
Start Command: cd server && npm start
```

### 2.4 Set Environment Variables
In Render dashboard, add these environment variables:
```
NODE_ENV=production
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/recipe-share
JWT_SECRET=your-super-secret-jwt-key-change-this
CLIENT_URL=https://your-frontend-url.vercel.app
```

### 2.5 Deploy
Click **"Create Web Service"** - Render will:
- Clone your entire repository
- Run `cd server && npm install`
- Run `cd server && npm start`
- Deploy only the backend

**Your backend URL will be:** `https://recipe-share-backend.onrender.com`

## 🎨 Step 3: Deploy Frontend to Vercel

### 3.1 Create Vercel Account
1. Go to [Vercel.com](https://vercel.com)
2. Sign up with your GitHub account

### 3.2 Import Repository
1. Click **"New Project"**
2. Import your GitHub repository (same one as above)
3. Vercel will auto-detect it's a React app

### 3.3 Configure Frontend Deployment
```
Framework Preset: Create React App
Root Directory: client
Build Command: npm run build
Output Directory: build
Install Command: npm install
```

### 3.4 Set Environment Variables
In Vercel dashboard, add:
```
REACT_APP_API_URL=https://recipe-share-backend.onrender.com
```

### 3.5 Deploy
Click **"Deploy"** - Vercel will:
- Clone your entire repository
- Navigate to `client/` folder
- Run `npm install`
- Run `npm run build`
- Deploy only the frontend

**Your frontend URL will be:** `https://your-app.vercel.app`

## 🔄 Step 4: Update Environment Variables

### 4.1 Update Backend (Render)
Go back to Render dashboard and update:
```
CLIENT_URL=https://your-app.vercel.app
```

### 4.2 Update Frontend (Vercel)
Go back to Vercel dashboard and update:
```
REACT_APP_API_URL=https://recipe-share-backend.onrender.com
```

## 🧪 Step 5: Test Your Deployment

### 5.1 Test Backend
```bash
curl https://recipe-share-backend.onrender.com/api/health
```
Should return: `{"status":"OK","message":"Recipe Share API is running"}`

### 5.2 Test Frontend
1. Open your Vercel URL
2. Try to register/login
3. Test creating a recipe
4. Test search functionality

## 🔧 Alternative: Using Configuration Files

### Option A: Use render.yaml (Recommended)
Your repository already has `render.yaml`:
```yaml
services:
  - type: web
    name: recipe-share-backend
    env: node
    buildCommand: cd server && npm install
    startCommand: cd server && npm start
```

### Option B: Use Vercel CLI
```bash
# Install Vercel CLI
npm i -g vercel

# Deploy from client directory
cd client
vercel

# Follow prompts to configure
```

## 🎯 Key Points to Remember

### ✅ **What Works:**
- **Same repository** for both frontend and backend
- **Different platforms** for deployment
- **Different build commands** for each platform
- **Environment variables** connect them together

### ❌ **What Doesn't Work:**
- Deploying both to the same platform
- Using the same build command for both
- Forgetting to set environment variables

## 🔍 Troubleshooting

### Common Issues:

1. **"Build failed" in Render**
   - Check that `server/package.json` exists
   - Verify `cd server && npm install` works locally

2. **"Build failed" in Vercel**
   - Check that `client/package.json` exists
   - Verify `npm run build` works in client folder

3. **CORS errors**
   - Make sure `CLIENT_URL` in backend matches frontend URL exactly
   - Check that both URLs use HTTPS

4. **API calls failing**
   - Verify `REACT_APP_API_URL` is set correctly in Vercel
   - Check that backend is running and accessible

## 🎉 Success!

Once both deployments are working:
- **Frontend**: `https://your-app.vercel.app`
- **Backend**: `https://recipe-share-backend.onrender.com`

Update your README.md with these URLs and create your video demo!

---

**Remember:** You're deploying the **same repository** but each platform only uses the part it needs! 🚀 