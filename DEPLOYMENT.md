# 🚀 Deployment Guide - RecipeShare

This guide will help you deploy your RecipeShare application to Vercel (frontend) and Render/LeapCell (backend).

## 📋 Prerequisites

- GitHub account
- Vercel account (free)
- Render account (free) or LeapCell account
- MongoDB Atlas account (free tier available)

## 🔧 Environment Setup

### 1. MongoDB Atlas Setup

1. Go to [MongoDB Atlas](https://www.mongodb.com/atlas)
2. Create a free account
3. Create a new cluster
4. Get your connection string
5. Create a database user with read/write permissions

### 2. Environment Variables

Create `.env` files for both frontend and backend:

#### Backend (.env in server folder)
```env
PORT=5000
NODE_ENV=production
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/recipe-share
JWT_SECRET=your-super-secret-jwt-key-change-this
CLIENT_URL=https://your-frontend-url.vercel.app
```

#### Frontend (.env in client folder)
```env
REACT_APP_API_URL=https://your-backend-url.onrender.com
```

## 🎯 Starting Commands

### Development
```bash
# Install all dependencies
npm run install-all

# Start both frontend and backend in development
npm run dev

# Or start them separately
npm run server    # Backend only (port 5000)
npm run client    # Frontend only (port 3000)
```

### Testing
```bash
# Run all tests
npm run test

# Run backend tests only
npm run test:server

# Run frontend tests only
npm run test:client

# Run tests in watch mode
cd server && npm run test:watch
cd client && npm test -- --watch
```

### Production Build
```bash
# Build frontend for production
npm run build

# Start production server
npm start
```

## 🌐 Backend Deployment (Render)

### Option 1: Render (Recommended)

1. **Sign up** at [Render.com](https://render.com)

2. **Create a new Web Service**
   - Connect your GitHub repository
   - Choose the repository
   - Set the following configuration:
     - **Name**: `recipe-share-backend`
     - **Environment**: `Node`
     - **Build Command**: `cd server && npm install`
     - **Start Command**: `cd server && npm start`
     - **Root Directory**: Leave empty (deploy from root)

3. **Environment Variables** (in Render dashboard):
   ```
   NODE_ENV=production
   MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/recipe-share
   JWT_SECRET=your-super-secret-jwt-key
   CLIENT_URL=https://your-frontend-url.vercel.app
   ```

4. **Deploy** - Render will automatically deploy when you push to main branch

### Option 2: LeapCell

1. **Sign up** at [LeapCell.com](https://leapcell.com)

2. **Create a new project**
   - Connect your GitHub repository
   - Choose Node.js template

3. **Configure deployment**:
   - **Build Command**: `cd server && npm install`
   - **Start Command**: `cd server && npm start`
   - **Port**: `5000`

4. **Set environment variables** in LeapCell dashboard

## 🎨 Frontend Deployment (Vercel)

### Vercel Deployment

1. **Sign up** at [Vercel.com](https://vercel.com)

2. **Import your GitHub repository**
   - Connect your GitHub account
   - Select the repository
   - Vercel will auto-detect it's a React app

3. **Configure the project**:
   - **Framework Preset**: Create React App
   - **Root Directory**: `client`
   - **Build Command**: `npm run build`
   - **Output Directory**: `build`
   - **Install Command**: `npm install`

4. **Environment Variables** (in Vercel dashboard):
   ```
   REACT_APP_API_URL=https://your-backend-url.onrender.com
   ```

5. **Deploy** - Vercel will automatically deploy when you push to main branch

## 🔄 CI/CD Pipeline Setup

### GitHub Actions (Optional)

The repository includes a GitHub Actions workflow that will:
- Run tests on every push
- Deploy to Render and Vercel on main branch pushes

To enable this:

1. **Add secrets to your GitHub repository**:
   - Go to Settings → Secrets and variables → Actions
   - Add the following secrets:
     ```
     MONGODB_URI_TEST=mongodb+srv://username:password@cluster.mongodb.net/recipe-share-test
     RENDER_TOKEN=your-render-api-token
     RENDER_SERVICE_ID=your-render-service-id
     VERCEL_TOKEN=your-vercel-token
     VERCEL_ORG_ID=your-vercel-org-id
     VERCEL_PROJECT_ID=your-vercel-project-id
     ```

2. **Get the required tokens**:
   - **Render Token**: Go to Render dashboard → Account → API Keys
   - **Vercel Token**: Go to Vercel dashboard → Settings → Tokens

## 🧪 Testing Before Deployment

### Local Testing
```bash
# Start MongoDB locally (if you have it installed)
mongod

# Start the application
npm run dev

# Run tests
npm run test

# Test the API endpoints
curl http://localhost:5000/api/health
```

### Production Testing
After deployment, test these endpoints:
- Frontend: `https://your-app.vercel.app`
- Backend Health: `https://your-backend.onrender.com/api/health`
- API Documentation: `https://your-backend.onrender.com/api/docs`

## 🔍 Troubleshooting

### Common Issues

1. **CORS Errors**
   - Make sure `CLIENT_URL` is set correctly in backend environment
   - Check that the frontend URL matches exactly

2. **MongoDB Connection Issues**
   - Verify your MongoDB Atlas connection string
   - Check that your IP is whitelisted in Atlas
   - Ensure database user has correct permissions

3. **Build Failures**
   - Check that all dependencies are in package.json
   - Verify Node.js version compatibility
   - Check for syntax errors in code

4. **Environment Variables**
   - Ensure all required env vars are set in deployment platform
   - Check that variable names match exactly
   - Restart the service after adding new env vars

### Debug Commands
```bash
# Check Node.js version
node --version

# Check npm version
npm --version

# Check if MongoDB is running
mongo --version

# Test API locally
curl -X GET http://localhost:5000/api/health

# Check build output
npm run build
```

## 📊 Monitoring

### Render Monitoring
- View logs in Render dashboard
- Set up alerts for downtime
- Monitor resource usage

### Vercel Monitoring
- View deployment logs
- Monitor performance with Vercel Analytics
- Set up error tracking

## 🔐 Security Checklist

- [ ] JWT_SECRET is a strong, random string
- [ ] MongoDB connection uses authentication
- [ ] CORS is properly configured
- [ ] Environment variables are not committed to git
- [ ] API endpoints are properly protected
- [ ] Rate limiting is enabled
- [ ] HTTPS is enforced in production

## 🎉 Success!

Once deployed, your application will be available at:
- **Frontend**: `https://your-app.vercel.app`
- **Backend**: `https://your-backend.onrender.com`

Update your README.md with the actual URLs and create a video demo showcasing the deployed application! 