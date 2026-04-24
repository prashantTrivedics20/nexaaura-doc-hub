# PDF Viewer Troubleshooting Guide

## Current Issues & Solutions

### Issue 1: PDF Pages Not Rendering / Pagination Not Working

**Symptoms:**
- PDF viewer opens but pages don't display
- Blank white canvas
- Page navigation doesn't work

**Root Cause:**
- Cloudinary files uploaded before configuration change are **private** (401 Unauthorized)
- Backend proxy cannot fetch private files

**Solution:**
Run the script to make all existing files public:

```bash
cd backend
node scripts/makeFilesPublic.js
```

This will:
- Connect to MongoDB
- Find all documents
- Update Cloudinary access mode to `public`
- Update document URLs in database

### Issue 2: Download Not Working / Files Download Without .pdf Extension

**Symptoms:**
- Download button doesn't work
- Files download without `.pdf` extension
- Downloaded files show as generic files instead of PDFs
- Browser doesn't recognize file as PDF

**Root Cause:**
- Cloudinary URL doesn't include `fl_attachment` flag
- Filename missing `.pdf` extension
- Direct URL opens in browser instead of downloading

**Solution:**
Already fixed! The download endpoint now:
- Generates Cloudinary URL with `fl_attachment:filename.pdf` flag
- Ensures filename always has `.pdf` extension
- Forces browser to download instead of opening in tab

Test the fix:
```bash
cd backend
node scripts/testDownload.js
```

### Issue 3: "Cannot set headers after they are sent" Error

**Symptoms:**
```
Error [ERR_HTTP_HEADERS_SENT]: Cannot set headers after they are sent to the client
```

**Root Cause:**
- Monitoring middleware tries to set headers after proxy streams response

**Solution:**
Already fixed! The monitoring middleware now skips proxy endpoints:
- `res.locals.skipMonitoring = true` in proxy route
- Middleware checks for `/proxy` in URL

---

## Testing Steps

### Step 1: Make Files Public
```bash
cd backend
node scripts/makeFilesPublic.js
```

Expected output:
```
✅ Success: X files
📄 Total: X files
✅ Files are now public! Test the PDF viewer again.
```

### Step 2: Test Backend Endpoints
```bash
cd backend
node scripts/testPdfProxy.js
```

This will test:
1. Direct Cloudinary access (should return 200)
2. Backend proxy endpoint (should return 200)
3. Download endpoint (should return download URL)

Expected output:
```
✅ Direct access works!
✅ Proxy endpoint works!
✅ Download endpoint works!
```

### Step 3: Test in Browser

1. Start backend:
```bash
cd backend
npm run dev
```

2. Start frontend:
```bash
cd frontend-new
npm run dev
```

3. Login as admin:
   - Email: `admin@nexa.com`
   - Password: `admin123456`

4. Click "View" on any document
5. Verify:
   - ✅ PDF loads and displays
   - ✅ Page navigation works (← →)
   - ✅ Zoom in/out works
   - ✅ Download button works
   - ✅ Document carousel works (Shift + ← →)

---

## Common Errors & Fixes

### Error: "File size too large. Got X. Maximum is 10485760"

**Cause:** Cloudinary free tier has 10MB file limit

**Solution:**
1. Compress PDF before uploading
2. Or upgrade Cloudinary plan
3. Current limit in `.env`: `MAX_FILE_SIZE=104857600` (100MB)
   - This is the backend limit
   - Cloudinary free tier still enforces 10MB

### Error: "401 Unauthorized" from Cloudinary

**Cause:** File is private on Cloudinary

**Solution:**
```bash
node backend/scripts/makeFilesPublic.js
```

### Error: "404 Not Found" from Cloudinary

**Cause:** File doesn't exist or wrong URL

**Solution:**
1. Check document in database
2. Verify `file.publicId` and `file.url`
3. Check Cloudinary dashboard

### Error: PDF.js worker not loading

**Cause:** Worker file not found

**Solution:**
Verify file exists: `frontend-new/public/pdf.worker.mjs`

If missing, copy from:
```bash
cp node_modules/pdfjs-dist/build/pdf.worker.mjs frontend-new/public/
```

---

## Architecture Overview

### PDF Viewing Flow

```
User clicks "View"
    ↓
DocumentViewer component opens
    ↓
Loads PDF via proxy: /api/documents/:id/proxy?token=xxx
    ↓
Backend verifies token & premium access
    ↓
Backend fetches PDF from Cloudinary (axios stream)
    ↓
Backend streams PDF to frontend with CORS headers
    ↓
PDF.js renders PDF page by page on canvas
    ↓
User navigates pages with controls
```

### Download Flow

```
User clicks "Download"
    ↓
Frontend calls: /api/documents/:id/download
    ↓
Backend verifies token & premium access
    ↓
Backend returns direct Cloudinary URL
    ↓
Frontend opens URL in new tab
    ↓
Browser downloads file
```

---

## Configuration Files

### Backend: `backend/config/cloudinary.js`
```javascript
resource_type: 'raw',        // For PDFs (not 'auto' or 'image')
type: 'upload',              // Upload type
access_mode: 'public',       // Make files public
chunk_size: 6000000,         // 6MB chunks for large files
```

### Frontend: `frontend-new/src/components/DocumentViewer.jsx`
```javascript
pdfjsLib.GlobalWorkerOptions.workerSrc = '/pdf.worker.mjs';
```

### Environment: `backend/.env`
```bash
MAX_FILE_SIZE=104857600      # 100MB (backend limit)
CLOUDINARY_CLOUD_NAME=xxx
CLOUDINARY_API_KEY=xxx
CLOUDINARY_API_SECRET=xxx
```

---

## Debugging Tips

### Enable Detailed Logging

Backend already logs:
- 📄 Proxying PDF: [title]
- 🔗 Cloudinary URL: [url]
- ✅ Cloudinary response status: [status]
- 📦 Content-Type: [type]
- 📏 Content-Length: [size]

Frontend logs (in browser console):
- Loading PDF from proxy: [url]
- PDF loaded: X pages

### Check Network Tab

1. Open browser DevTools → Network
2. Filter by "proxy"
3. Check response:
   - Status: 200 OK
   - Type: application/pdf
   - Size: Should match file size

### Check Backend Logs

Look for:
- ✅ Success messages
- ❌ Error messages with details
- 🐌 Slow request warnings

---

## File Size Limits

| Service | Limit | Notes |
|---------|-------|-------|
| Backend | 100MB | Configurable in `.env` |
| Cloudinary Free | 10MB | Hard limit, upgrade needed |
| Cloudinary Paid | 100MB+ | Depends on plan |

**Recommendation:** Keep PDFs under 10MB for free tier

---

## Support

If issues persist:

1. Check all logs (backend + frontend console)
2. Run test scripts
3. Verify Cloudinary dashboard shows files as "public"
4. Test with small PDF first (< 1MB)
5. Check browser console for PDF.js errors

---

## Recent Changes

### Fixed Issues:
✅ Monitoring middleware header conflict
✅ Download endpoint using direct URLs
✅ Proxy endpoint with better error handling
✅ Cloudinary configuration for public access
✅ PDF.js worker configuration
✅ Grid layout for documents
✅ Zoom in/out feature
✅ Page navigation and keyboard shortcuts

### Known Limitations:
- Cloudinary free tier: 10MB file limit
- Old files need to be made public manually
- Large PDFs may take time to load
