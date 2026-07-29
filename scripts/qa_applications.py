import os
from pathlib import Path
from playwright.sync_api import sync_playwright

BASE = os.environ.get("BASE_URL", "http://127.0.0.1:5173").rstrip("/")
ROOT = Path(__file__).resolve().parents[1]

with sync_playwright() as playwright:
    browser = playwright.chromium.launch(headless=True)
    context = browser.new_context(viewport={"width": 1280, "height": 800})
    page = context.new_page()
    errors = []
    page.on("console", lambda message: errors.append(message.text) if message.type == "error" else None)

    page.goto(BASE + "/kemitraan/sponsorship", wait_until="networkidle")
    values = {
        "organizationName": "Lembaga Uji SEE",
        "organizationType": "Institusi pendidikan",
        "businessCategory": "Pendidikan",
        "address": "Jakarta Selatan",
        "city": "Jakarta",
        "picName": "Hammad Test",
        "picRole": "Partnership",
        "phone": "081234567890",
        "email": "partnership@example.com",
        "partnershipType": "Education partner",
    }
    for name, value in values.items():
        page.locator(f'[name="{name}"]').fill(value)
    for name in ["objective", "support", "activation"]:
        page.locator(f'[name="{name}"]').fill("Kolaborasi pendidikan yang akan dibahas bersama panitia.")
    page.locator('[name="logo"]').set_input_files(str(ROOT / "public" / "SEE26-logo.png"))
    page.locator('[name="consent"]').check()
    page.get_by_role("button", name="Kirim Pengajuan").click()
    page.wait_for_url("**/kemitraan/status/**")
    status_url = page.url
    assert "SEE26-SP-" in page.locator("h1").inner_text()
    assert "1 dokumen tersimpan" in page.locator(".application-status").inner_text()

    page.goto(BASE + "/admin", wait_until="networkidle")
    page.get_by_role("button", name="Mulai review").click()
    assert "UNDER_REVIEW" in page.locator(".admin-orders").inner_text()

    page.goto(status_url, wait_until="networkidle")
    assert "UNDER REVIEW" in page.locator(".application-status").inner_text()
    assert not errors, errors
    print("APPLICATION_FLOW_OK", status_url)
    browser.close()
