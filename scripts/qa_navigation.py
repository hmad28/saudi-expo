import os
from urllib.parse import urlparse
from playwright.sync_api import sync_playwright

BASE = os.environ.get("BASE_URL", "http://127.0.0.1:5173").rstrip("/")
SEED_ROUTES = [
    "/", "/tentang", "/kegiatan", "/jadwal", "/pembicara", "/tiket",
    "/mitra", "/lokasi", "/dokumentasi", "/faq", "/syarat-ketentuan",
    "/kebijakan-privasi", "/kemitraan", "/kemitraan/sponsorship",
    "/kemitraan/booth", "/lembaga", "/lembaga/daftar/ikhwan",
    "/lembaga/daftar/akhwat",
]

with sync_playwright() as playwright:
    browser = playwright.chromium.launch(headless=True)
    page = browser.new_page(viewport={"width": 1280, "height": 800})
    console_errors = []
    page.on("console", lambda message: console_errors.append(message.text) if message.type == "error" else None)

    discovered = set(SEED_ROUTES)
    for route in SEED_ROUTES:
        response = page.goto(BASE + route, wait_until="networkidle")
        assert response and response.ok, f"{route} returned HTTP {response.status if response else 'no response'}"
        assert "Halaman tidak ditemukan" not in page.locator("body").inner_text(), route
        for href in page.locator('a[href^="/"]').evaluate_all("(links) => links.map((link) => link.getAttribute('href'))"):
            parsed = urlparse(href)
            if not any(segment.startswith(":") for segment in parsed.path.split("/")):
                discovered.add(parsed.path)

    for route in sorted(discovered):
        response = page.goto(BASE + route, wait_until="networkidle")
        assert response and response.ok, f"{route} returned HTTP {response.status if response else 'no response'}"
        assert "Halaman tidak ditemukan" not in page.locator("body").inner_text(), route

    page.goto(BASE, wait_until="networkidle")
    page.locator('.hero-actions a[href="/tiket"]').click()
    page.wait_for_url("**/tiket")
    assert page.get_by_role("heading", name="Pilih tiket SEE 2026.").is_visible()

    page.goto(BASE + "/checkout?ticket=regular-d1&qty=1", wait_until="networkidle")
    page.get_by_role("button", name="Lanjut").click()
    assert "Masukkan nama lengkap pembeli" in page.locator(".form-error").inner_text()
    assert page.locator('[name="fullName"]').is_visible()

    page.goto(BASE + "/checkout?ticket=regular-d2&qty=1", wait_until="networkidle")
    assert "Tiket ini belum dapat dibeli" in page.locator("h1").inner_text()

    page.goto(BASE + "/jadwal", wait_until="networkidle")
    page.get_by_role("tab", name="Day 2").click()
    page.get_by_role("button", name="Mini Stage").click()
    assert "day=2" in page.url and "stage=mini" in page.url

    page.goto(BASE + "/check-in/not-a-real-token", wait_until="networkidle")
    assert "Halaman tidak ditemukan" not in page.locator("body").inner_text()
    assert "Tiket tidak aktif atau tidak ditemukan" in page.locator("h1").inner_text()

    assert not console_errors, console_errors
    print("NAVIGATION_QA_OK", len(discovered), "direct routes and CTA states")
    browser.close()
