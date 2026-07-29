import os
from pathlib import Path
from playwright.sync_api import sync_playwright

OUT=Path(__file__).resolve().parents[1]/"output"/"qa"
BASE=os.environ.get("BASE_URL","http://127.0.0.1:5173").rstrip("/")
OUT.mkdir(parents=True,exist_ok=True)
viewports={"mobile-390":(390,844),"mobile-430":(430,932),"tablet-portrait":(768,1024),"tablet-landscape":(1024,768),"laptop":(1280,720),"desktop":(1440,900)}
routes=["/","/tentang","/kegiatan","/jadwal","/pembicara","/tiket","/mitra","/lokasi","/dokumentasi","/faq","/syarat-ketentuan","/kebijakan-privasi","/kemitraan","/kemitraan/sponsorship","/kemitraan/booth","/lembaga","/lembaga/daftar/ikhwan","/lembaga/daftar/akhwat"]

with sync_playwright() as p:
  browser=p.chromium.launch(headless=True)
  errors=[]
  for name,(width,height) in viewports.items():
    page=browser.new_page(viewport={"width":width,"height":height})
    page.on("console",lambda msg: errors.append(f"{name}: {msg.text}") if msg.type=="error" else None)
    page.goto(BASE,wait_until="networkidle")
    assert page.locator("h1").is_visible()
    assert not page.evaluate("document.documentElement.scrollWidth > document.documentElement.clientWidth")
    page.screenshot(path=str(OUT/f"multipage-{name}.png"),full_page=name in ("mobile-390","desktop"))
    page.close()
  page=browser.new_page(viewport={"width":1280,"height":800})
  for route in routes:
    page.goto(BASE+route,wait_until="networkidle")
    assert page.locator("h1").first.is_visible(),route
    assert "Halaman tidak ditemukan" not in page.locator("body").inner_text(),route
  page.goto(BASE+"/jadwal",wait_until="networkidle")
  page.get_by_role("tab",name="Day 2").click()
  page.get_by_role("button",name="Mini Stage").click()
  assert "IELTS Preparation" in page.locator(".schedule-list").inner_text()
  mobile=browser.new_page(viewport={"width":390,"height":844})
  mobile.goto(BASE+"/tiket",wait_until="networkidle")
  assert mobile.locator(".ticket-purchase-bar").is_visible()
  mobile.get_by_role("button",name="Lihat Detail Tiket").click()
  assert mobile.get_by_role("dialog").is_visible()
  mobile.get_by_role("button",name="Tutup detail tiket").click()
  mobile.get_by_role("button",name="Lanjut").click()
  mobile.wait_for_url("**/checkout**")
  assert mobile.get_by_text("Langkah 1 dari 4").is_visible()
  assert not errors,errors
  print("MULTIPAGE_QA_OK",len(routes),"routes",len(viewports),"viewports")
  browser.close()
