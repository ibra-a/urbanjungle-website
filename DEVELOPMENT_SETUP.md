# Nike Landing Page - ERPNext Integration Setup

## Quick Start

### Option 1: One-Click Start (Windows)
```bash
# Double-click the start.bat file
./start.bat
```

### Option 2: Manual Start
```bash
# Terminal 1 - Start Flask Backend
cd backend
python app.py

# Terminal 2 - Start React Frontend  
npm run dev
```

### Option 3: NPM Scripts
```bash
# Start backend
npm run start:backend

# Start frontend (in another terminal)
npm run start:frontend
```

## Prerequisites

### Python Dependencies
```bash
cd backend
pip install -r requirements.txt
```

### Node Dependencies (already installed)
```bash
npm install
```

## How It Works

### ERPNext Integration
- **URL**: https://sdcnike.frappe.cloud
- **Authentication**: Session-based login
- **Data**: Live Nike inventory with stock quantities
- **Images**: Downloaded and cached from ERPNext
- **Caching**: 5-minute cache for optimal performance

### API Endpoints
- `GET /api/health` - Backend health check
- `GET /api/products` - All Nike products with stock
- `GET /api/test/{item_code}` - Test single item
- `GET /api/images/{item_code}` - Serve product images

### Frontend Integration
- **Status Indicator**: Green (connected), Red (offline), Yellow (checking)
- **Auto-refresh**: Every 5 minutes to sync with backend cache
- **Error Handling**: Graceful fallbacks and retry buttons
- **Live Data Badge**: Shows products are from ERPNext

## Development Workflow

### Start Order (Important!)
1. **Flask Backend FIRST** (port 5000)
2. **React Frontend SECOND** (port 5173+)

### Testing the Integration
1. Start both servers
2. Visit http://localhost:5173
3. Scroll to "Live ERPNext Inventory" section
4. Check status indicator (should be green "Live Connected")
5. Verify product cards show "Live Data" badges

### Troubleshooting

#### Backend Not Starting
```bash
cd backend
python app.py
# Check for Flask import errors
```

#### No Products Showing
- Check ERPNext credentials in `backend/app.py`
- Verify "Login successful!" in Flask console
- Test single item: http://localhost:5000/api/test/719833610637

#### Images Not Loading
- Images are downloaded on-demand
- Check `item_images/` folder is created
- Fallback to placeholder if ERPNext image fails

#### Frontend Connection Error
- Ensure Flask backend is running on port 5000
- Check browser console for CORS errors
- Try refreshing the page

## File Structure

```
nike_landing_page-main/
├── backend/
│   ├── app.py              # Flask API server
│   ├── requirements.txt    # Python dependencies
│   └── item_images/        # Cached product images
├── src/
│   ├── services/
│   │   └── api.js          # API service layer
│   ├── components/
│   │   └── LiveProductCard.jsx  # Live product component
│   ├── sections/
│   │   └── LiveProducts.jsx     # Live inventory section
│   └── App.jsx             # Main app with integration
├── start.bat               # Windows startup script
└── DEVELOPMENT_SETUP.md    # This file
```

## Features

### Live Data Integration ✅
- Real-time Nike inventory from ERPNext
- 5-minute caching for performance
- Automatic session management
- Image downloading and serving

### Frontend Features ✅
- Status indicators (Green/Red/Yellow)
- Loading states and error handling
- Smooth animations with Framer Motion
- Responsive design
- Fallback images

### Performance Optimizations ✅
- Cached responses (~10ms vs 2-3s fresh)
- Background image downloads
- Auto-refresh every 5 minutes
- Lazy loading of components

## Success Metrics

When working correctly, you should see:
- ✅ Green "Live Connected" status
- ✅ Product cards with "Live Data" badges
- ✅ Real ERPNext images loading
- ✅ Stock quantities displaying
- ✅ Flask console showing "Login successful!"

Your ERPNext integration is now live! 🚀 