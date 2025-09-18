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

# Load .env config
load_dotenv()

# Setup logging without emojis (to avoid Windows UnicodeEncodeError)
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(levelname)s - %(message)s',
    handlers=[
        logging.FileHandler('server_count_updater.log', encoding='utf-8'),
        logging.StreamHandler()
    ]
)
logger = logging.getLogger(__name__)


class ServerCountUpdater:
    def __init__(self):
        # GitHub
        self.github_token = os.getenv('GITHUB_TOKEN')
        self.repo_name = os.getenv('REPO_NAME', 'yourusername/yourrepo')
        self.file_path = 'stats/server_count.json'
        self.branch = 'main'

        # Discord
        self.discord_token = os.getenv('DISCORD_BOT_TOKEN')

        if not self.github_token:
            raise ValueError("Missing GITHUB_TOKEN in .env")
        if not self.discord_token:
            raise ValueError("Missing DISCORD_BOT_TOKEN in .env")

    def create_stats_data(self, server_count: int, extra: Optional[Dict] = None) -> Dict[str, Any]:
        stats = {
            "server_count": server_count,
            "updated": datetime.now(timezone.utc).isoformat(),
            "timestamp": int(datetime.now(timezone.utc).timestamp()),
            "bot_status": "online"
        }
        if extra:
            stats.update(extra)
        return stats

    def get_current_file_sha(self) -> Optional[str]:
        try:
            headers = {
                "Authorization": f"Bearer {self.github_token}",
                "Accept": "application/vnd.github+json"
            }
            url = f"https://api.github.com/repos/{self.repo_name}/contents/{self.file_path}"
            res = requests.get(url, headers=headers, timeout=30)
            if res.status_code == 200:
                return res.json().get('sha')
            elif res.status_code == 404:
                logger.info("File not found, will create new.")
                return None
            else:
                logger.error(f"GitHub SHA fetch failed: {res.status_code} - {res.text}")
                return None
        except Exception as e:
            logger.error(f"Exception while fetching SHA: {e}")
            return None

    def update_github_file(self, data: Dict[str, Any]) -> bool:
        try:
            headers = {
                "Authorization": f"Bearer {self.github_token}",
                "Accept": "application/vnd.github+json"
            }

            current_sha = self.get_current_file_sha()

            json_content = json.dumps(data, indent=2)
            encoded = base64.b64encode(json_content.encode()).decode()

            payload = {
                "message": f"Update: {data['server_count']} servers @ {datetime.now(timezone.utc).isoformat()}",
                "content": encoded,
                "branch": self.branch
            }

            if current_sha:
                payload["sha"] = current_sha

            url = f"https://api.github.com/repos/{self.repo_name}/contents/{self.file_path}"
            res = requests.put(url, headers=headers, json=payload, timeout=30)

            if res.status_code in [200, 201]:
                logger.info(f"GitHub file updated with {data['server_count']} servers.")
                return True
            else:
                logger.error(f"GitHub update failed: {res.status_code} - {res.text}")
                return False

        except Exception as e:
            logger.error(f"Error during GitHub update: {e}")
            return False

    async def collect_discord_stats(self) -> Optional[Dict[str, Any]]:
        try:
            intents = discord.Intents.default()
            intents.guilds = True
            intents.members = True

            client = discord.Client(intents=intents)

            stats_data = {}

            @client.event
            async def on_ready():
                try:
                    logger.info(f"Logged in as {client.user}")
                    server_count = len(client.guilds)
                    total_members = sum(g.member_count or 0 for g in client.guilds)
                    stats_data.update(self.create_stats_data(server_count, {
                        "total_members": total_members,
                        "bot_name": str(client.user),
                        "bot_id": client.user.id
                    }))
                    logger.info(f"Stats: {server_count} servers, {total_members} members")
                except Exception as e:
                    logger.error(f"Stats error: {e}")
                finally:
                    await client.close()

            await client.login(self.discord_token)
            await client.connect()
            return stats_data if stats_data else None

        except discord.LoginFailure:
            logger.error("Discord login failed. Check your token.")
            return None
        except Exception as e:
            logger.error(f"Unexpected error: {e}")
            return None

    async def run(self) -> bool:
        logger.info("Starting update process...")
        stats = await self.collect_discord_stats()
        if not stats:
            logger.error("Stats collection failed.")
            return False
        return self.update_github_file(stats)


async def main():
    try:
        updater = ServerCountUpdater()
        success = await updater.run()
        if success:
            print("Server count updated successfully!")
        else:
            print("Failed to update server count.")
    except Exception as e:
        logger.error(f"Fatal error: {e}")


if __name__ == '__main__':
    import asyncio
    asyncio.run(main())
