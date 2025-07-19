# 🚀 RecipeShare - Quick Start Guide

## 📋 Prerequisites
- Node.js (v18 or higher)
- npm or yarn
- MongoDB Atlas account (free)
- Git

## 🎯 Quick Start Commands

### 1. Initial Setup
```bash
# Clone the repository (if not already done)
git clone <your-repo-url>
cd week-8-capstone_-sawe-blip

# Install all dependencies (frontend + backend)
npm run install-all

# Or install manually:
# npm install
# cd server && npm install
# cd ../client && npm install
```

### 2. Environment Setup
```bash
# Copy environment files
cp server/env.example server/.env
echo "REACT_APP_API_URL=http://localhost:5000" > client/.env

# Edit server/.env with your MongoDB connection string
# MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/recipe-share
# JWT_SECRET=your-super-secret-key
```

### 3. Development
```bash
# Start both frontend and backend simultaneously
npm run dev

# Or start them separately:
npm run server    # Backend only (port 5000)
npm run client    # Frontend only (port 3000)

# Use the quick start script (Unix/Mac)
./start.sh
```

### 4. Testing
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

### 5. Production Build
```bash
# Build frontend for production
npm run build

# Start production server
npm start
```

## 🌐 Deployment

### Backend Deployment (Render)

1. **Sign up** at [Render.com](https://render.com)

2. **Create Web Service**:
   - Connect GitHub repository
   - **Build Command**: `cd server && npm install`
   - **Start Command**: `cd server && npm start`
   - **Root Directory**: Leave empty

3. **Environment Variables**:
   ```
   NODE_ENV=production
   MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/recipe-share
   JWT_SECRET=your-super-secret-jwt-key
   CLIENT_URL=https://your-frontend-url.vercel.app
   ```

### Frontend Deployment (Vercel)

1. **Sign up** at [Vercel.com](https://vercel.com)

2. **Import Repository**:
   - Connect GitHub account
   - Select repository
   - **Framework Preset**: Create React App
   - **Root Directory**: `client`
   - **Build Command**: `npm run build`
   - **Output Directory**: `build`

3. **Environment Variables**:
   ```
   REACT_APP_API_URL=https://your-backend-url.onrender.com
   ```

## 🔧 Alternative Deployment Options

### Backend Alternatives:
- **LeapCell**: Similar to Render, good for Node.js apps
- **Railway**: Easy deployment with good free tier
- **Heroku**: Classic choice (requires credit card for free tier)

### Frontend Alternatives:
- **Netlify**: Great for static sites, similar to Vercel
- **GitHub Pages**: Free hosting for static sites
- **Firebase Hosting**: Google's hosting solution

## 🧪 Testing Your Deployment

### Local Testing
```bash
# Test backend health
curl http://localhost:5000/api/health

# Test frontend
open http://localhost:3000
```

### Production Testing
```bash
# Test deployed backend
curl https://your-backend.onrender.com/api/health

# Test deployed frontend
open https://your-app.vercel.app
```

## 🔍 Troubleshooting

### Common Issues:

1. **Port already in use**:
   ```bash
   # Kill process on port 5000
   lsof -ti:5000 | xargs kill -9
   
   # Kill process on port 3000
   lsof -ti:3000 | xargs kill -9
   ```

2. **MongoDB connection issues**:
   - Check your connection string
   - Ensure IP is whitelisted in Atlas
   - Verify database user permissions

3. **CORS errors**:
   - Check `CLIENT_URL` in backend environment
   - Ensure frontend URL matches exactly

4. **Build failures**:
   ```bash
   # Clear npm cache
   npm cache clean --force
   
   # Delete node_modules and reinstall
   rm -rf node_modules package-lock.json
   npm install
   ```

## 📊 Monitoring & Logs

### Render (Backend)
- View logs in Render dashboard
- Monitor resource usage
- Set up alerts

### Vercel (Frontend)
- View deployment logs
- Monitor performance
- Check build status

## 🎉 Success Checklist

- [ ] Backend deployed and accessible
- [ ] Frontend deployed and accessible
- [ ] Database connected and working
- [ ] Authentication working
- [ ] API endpoints responding
- [ ] Tests passing
- [ ] Documentation updated with live URLs

## 📞 Support

If you encounter issues:
1. Check the logs in your deployment platform
2. Verify environment variables are set correctly
3. Test locally first to isolate issues
4. Check the troubleshooting section above

---

**Happy Coding! 🍽️✨** 