# 🤖 NullTracker Live Server Count System Setup Guide

This guide will help you set up an automated system to display live Discord server count on your website using GitHub and a free cron service.

## 📋 System Overview

```
[Discord Bot] → [GitHub API] → [JSON File] → [Website] → [Live Server Count]
```

1. **Discord Bot** collects server count
2. **GitHub API** updates JSON file in repository
3. **Website** fetches JSON file from GitHub
4. **Live updates** every 5 minutes automatically

## 🔧 Prerequisites

- Discord Bot Token
- GitHub Repository
- GitHub Personal Access Token
- Free cron job account (cron-job.org)
- Python 3.7+ (for running the bot)

---

## 📂 Step 1: Repository Setup

### 1.1 Create GitHub Repository Structure

Create these files in your GitHub repository:

```
your-repo/
├── stats/
│   └── server_count.json  (will be created automatically)
└── (your existing files)
```

### 1.2 Initial JSON File

Create `stats/server_count.json` with this content:
```json
{
  "server_count": 0,
  "updated": "2025-01-01T00:00:00.000000+00:00",
  "timestamp": 1704067200,
  "bot_status": "offline",
  "total_members": 0,
  "bot_name": "NullTracker",
  "bot_id": 0
}
```

---

## 🔑 Step 2: Tokens & Permissions

### 2.1 Discord Bot Token

1. Go to [Discord Developer Portal](https://discord.com/developers/applications)
2. Select your bot application
3. Go to "Bot" section
4. Copy the bot token
5. **Keep this token secure!**

### 2.2 GitHub Personal Access Token

1. Go to GitHub → Settings → Developer Settings → Personal Access Tokens
2. Click "Generate new token (classic)" or "Fine-grained tokens"
3. For **Classic Token**:
   - Select scopes: `repo` (full repository access)
   - Copy the token (starts with `ghp_`)
4. For **Fine-grained Token**:
   - Select your repository
   - Grant: Contents (Read & Write), Pull requests (Read & Write)
   - Copy the token

---

## 🐍 Step 3: Bot Setup

### 3.1 Install Dependencies

```bash
cd bot
pip install -r requirements.txt
```

Or install manually:
```bash
pip install discord.py requests python-dotenv
```

### 3.2 Configuration

Create `.env` file in the `bot/` directory:
```env
# NullTracker Server Count Updater Configuration
DISCORD_BOT_TOKEN=your_discord_bot_token_here
GITHUB_TOKEN=ghp_your_github_token_here
REPO_NAME=yourusername/yourrepository
```

### 3.3 Test the Bot

Run the bot locally to test:
```bash
cd bot
python update_server_count.py
```

Expected output:
```
✅ Server count update completed successfully!
```

Check your GitHub repository - you should see a new commit updating `stats/server_count.json`.

---

## 🌐 Step 4: Website Configuration

### 4.1 Update JavaScript Configuration

Edit `scripts/server-stats.js` and update line 365:
```javascript
const serverStats = new ServerStats({
    githubRepo: 'yourusername/yourrepo', // 👈 UPDATE THIS
    debug: window.location.hostname === 'localhost'
});
```

### 4.2 Test Website

1. Open your website locally or on your server
2. Check browser console for: `🤖 NullTracker server stats initialized`
3. The server count should load automatically
4. Check browser DevTools Network tab to see the GitHub API call

---

## ⏰ Step 5: Automation Setup

### 5.1 Using cron-job.org (Recommended)

1. **Sign up** at [cron-job.org](https://cron-job.org)

2. **Create a new cronjob**:
   - **Title**: NullTracker Server Count Update
   - **URL**: `https://your-server.com/run-bot` (see webhook setup below)
   - **Schedule**: Every 15 minutes (or hourly)
   - **Notifications**: Enable failure notifications

### 5.2 Webhook Server (Optional)

If you want to trigger the bot via HTTP, create this simple webhook:

```python
# webhook_server.py
from flask import Flask
import subprocess
import os

app = Flask(__name__)

@app.route('/run-bot', methods=['GET', 'POST'])
def run_bot():
    try:
        result = subprocess.run(['python', 'bot/update_server_count.py'], 
                              capture_output=True, text=True, timeout=60)
        if result.returncode == 0:
            return "✅ Bot executed successfully", 200
        else:
            return f"❌ Bot failed: {result.stderr}", 500
    except Exception as e:
        return f"❌ Error: {str(e)}", 500

if __name__ == '__main__':
    app.run(port=5000)
```

### 5.3 Alternative: GitHub Actions

Create `.github/workflows/update-stats.yml`:
```yaml
name: Update Server Stats
on:
  schedule:
    - cron: '*/15 * * * *'  # Every 15 minutes
  workflow_dispatch:

jobs:
  update-stats:
    runs-on: ubuntu-latest
    steps:
    - uses: actions/checkout@v3
    - name: Set up Python
      uses: actions/setup-python@v4
      with:
        python-version: '3.9'
    - name: Install dependencies
      run: |
        pip install discord.py requests python-dotenv
    - name: Update server stats
      env:
        DISCORD_BOT_TOKEN: ${{ secrets.DISCORD_BOT_TOKEN }}
        GITHUB_TOKEN: ${{ secrets.GITHUB_TOKEN }}
        REPO_NAME: ${{ github.repository }}
      run: |
        python bot/update_server_count.py
```

---

## 🎯 Step 6: HTML Integration

### 6.1 Basic Implementation

Add to your HTML where you want the server count:
```html
<!-- Loading state -->
<span id="server-count" class="stat-number">Loading...</span>

<!-- With additional stats -->
<div class="stats-container">
    <div class="stat">
        <span id="server-count">Loading...</span>
        <span>Servers</span>
    </div>
    <div class="stat">
        <span id="total-members">Loading...</span>
        <span>Members</span>
    </div>
    <div class="stat">
        <span id="bot-status">Loading...</span>
        <span>Status</span>
    </div>
</div>

<!-- Include the script -->
<script src="scripts/server-stats.js"></script>
```

### 6.2 Advanced Implementation

```html
<!-- Using data attributes -->
<div class="stats-grid">
    <div class="stat-card">
        <span data-stat="server_count">Loading...</span>
        <label>Protected Servers</label>
    </div>
    <div class="stat-card">
        <span data-stat="total_members">Loading...</span>
        <label>Total Members</label>
    </div>
    <div class="stat-card">
        <span data-stat="bot_status">Loading...</span>
        <label>Bot Status</label>
    </div>
    <div class="stat-card">
        <span data-stat="updated">Loading...</span>
        <label>Last Updated</label>
    </div>
</div>
```

---

## 🎨 Step 7: Styling (Optional)

Add CSS for loading states and animations:

```css
/* Loading animation */
.stat-number {
    transition: all 0.3s ease;
}

.stat-number.loading {
    opacity: 0.6;
    animation: pulse 2s infinite;
}

.stat-number.stat-loaded {
    opacity: 1;
    transform: scale(1.05);
}

@keyframes pulse {
    0%, 100% { opacity: 0.6; }
    50% { opacity: 1; }
}

/* Status indicators */
.bot-status.online {
    color: #10b981;
}

.bot-status.offline {
    color: #ef4444;
}
```

---

## 🔍 Step 8: Testing & Verification

### 8.1 Test Bot Locally
```bash
cd bot
python update_server_count.py
```

### 8.2 Verify GitHub Update
- Check your repository commits
- Verify `stats/server_count.json` was updated
- Check commit message format

### 8.3 Test Website
- Open browser DevTools → Console
- Look for: `🤖 NullTracker server stats initialized`
- Check Network tab for GitHub API calls
- Verify server count displays correctly

### 8.4 Test Cron Job
- Manually trigger your cron job
- Check execution logs
- Verify GitHub was updated

---

## 🐛 Troubleshooting

### Common Issues

#### ❌ "Configuration error: GITHUB_TOKEN environment variable is required"
**Solution**: Check your `.env` file has the correct tokens

#### ❌ "HTTP 401: Unauthorized" (GitHub API)
**Solution**: 
- Regenerate your GitHub token
- Ensure token has `repo` scope
- Check token expiration

#### ❌ "HTTP 403: Forbidden" (GitHub API)
**Solution**: 
- Check repository name format: `username/repository`
- Verify repository is accessible
- Ensure token has write permissions

#### ❌ "Discord login failed"
**Solution**:
- Check Discord bot token
- Ensure bot is added to servers
- Verify bot has necessary permissions

#### ❌ Website shows "0" servers
**Solution**:
- Check browser console for errors
- Verify GitHub repository URL in JavaScript
- Check CORS policy (GitHub raw content should work)
- Ensure JSON file exists and is properly formatted

#### ❌ Cron job fails
**Solution**:
- Check webhook server logs
- Verify webhook URL is accessible
- Test webhook manually with curl/Postman
- Check server timeout settings

---

## 🔐 Security Best Practices

### Environment Variables
- Never commit `.env` files
- Use secure token generation
- Rotate tokens regularly

### GitHub Repository
- Consider using private repository for sensitive data
- Use fine-grained tokens when possible
- Monitor repository access

### Webhook Security
```python
# Add authentication to webhook
SECRET_KEY = "your-secret-key"

@app.route('/run-bot', methods=['POST'])
def run_bot():
    auth_header = request.headers.get('Authorization')
    if auth_header != f"Bearer {SECRET_KEY}":
        return "Unauthorized", 401
    # ... rest of code
```

---

## 📊 Monitoring & Maintenance

### 1. Set up monitoring
- Enable cron job failure notifications
- Monitor GitHub API rate limits
- Track website error rates

### 2. Regular maintenance
- Update dependencies monthly
- Rotate tokens quarterly
- Check logs weekly

### 3. Scaling considerations
- GitHub has API rate limits (5,000 requests/hour)
- Consider caching for high-traffic websites
- Monitor bandwidth usage

---

## 🚀 Advanced Features

### Custom Metrics
Add to `update_server_count.py`:
```python
additional_stats = {
    "total_members": total_members,
    "bot_name": str(client.user),
    "bot_id": client.user.id,
    "total_channels": sum(len(guild.channels) for guild in client.guilds),
    "total_roles": sum(len(guild.roles) for guild in client.guilds)
}
```

### Multiple Bots
```javascript
const serverStats = new ServerStats({
    githubRepo: 'username/repo',
    statsFile: 'stats/nulltracker_stats.json'  // Different file per bot
});
```

### Historical Data
```python
# Store historical data
stats_data = {
    "server_count": server_count,
    "updated": datetime.now(timezone.utc).isoformat(),
    "history": {
        "daily": daily_counts,
        "weekly": weekly_counts
    }
}
```

---

## 📞 Support

### Getting Help
- Check GitHub Issues for common problems
- Join Discord server for community support
- Create detailed bug reports with logs

### Contributing
- Submit improvements via Pull Requests
- Report bugs with reproduction steps
- Suggest new features

---

## ✅ Checklist

Use this checklist to ensure everything is set up correctly:

- [ ] Created GitHub repository with `stats/` folder
- [ ] Generated GitHub Personal Access Token
- [ ] Got Discord Bot Token
- [ ] Created `.env` file with tokens
- [ ] Tested bot locally (`python update_server_count.py`)
- [ ] Verified GitHub file was updated
- [ ] Updated JavaScript with correct repository name
- [ ] Added server stats script to HTML
- [ ] Tested website displays server count
- [ ] Set up cron job automation
- [ ] Configured error monitoring
- [ ] Set up failure notifications

---

## 📈 Example Output

### Successful Bot Execution
```
2025-01-18 12:00:00 - INFO - Starting server count update process...
2025-01-18 12:00:01 - INFO - Bot logged in as NullTracker#1234
2025-01-18 12:00:01 - INFO - Collected stats: 1337 servers, 50000 total members
2025-01-18 12:00:02 - INFO - Successfully updated GitHub file with 1337 servers
✅ Server count update completed successfully!
```

### Website Console Output
```
🤖 NullTracker server stats initialized
[ServerStats] Starting auto-update with interval: 300000ms
[ServerStats] Attempt 1/3: Fetching https://raw.githubusercontent.com/username/repo/main/stats/server_count.json
[ServerStats] Successfully fetched server stats: {server_count: 1337, ...}
[ServerStats] DOM updated with stats: {server-count: "1.3K", ...}
```

### Final JSON File
```json
{
  "server_count": 1337,
  "updated": "2025-01-18T12:00:00.123456+00:00",
  "timestamp": 1705579200,
  "bot_status": "online",
  "total_members": 50000,
  "bot_name": "NullTracker#1234",
  "bot_id": 1234567890
}
```

---

🎉 **Congratulations!** Your automated server count system is now live and updating automatically!