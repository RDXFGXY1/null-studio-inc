# NullTracker Website

This is the official website for NullTracker Discord Bot, organized with a clean folder structure for better maintainability and development workflow.

## 📁 Folder Structure

```
website/
├── index.html                 # Main homepage
├── package.json              # Project configuration
├── README.md                 # This file
│
├── pages/                    # HTML pages
│   ├── commands.html         # Bot commands documentation
│   ├── donate.html          # Donation page with PayPal integration
│   └── payment.html         # Premium payment page
│
├── styles/                  # CSS stylesheets
│   ├── styles.css           # Main/global styles
│   ├── donate-styles.css    # Donation page specific styles
│   ├── payment-styles.css   # Payment page specific styles
│   └── update_page_css.css  # Update page styles
│
├── scripts/                 # JavaScript files
│   ├── script.js            # Main/global scripts
│   ├── donate.js            # Donation functionality with PayPal
│   ├── payment.js           # Payment processing logic
│   └── update_page_js.js    # Update page scripts
│
├── assets/                  # Static assets
│   ├── images/              # Image files (logos, banners, etc.)
│   ├── icons/               # Icon files
│   └── fonts/               # Custom font files
│
└── update/                  # Update/changelog pages
    └── update-2.7-NullTracker.html
```

## 🚀 Features

### Pages
- **Homepage** (`index.html`) - Main landing page with features and pricing
- **Commands** (`pages/commands.html`) - Complete bot command documentation
- **Payment** (`pages/payment.html`) - Premium subscription page with PayPal integration
- **Donate** (`pages/donate.html`) - Donation page with donor tracking and JSON export

### Key Functionality
- **PayPal Integration** - Secure payment processing for both premium subscriptions and donations
- **Donor Management** - Local storage-based donor tracking with export functionality
- **Responsive Design** - Mobile-first design that works on all devices
- **Modern UI/UX** - Clean, professional design with smooth animations

## 🔧 Development

### File References
All file references have been updated to work with the new folder structure:
- CSS files are referenced from `styles/` folder
- JavaScript files are referenced from `scripts/` folder  
- Page navigation uses relative paths (`pages/` folder)
- Assets can be placed in `assets/` subfolders

### Navigation
The website includes consistent navigation across all pages:
- Home
- Features (index.html#features)
- Premium (index.html#premium)
- Commands
- Payment
- Donate

## 💻 Deployment

This website is designed to be hosted on GitHub Pages or any static hosting service:
1. All files use relative paths
2. No server-side dependencies
3. Client-side JavaScript handles all interactivity
4. PayPal SDK loaded from CDN

## 📋 Notes

- The donation system saves donor data locally and provides JSON export functionality
- Payment verification information is displayed to users for manual processing
- All PayPal integrations are ready for production use
- The folder structure supports easy expansion and maintenance

---

Made with ❤️ for the NullTracker Discord Bot community