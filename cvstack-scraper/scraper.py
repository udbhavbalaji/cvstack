import os
from pathlib import Path
from playwright.async_api import async_playwright
import asyncio
import sys
import re


def get_chromium_path():
    # base = os.path.dirname(__file__)
    if getattr(sys, 'frozen', False):
        # Running inside PyInstaller bundle
        base_path = Path(sys._MEIPASS)
    else:
        # Running in dev mode
        base_path = Path(__file__).resolve().parent
    path = os.path.join(base_path, "chromium", "Chromium.app", "Contents", "MacOS", "Chromium")

    return path


class LinkedinScraper:

    def __init__(self) -> None:
        self.browser = None

    async def scrape_job_text(self, url: str):
        chromium_path = get_chromium_path()
        async with async_playwright() as p:
            # browser = await p.chromium.launch(
            #     headless=True, args=["--no-sandbox", "--disable-dev-shm-usage"]
            # )
            browser = await p.chromium.launch(
                headless=True,
                args=["--no-sandbox", "--disable-dev-shm-usage"],
                executable_path=chromium_path,
            )
            context = await browser.new_context(
                user_agent="Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
                viewport={"width": 1280, "height": 800},
            )
            page = await context.new_page()
            # print(f"🔍 Visiting {url}")
            await page.goto(url, wait_until="domcontentloaded", timeout=15000)

            # Try to expand "Show more"
            try:
                await page.click(".show-more-less-html__button--more", timeout=3000)
                await asyncio.sleep(1)
            except:
                pass  # Ignore if button not found

            # Extract job title
            try:
                title = await page.text_content("h1.top-card-layout__title") or ""
            except:
                title = ""

            # Extract company
            try:
                company = await page.text_content(".topcard__org-name-link") or ""
            except:
                company = ""

            # Extract location
            try:
                location = await page.text_content(".topcard__flavor--bullet") or ""
            except:
                location = ""

            # Extract job description
            try:
                description = (
                    await page.text_content(".show-more-less-html__markup") or ""
                )
            except:
                description = ""

            await browser.close()

            return {
                "url": url,
                "job_id": self.extract_job_id(url),
                "title": title.strip(),
                "company": company.strip(),
                "location": location.strip(),
                "description": description.strip(),
                "word_count": len(description.split()),
                "char_count": len(description),
            }

    def extract_job_id(self, url: str):
        match = re.search(r"/jobs/view/(\d+)", url)
        return match.group(1) if match else None
