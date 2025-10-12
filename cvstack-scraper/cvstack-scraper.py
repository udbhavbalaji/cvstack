#!/usr/bin/env python

import asyncio
import json
from scraper import LinkedinScraper
from argparse import ArgumentParser

async def main():
    parser = ArgumentParser()
    
    parser.add_argument("url", help="Linkedin Job Posting's Url", type=str)
    args = parser.parse_args()
    
    scraper = LinkedinScraper()
    
    scraped_data = await scraper.scrape_job_text(args.url)
    
    print(json.dumps(scraped_data))


if __name__ == "__main__":
    asyncio.run(main())
