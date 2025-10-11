from playwright.sync_api import sync_playwright
from datetime import datetime
import os
import re

PROFILE_URL = "https://www.linkedin.com/in/vivianstolt/"

def extract_post_time_text(post):
    """Extract LinkedIn's original timestamp from post (e.g. '5 months ago')"""
    try:
        # LinkedIn uses various timestamp selectors - try multiple ones
        time_selectors = [
            "time",  # General time element
            ".update-components-actor__sub-description time",
            ".feed-shared-actor__sub-description time",
            ".update-components-actor__sub-description",
            ".feed-shared-actor__sub-description",
            "[aria-label*='ago']",
            "span[aria-describedby*='time']",
            ".feed-shared-update-v2__description-wrapper time",
            ".feed-shared-actor time"
        ]
        
        for selector in time_selectors:
            time_elements = post.locator(selector)
            for i in range(time_elements.count()):
                time_element = time_elements.nth(i)
                time_text = time_element.inner_text().strip()
                
                # Check that text contains "ago" or time-related words
                if time_text and ("ago" in time_text.lower() or 
                                 "month" in time_text.lower() or 
                                 "week" in time_text.lower() or 
                                 "day" in time_text.lower() or
                                 "mo" in time_text.lower() or
                                 "yr" in time_text.lower() or
                                 "year" in time_text.lower()):
                    
                    # Clean text for filename compatibility
                    cleaned_text = re.sub(r'[^\w\s-]', '', time_text.lower())
                    cleaned_text = re.sub(r'\s+', '-', cleaned_text)
                    return cleaned_text[:30]  # Limit length
                    
        # If no timestamp found, fallback to general selector text
        actor_element = post.locator(".feed-shared-actor__description, .update-components-actor__description").first
        if actor_element.count() > 0:
            actor_text = actor_element.inner_text()
            # Search for texts containing "ago"
            lines = actor_text.split('\n')
            for line in lines:
                if 'ago' in line.lower() and len(line.strip()) < 50:
                    cleaned = re.sub(r'[^\w\s-]', '', line.strip().lower())
                    cleaned = re.sub(r'\s+', '-', cleaned)
                    return cleaned[:30]
                    
    except Exception as e:
        print(f"Error parsing timestamp: {e}")
    
    # If failed, use generic identifier
    return "unknown-time"

def scrape_posts():
    os.makedirs("posts", exist_ok=True)

    with sync_playwright() as p:
        browser = p.chromium.launch(headless=False)  # False = näet mitä tapahtuu
        page = browser.new_page()
        page.goto(PROFILE_URL)

        # odota että feed ehtii latautua
        page.wait_for_timeout(95000)

        # Etsi kaikki postaukset (huom: tämä selektori voi muuttua!)
        posts = page.locator("div.feed-shared-update-v2").all()
        print(f"Löytyi {len(posts)} postausta")

        if not posts:
            # Luo varmuuden vuoksi tiedosto, ettei jää tyhjäksi
            filename = datetime.now().strftime("%Y-%m-%d") + "-no-posts.html"
            with open(os.path.join("posts", filename), "w", encoding="utf-8") as f:
                f.write("<p>Postauksia ei löytynyt (selektori ehkä vanhentunut).</p>")
        else:
            for idx, post in enumerate(posts[:5]):  # ota 5 uusinta
                html = post.inner_html()
                # Kaiva LinkedIn:n alkuperäinen aikaleima
                time_text = extract_post_time_text(post)
                filename = f"{time_text}-post-{idx}.html"
                with open(os.path.join("posts", filename), "w", encoding="utf-8") as f:
                    f.write(html)
                print(f"Tallennettu postaus: {filename} (aika: {time_text})")

        browser.close()

if __name__ == "__main__":
    scrape_posts()
