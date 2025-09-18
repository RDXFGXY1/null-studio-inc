#!/usr/bin/env python3
"""
NullTracker Server Count Updater Bot
Collects Discord server count and updates GitHub repository with statistics
"""

import discord
import json
import requests
import base64
import os
import logging
from datetime import datetime, timezone
from typing import Optional, Dict, Any
from dotenv import load_dotenv

# Load environment variables from .env file
load_dotenv()

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(levelname)s - %(message)s',
    handlers=[
        logging.FileHandler('server_count_updater.log'),
        logging.StreamHandler()
    ]
)
logger = logging.getLogger(__name__)

class ServerCountUpdater:
    def __init__(self):
        # GitHub configuration
        self.github_token = os.getenv('GITHUB_TOKEN')
        self.repo_name = os.getenv('REPO_NAME', 'yourusername/yourrepo')
        self.file_path = 'stats/server_count.json'
        self.branch = 'main'
        
        # Discord configuration
        self.discord_token = os.getenv('DISCORD_BOT_TOKEN')
        
        # Validate configuration
        if not self.github_token:
            raise ValueError("GITHUB_TOKEN environment variable is required")
        if not self.discord_token:
            raise ValueError("DISCORD_BOT_TOKEN environment variable is required")
    
    def create_stats_data(self, server_count: int, additional_stats: Optional[Dict] = None) -> Dict[str, Any]:
        """Create the statistics data structure"""
        stats = {
            "server_count": server_count,
            "updated": datetime.now(timezone.utc).isoformat(),
            "timestamp": int(datetime.now(timezone.utc).timestamp()),
            "bot_status": "online"
        }
        
        if additional_stats:
            stats.update(additional_stats)
        
        return stats
    
    def get_current_file_sha(self) -> Optional[str]:
        """Get the current SHA of the file from GitHub (required for updates)"""
        try:
            headers = {
                "Authorization": f"Bearer {self.github_token}",
                "Accept": "application/vnd.github+json",
                "X-GitHub-Api-Version": "2022-11-28"
            }
            
            url = f"https://api.github.com/repos/{self.repo_name}/contents/{self.file_path}"
            response = requests.get(url, headers=headers, timeout=30)
            
            if response.status_code == 200:
                return response.json().get('sha')
            elif response.status_code == 404:
                logger.info("File doesn't exist yet, will create new file")
                return None
            else:
                logger.error(f"Error getting file SHA: {response.status_code} - {response.text}")
                return None
                
        except requests.RequestException as e:
            logger.error(f"Request failed when getting file SHA: {e}")
            return None
    
    def update_github_file(self, stats_data: Dict[str, Any]) -> bool:
        """Update the JSON file on GitHub with new statistics"""
        try:
            headers = {
                "Authorization": f"Bearer {self.github_token}",
                "Accept": "application/vnd.github+json",
                "X-GitHub-Api-Version": "2022-11-28"
            }
            
            # Get current file SHA
            current_sha = self.get_current_file_sha()
            
            # Convert stats to JSON
            json_content = json.dumps(stats_data, indent=2)
            
            # Encode content to base64
            encoded_content = base64.b64encode(json_content.encode('utf-8')).decode('utf-8')
            
            # Prepare the update payload
            payload = {
                "message": f"🤖 Update server stats - {stats_data['server_count']} servers ({datetime.now(timezone.utc).strftime('%Y-%m-%d %H:%M:%S')} UTC)",
                "content": encoded_content,
                "branch": self.branch
            }
            
            # Add SHA if file exists (for updates)
            if current_sha:
                payload["sha"] = current_sha
            
            # Make the API request
            url = f"https://api.github.com/repos/{self.repo_name}/contents/{self.file_path}"
            response = requests.put(url, headers=headers, json=payload, timeout=30)
            
            if response.status_code in [200, 201]:
                logger.info(f"Successfully updated GitHub file with {stats_data['server_count']} servers")
                return True
            else:
                logger.error(f"Failed to update GitHub file: {response.status_code} - {response.text}")
                return False
                
        except requests.RequestException as e:
            logger.error(f"Request failed when updating GitHub file: {e}")
            return False
        except Exception as e:
            logger.error(f"Unexpected error updating GitHub file: {e}")
            return False
    
    async def collect_discord_stats(self) -> Optional[Dict[str, Any]]:
        """Collect statistics from Discord bot"""
        try:
            # Create Discord client with minimal intents
            intents = discord.Intents.none()
            client = discord.Client(intents=intents)
            
            stats_collected = False
            collected_stats = None
            
            @client.event
            async def on_ready():
                nonlocal stats_collected, collected_stats
                try:
                    logger.info(f"Bot logged in as {client.user}")
                    
                    # Collect server count
                    server_count = len(client.guilds)
                    
                    # Collect additional stats
                    total_members = sum(guild.member_count or 0 for guild in client.guilds)
                    
                    # Create stats data
                    additional_stats = {
                        "total_members": total_members,
                        "bot_name": str(client.user),
                        "bot_id": client.user.id
                    }
                    
                    collected_stats = self.create_stats_data(server_count, additional_stats)
                    
                    logger.info(f"Collected stats: {server_count} servers, {total_members} total members")
                    stats_collected = True
                    
                except Exception as e:
                    logger.error(f"Error collecting Discord stats: {e}")
                finally:
                    await client.close()
            
            # Connect to Discord
            await client.start(self.discord_token)
            
            return collected_stats if stats_collected else None
            
        except discord.LoginFailure:
            logger.error("Discord login failed - check your bot token")
            return None
        except Exception as e:
            logger.error(f"Unexpected error collecting Discord stats: {e}")
            return None
    
    async def run(self) -> bool:
        """Main execution method"""
        logger.info("Starting server count update process...")
        
        try:
            # Collect Discord statistics
            stats_data = await self.collect_discord_stats()
            
            if not stats_data:
                logger.error("Failed to collect Discord statistics")
                return False
            
            # Update GitHub file
            success = self.update_github_file(stats_data)
            
            if success:
                logger.info(f"✅ Successfully updated server count: {stats_data['server_count']} servers")
                return True
            else:
                logger.error("❌ Failed to update GitHub file")
                return False
                
        except Exception as e:
            logger.error(f"Unexpected error in main execution: {e}")
            return False

def create_sample_env_file():
    """Create a sample .env file for configuration"""
    env_content = """# NullTracker Server Count Updater Configuration
# Copy this file to .env and fill in your actual values

# Discord Bot Token (from Discord Developer Portal)
DISCORD_BOT_TOKEN=your_discord_bot_token_here

# GitHub Personal Access Token (fine-grained or classic with repo scope)
GITHUB_TOKEN=ghp_your_github_token_here

# GitHub Repository (format: username/repository-name)
REPO_NAME=yourusername/yourrepository

# Optional: Enable debug logging
# DEBUG=true
"""
    
    try:
        with open('.env.example', 'w') as f:
            f.write(env_content)
        print("Created .env.example file - copy it to .env and configure your tokens")
    except Exception as e:
        print(f"Failed to create .env.example file: {e}")

async def main():
    """Main entry point"""
    try:
        # Check if this is the first run
        if not os.path.exists('.env') and not os.getenv('DISCORD_BOT_TOKEN'):
            print("⚠️  No configuration found!")
            create_sample_env_file()
            print("\n📝 Setup Instructions:")
            print("1. Copy .env.example to .env")
            print("2. Fill in your Discord bot token and GitHub token")
            print("3. Set your GitHub repository name")
            print("4. Run this script again")
            return
        
        # Try to load environment variables from .env file
        if os.path.exists('.env'):
            try:
                from dotenv import load_dotenv
                load_dotenv()
                logger.info("Loaded configuration from .env file")
            except ImportError:
                logger.warning("python-dotenv not installed, relying on environment variables")
        
        # Create and run the updater
        updater = ServerCountUpdater()
        success = await updater.run()
        
        if success:
            print("✅ Server count update completed successfully!")
            exit(0)
        else:
            print("❌ Server count update failed!")
            exit(1)
            
    except ValueError as e:
        logger.error(f"Configuration error: {e}")
        print(f"❌ Configuration error: {e}")
        print("Please check your environment variables or .env file")
        exit(1)
    except Exception as e:
        logger.error(f"Unexpected error in main: {e}")
        print(f"❌ Unexpected error: {e}")
        exit(1)

if __name__ == "__main__":
    import asyncio
    asyncio.run(main())