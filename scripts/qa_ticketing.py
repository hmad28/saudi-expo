from pathlib import Path
from playwright.sync_api import sync_playwright

ROOT = Path(__file__).resolve().parents[1]

with sync_playwright() as p:
    browser = p.chromium.launch(headless=True)
    context = browser.new_context(viewport={"width": 1280, "height": 800})
    page = context.new_page()
    errors = []
    page.on("console", lambda msg: errors.append(msg.text) if msg.type == "error" else None)

    page.goto("http://127.0.0.1:5173/checkout?ticket=regular-d1&qty=1", wait_until="networkidle")
    page.locator('[name="fullName"]').fill("Hammad Test")
    page.locator('[name="phone"]').fill("081234567890")
    page.locator('[name="email"]').fill("hammad@example.com")
    page.locator('[name="emailConfirmation"]').fill("hammad@example.com")
    page.locator('[name="ageRange"]').select_option(label="20 - 24 Tahun")
    page.locator('[name="institutionLevel"]').select_option(label="Universitas (Pendidikan Tinggi) / Setaraf")
    page.locator('[name="category"]').select_option(label="Mahasiswa")
    page.locator('[name="institutionName"]').fill("Universitas Uji")
    page.locator(".step-actions").get_by_role("button", name="Lanjut").click()

    attendee = page.locator(".attendee")
    attendee.locator("input").nth(0).fill("Hammad Test")
    attendee.locator("input").nth(1).fill("081234567890")
    attendee.locator("input").nth(2).fill("hammad@example.com")
    attendee.locator("select").nth(0).select_option(label="20 - 24 Tahun")
    attendee.locator("select").nth(1).select_option(label="Laki-laki")
    attendee.locator("select").nth(2).select_option(label="Universitas (Pendidikan Tinggi) / Setaraf")
    attendee.locator("select").nth(3).select_option(label="Mahasiswa")
    attendee.locator("input").nth(3).fill("Universitas Uji")
    page.locator(".step-actions").get_by_role("button", name="Lanjut").click()
    page.locator(".step-actions").get_by_role("button", name="Lanjut").click()
    page.locator(".terms-check input").check()
    page.locator(".order-summary button").click()
    page.wait_for_url("**/payment/*")

    assert "49" in page.locator(".pay-amount").inner_text()
    page.get_by_role("link", name="Konfirmasi Pembayaran").click()
    page.wait_for_url("**/confirm")
    page.locator('input[type="datetime-local"]').fill("2026-07-28T16:30")
    page.locator('input[type="file"]').set_input_files(str(ROOT / "public" / "SEE26-logo.png"))
    page.get_by_role("button", name="Kirim Konfirmasi").click()
    assert "berhasil dikirim" in page.locator(".success-message").inner_text()

    page.goto("http://127.0.0.1:5173/admin", wait_until="networkidle")
    page.get_by_role("button", name="Setujui").click()
    page.get_by_role("button", name="Lihat tiket").click()
    page.wait_for_url("**/ticket/*")
    page.locator(".qr-zone img").wait_for()
    assert page.get_by_role("heading", name="Hammad Test").is_visible()
    assert "Regular — Day 1" in page.locator(".wallet-pass").inner_text()
    assert not errors
    print("TICKETING_FLOW_OK", page.url)
    browser.close()
