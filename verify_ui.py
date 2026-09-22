from playwright.sync_api import sync_playwright
import os

def run_verification():
    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)

        # Test 1: Projector Viewport (1920x1080)
        context1 = browser.new_context(
            viewport={'width': 1920, 'height': 1080},
            record_video_dir="/home/jules/verification/videos"
        )
        page1 = context1.new_page()
        page1.goto(f"file://{os.path.abspath('index.html')}")
        page1.wait_for_timeout(500)

        # Click Projector mode and force click start
        page1.click("#projector-mode-btn")
        page1.wait_for_timeout(500)
        page1.click("#start-game-btn", force=True)
        page1.wait_for_timeout(1000)
        page1.screenshot(path="/home/jules/verification/screenshots/projector_1080p.png")
        context1.close()

        # Test 2: Laptop Viewport (1366x768) - Mahjong
        context2 = browser.new_context(
            viewport={'width': 1366, 'height': 768},
            record_video_dir="/home/jules/verification/videos"
        )
        page2 = context2.new_page()
        page2.goto(f"file://{os.path.abspath('index.html')}")
        page2.wait_for_timeout(500)
        page2.click(".mode-btn[data-mode='mahjong']")
        page2.wait_for_timeout(500)
        page2.click("#start-game-btn", force=True)
        page2.wait_for_timeout(1000)
        page2.screenshot(path="/home/jules/verification/screenshots/laptop_mahjong.png")
        context2.close()

        # Test 3: Tablet Viewport (1024x768) - Balloon Game
        context3 = browser.new_context(
            viewport={'width': 1024, 'height': 768},
            record_video_dir="/home/jules/verification/videos"
        )
        page3 = context3.new_page()
        page3.goto(f"file://{os.path.abspath('index.html')}")
        page3.wait_for_timeout(500)
        page3.click("#balloon-mode-btn")
        page3.wait_for_timeout(500)
        page3.click("#start-game-btn", force=True)
        page3.wait_for_timeout(1000)
        page3.screenshot(path="/home/jules/verification/screenshots/tablet_balloon.png")
        context3.close()

        browser.close()

if __name__ == "__main__":
    run_verification()
