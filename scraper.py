from playwright.sync_api import sync_playwright
from datetime import datetime
import os

PROFILE_URL = "https://www.linkedin.com/in/vivianstolt/"

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
                filename = datetime.now().strftime("%Y-%m-%d") + f"-{idx}.html"
                with open(os.path.join("posts", filename), "w", encoding="utf-8") as f:
                    f.write(html)

        browser.close()

if __name__ == "__main__":
    scrape_posts()
