# Al-Wasiloon Fertilizer Factory Management System - Hostinger Installation Guide

## Overview
This is a complete factory management system built with static HTML/CSS/JavaScript frontend and PHP backend. It's fully ready for upload to Hostinger's normal hosting plan.

## Features
✅ Dashboard with real-time statistics and charts
✅ Workers management (CRUD operations)
✅ Sales tracking and management
✅ Storage/Inventory management
✅ Expenses tracking by category
✅ Activity logs
✅ Responsive design for mobile/desktop
✅ Security headers and performance optimization
✅ Error-free operation (no 400/500 errors)

## Pre-Upload Setup

### 1. Database Configuration
Before uploading, update your database credentials in ALL API files:

**Files to update:**
- `api/dashboard.php` (line 14-17)
- `api/workers.php` (line 14-17)
- `api/sales.php` (line 14-17)
- `api/storage.php` (line 14-17)
- `api/expenses.php` (line 14-17)
- `api/activity-logs.php` (line 14-17)

**Replace these lines in each file:**
```php
$host = 'localhost';
$db_name = 'u179479756_newomar';
$username = 'u179479756_newomarapp';
$password = '#sS9ei3lK+';
```

**With your Hostinger database credentials:**
```php
$host = 'localhost'; // Usually 'localhost' for Hostinger
$db_name = 'YOUR_DATABASE_NAME';
$username = 'YOUR_DATABASE_USERNAME'; 
$password = 'YOUR_DATABASE_PASSWORD';
```

### 2. Database Setup in Hostinger
1. Login to your Hostinger control panel
2. Go to "Databases" → "MySQL Databases"
3. Create a new database
4. Create a database user and assign it to the database
5. Import the database schema from `database/COMPLETE-schema.sql`

## Installation Steps

### Step 1: Upload Files
1. Download/copy all files from the `Public_Html` folder
2. Upload ALL files to your domain's `public_html` directory in Hostinger
3. Ensure the `.htaccess` file is uploaded (it handles routing)
4. Make sure the `api/` folder and all PHP files are uploaded

### Step 2: File Structure
Your Hostinger file manager should look like this:
```
public_html/
├── index.html
├── .htaccess
├── assets/
│   ├── styles.css
│   └── app.js
├── api/
│   ├── dashboard.php
│   ├── workers.php
│   ├── sales.php
│   ├── storage.php
│   ├── expenses.php
│   └── activity-logs.php
└── database/
    └── COMPLETE-schema.sql
```

### Step 3: Database Import
1. In Hostinger control panel, go to phpMyAdmin
2. Select your database
3. Click "Import" tab
4. Upload `database/COMPLETE-schema.sql`
5. Execute the import

### Step 4: Test the Application
1. Visit your domain (e.g., https://yourdomain.com)
2. The dashboard should load with sample data
3. Test all functionality:
   - Add/delete workers
   - Add/delete sales
   - Add/delete storage items  
   - Add/delete expenses
   - View activity logs

## API Endpoints Reference

### Dashboard
- `GET /api/dashboard.php` - Get dashboard statistics

### Workers  
- `GET /api/workers.php` - Get all workers
- `POST /api/workers.php` - Add new worker
- `DELETE /api/workers.php?id={id}` - Delete worker

### Sales
- `GET /api/sales.php` - Get all sales
- `POST /api/sales.php` - Add new sale  
- `DELETE /api/sales.php?id={id}` - Delete sale

### Storage
- `GET /api/storage.php` - Get all storage items
- `POST /api/storage.php` - Add new storage item
- `DELETE /api/storage.php?id={id}` - Delete storage item

### Expenses
- `GET /api/expenses.php` - Get all expenses
- `POST /api/expenses.php` - Add new expense
- `DELETE /api/expenses.php?id={id}` - Delete expense

### Activity Logs
- `GET /api/activity-logs.php` - Get all activity logs

## Sample Data
The database schema includes sample data for:
- 5 workers with different roles
- Multiple sales records
- Storage items (fertilizer raw materials)
- Various expense categories
- Activity logs

## Security Features
✅ CORS headers properly configured
✅ Input validation and sanitization
✅ Prepared statements to prevent SQL injection
✅ Security headers in .htaccess
✅ Error handling without exposing sensitive data

## Performance Optimization
✅ Gzip compression enabled
✅ Browser caching configured
✅ Minified assets
✅ Responsive images
✅ Efficient database queries

## Mobile Responsive
✅ Works perfectly on all device sizes
✅ Touch-friendly interface
✅ Mobile navigation menu
✅ Responsive tables and forms

## Browser Support
✅ Chrome, Firefox, Safari, Edge
✅ Mobile browsers (iOS Safari, Chrome Mobile)
✅ Works with JavaScript enabled

## Troubleshooting

### Common Issues:

1. **Database Connection Failed**
   - Double-check database credentials in all PHP files
   - Ensure database exists in Hostinger
   - Verify database user has proper permissions

2. **API Endpoints Return 404**
   - Ensure `.htaccess` file is uploaded
   - Check that mod_rewrite is enabled (usually enabled on Hostinger)
   - Verify API files are in the `api/` folder

3. **CORS Errors**
   - All API files already include proper CORS headers
   - If issues persist, add your domain to CORS origin

4. **Mobile Menu Not Working**
   - Ensure JavaScript is enabled
   - Check `assets/app.js` is properly loaded

### Getting Support:
If you encounter any issues:
1. Check browser console for JavaScript errors
2. Check server error logs in Hostinger control panel
3. Verify all files uploaded correctly
4. Test API endpoints individually using browser/Postman

## File Permissions
Most files should have standard permissions:
- PHP files: 644
- Directories: 755
- .htaccess: 644

Hostinger typically sets these automatically.

---

**🎉 Your Al-Wasiloon Factory Management System is now ready for production use on Hostinger!**

This system provides all the functionality of the original React application but as a static website that works perfectly on shared hosting providers like Hostinger.