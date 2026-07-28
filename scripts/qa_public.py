from pathlib import Path
from playwright.sync_api import sync_playwright

ROOT = Path(__file__).resolve().parents[1]
OUT = ROOT / "output" / "qa"
OUT.mkdir(parents=True, exist_ok=True)

viewports = {
    "desktop-1440": (1440, 900),
    "laptop-1280": (1280, 720),
    "tablet-landscape": (1024, 768),
    "tablet-portrait": (768, 1024),
    "mobile-390": (390, 844),
}

with sync_playwright() as p:
    browser = p.chromium.launch(headless=True)
    console_errors = []
    results = []
    for name, (width, height) in viewports.items():
        page = browser.new_page(viewport={"width": width, "height": height})
        page.on("console", lambda msg: console_errors.append(msg.text) if msg.type == "error" else None)
        page.goto("http://127.0.0.1:5173", wait_until="networkidle")
        title = page.locator("h1").first.text_content()
        cta_visible = page.get_by_role("link", name="Beli Tiket").first.is_visible()
        overflow = page.evaluate("document.documentElement.scrollWidth > document.documentElement.clientWidth")
        page.screenshot(path=str(OUT / f"{name}.png"), full_page=name in ("desktop-1440", "mobile-390"))
        results.append((name, bool(title), cta_visible, overflow))
        page.close()

    page = browser.new_page(viewport={"width": 1280, "height": 720})
    page.goto("http://127.0.0.1:5173", wait_until="networkidle")
    page.locator("#jadwal").scroll_into_view_if_needed()
    page.get_by_role("tab", name="Day 2").click()
    assert "Kupas Tuntas" in page.locator(".schedule-list").inner_text()
    page.get_by_role("button", name="Mini Stage").click()
    assert "IELTS Preparation" in page.locator(".schedule-list").inner_text()
    page.locator("#tiket").scroll_into_view_if_needed()
    page.locator(".ticket-categories button", has_text="Bundle 3 Hari").click()
    assert page.get_by_role("button", name="Tiket Habis").is_disabled()
    page.close()

    mobile = browser.new_page(viewport={"width": 390, "height": 844})
    mobile.emulate_media(reduced_motion="reduce")
    mobile.goto("http://127.0.0.1:5173", wait_until="networkidle")
    assert mobile.locator(".mobile-buy").is_visible()
    assert mobile.evaluate("getComputedStyle(document.documentElement).scrollBehavior") == "auto"
    mobile.close()

    checkout = browser.new_page(viewport={"width": 390, "height": 844})
    checkout.goto("http://127.0.0.1:5173/checkout?ticket=regular-d1&qty=1", wait_until="networkidle")
    assert checkout.get_by_role("heading", name="Checkout Tiket").is_visible()
    assert not checkout.evaluate("document.documentElement.scrollWidth > document.documentElement.clientWidth")
    checkout.screenshot(path=str(OUT / "mobile-checkout.png"), full_page=True)
    checkout.close()

    zoom = browser.new_page(viewport={"width": 720, "height": 450})
    zoom.goto("http://127.0.0.1:5173", wait_until="networkidle")
    zoom.evaluate("document.body.style.zoom='2'")
    zoom_overflow = zoom.evaluate("document.documentElement.scrollWidth > document.documentElement.clientWidth")
    if zoom_overflow:
        offenders = zoom.evaluate("""Array.from(document.querySelectorAll('*')).filter(el => {
          const r = el.getBoundingClientRect(); return r.right > innerWidth + 1 || r.left < -1;
        }).slice(0, 15).map(el => [el.tagName, el.className, el.getBoundingClientRect().left, el.getBoundingClientRect().right])""")
        print("ZOOM_OVERFLOW", offenders)
    zoom.close()

    browser.close()
    print("VIEWPORTS", results)
    print("CONSOLE_ERRORS", console_errors)
