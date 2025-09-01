# Google Drive Integration Setup

This app now includes an **automatic** Google Drive viewer that displays images and videos from the specific week of your review.

## 🎯 How It Works

The app automatically:

1. **Detects the review date** (e.g., Week 29 of 2025)
2. **Navigates to the correct folder** in your Google Drive structure
3. **Shows all photos and videos** from that specific week
4. **No manual folder ID entry required!**

## Setup Instructions

### 1. Google Drive API Key ✅

The app is already configured with a working API key: `AIzaSyB0jOmTTQlECUDwNIFRGv_70Tiak4fINcY`

### 2. Folder Structure Setup

Your Google Drive must have this exact structure:

```
📁 Parent Folder (ID: 14AhTZeRKMncTMKMe-kE_1i2A_C_pErj-)
├── 📁 2025
│   ├── 📁 W29 (Week 29)
│   ├── 📁 W30 (Week 30)
│   └── 📁 W31 (Week 31)
├── 📁 2024
│   ├── 📁 W52 (Week 52)
│   └── 📁 W53 (Week 53)
└── 📁 2023
    └── 📁 W52 (Week 52)
```

### 3. Make Folders Public

-   Right-click on the **parent folder** (14AhTZeRKMncTMKMe-kE_1i2A_C_pErj-)
-   Select "Share" → "Change to anyone with the link"
-   Set permission to "Viewer"
-   **Important**: This makes the parent folder and all subfolders public

### 4. Use in the App

-   Go to any Review page
-   The "📁 Week Photos & Videos" section automatically appears
-   Files are automatically loaded based on the review date
-   **No manual input required!**

## 🚀 Features

-   ✅ **Fully Automatic**: No folder ID entry needed
-   ✅ **Smart Navigation**: Automatically finds year/week folders
-   ✅ **Date-Based**: Shows files from the exact week of your review
-   ✅ **Image Support**: JPG, PNG, GIF, WebP, etc.
-   ✅ **Video Support**: MP4, MOV, AVI, etc.
-   ✅ **Responsive Grid**: Beautiful layout on all devices
-   ✅ **File Information**: Size, date, and type display
-   ✅ **Direct Links**: Click to open in Google Drive

## 📁 Folder Naming Rules

-   **Year folders**: Must be exactly "2025", "2024", "2023", etc.
-   **Week folders**: Must start with "W" followed by week number (e.g., "W29", "W30")
-   **Case sensitive**: "w29" or "W 29" will not work

## 🔧 Troubleshooting

-   **"Year folder X not found"**: Check that you have a folder named exactly "2025" (or the year you need)
-   **"Week folder WX not found"**: Check that you have a folder named exactly "W29" (or the week you need)
-   **"No files found"**: The week folder exists but is empty
-   **"API not ready"**: Wait a moment for the Google API to load
-   **Images not loading**: Ensure the parent folder has "Anyone with the link can view" permission

## 🔒 Security Note

This integration only works with **public** folders. The parent folder and all subfolders will be publicly accessible. Never store private or sensitive content this way.

## 📝 Example

If you create a review for Week 29 of 2025:

1. App automatically looks for folder: `14AhTZeRKMncTMKMe-kE_1i2A_C_pErj-/2025/W29`
2. Displays all images and videos from that folder
3. Shows the current path: "2025/W29"
4. No manual configuration needed!
