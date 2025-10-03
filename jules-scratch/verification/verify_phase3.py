import re
from playwright.sync_api import sync_playwright, expect

def run_verification(playwright):
    browser = playwright.chromium.launch(headless=True)
    context = browser.new_context()
    page = context.new_page()

    base_url = "http://127.0.0.1:8080"

    # 1. Verify PuppyCard and Navbar changes
    print("Navigating to Puppies page...")
    page.goto(f"{base_url}/puppies")

    # First, wait for the page component itself to load by looking for a stable header
    print("Waiting for Puppies page component to load...")
    expect(page.get_by_role("heading", name="Available Puppies")).to_be_visible(timeout=20000)

    # Now, wait for one of the possible content states to be visible
    print("Waiting for page content (cards, empty state, or error)...")
    # Use a more specific locator for the puppy grid to avoid strict mode violation
    puppy_grid = page.locator("div.grid.md\\:grid-cols-2.lg\\:grid-cols-3")
    no_puppies_message = page.get_by_role("heading", name="No puppies found")
    error_message = page.get_by_role("heading", name="Error loading puppies")

    expect(puppy_grid.or_(no_puppies_message).or_(error_message)).to_be_visible(timeout=20000)

    print("Capturing screenshot of Puppies page state...")
    page.screenshot(path="jules-scratch/verification/01_puppies_page.png")

    # 2. Verify enhanced 404 page
    print("Navigating to a non-existent page...")
    page.goto(f"{base_url}/a-page-that-does-not-exist")
    expect(page.get_by_role("heading", name="Oops! Page Not Found")).to_be_visible(timeout=10000)
    print("Capturing screenshot of 404 page...")
    page.screenshot(path="jules-scratch/verification/02_404_page.png")

    # 3. Verify redirect feedback
    print("Navigating to a protected route to trigger redirect...")
    page.goto(f"{base_url}/dashboard")

    print("Waiting for redirect to login page...")
    page.wait_for_url("**/login", timeout=10000)

    print("Verifying toast notification...")
    toast = page.locator("li[data-sonner-toast]").first
    expect(toast).to_be_visible(timeout=10000)
    expect(toast).to_have_text(re.compile("You must be logged in to view this page."))

    print("Capturing screenshot of redirect feedback toast...")
    page.screenshot(path="jules-scratch/verification/03_redirect_feedback.png")

    print("Verification script completed successfully.")
    browser.close()

with sync_playwright() as playwright:
    run_verification(playwright)