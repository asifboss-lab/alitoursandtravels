from playwright.sync_api import sync_playwright
import re, sys

BASE = "http://localhost:12000"
fails, warns = [], []

def check(label, ok, detail=""):
    print(f"  {'PASS' if ok else 'FAIL'}  {label}" + (f" - {detail}" if detail else ""))
    if not ok: fails.append(label)

with sync_playwright() as p:
    b = p.chromium.launch(executable_path="/usr/bin/chromium", args=["--no-sandbox"])

    # 1. All routes render with no console errors
    print("=== routes + console ===")
    errors = []
    pg = b.new_page(viewport={"width": 1280, "height": 900})
    pg.on("console", lambda m: errors.append(f"{m.type}: {m.text}") if m.type == "error" else None)
    pg.on("pageerror", lambda e: errors.append(f"pageerror: {e}"))
    for path in ["/", "/services", "/booking", "/about", "/contact", "/faq",
                 "/privacy", "/terms", "/booking-policy"]:
        pg.goto(f"{BASE}{path}", wait_until="networkidle")
        h1 = pg.query_selector("h1")
        check(f"{path} renders an h1", bool(h1), (h1.inner_text()[:45] if h1 else "none"))
    check("no console errors across all routes", not errors, "; ".join(errors[:3]))

    # 2. WhatsApp destination everywhere
    print("=== WhatsApp destination ===")
    pg.goto(f"{BASE}/booking", wait_until="networkidle")
    hrefs = pg.eval_on_selector_all("a[href*='wa.me'], a[href*='whatsapp']", "els => els.map(e => e.href)")
    check("page exposes WhatsApp links", len(hrefs) > 0, f"{len(hrefs)} links")
    bad = [h for h in hrefs if "wa.me/919324222911" not in h]
    check("every WhatsApp link targets +91 93242 22911", not bad, str(bad[:2]))

    # 3. Enquiry form -> correct link + honest wording
    print("=== booking form flow ===")
    pg.select_option("#serviceType", "outstation-taxi")
    # Choosing a service re-renders the form: the trip-type radios and the
    # outstation fields exist only after that render lands.
    pg.wait_for_selector("input[name='tripType']", timeout=5000)
    pg.check("input[name='tripType'][value='one-way']")
    pg.fill("#name", "Test Enquiry")
    pg.fill("#mobile", "9876543210")
    pg.fill("#pickupLocation", "Tanwar Nagar, Mumbra")
    pg.fill("#destination", "Pune")
    pg.fill("#journeyDate", "2026-11-15")
    pg.fill("#pickupTime", "06:30")
    pg.fill("#passengers", "4")
    pg.click("button[type=submit]")
    pg.wait_for_selector(".form__summary", timeout=5000)
    link = pg.eval_on_selector_all(".form__summary a[href*='wa.me']", "els => els.map(e=>e.href)") or []
    booking_link = [l for l in link if "919324222911" in l]
    check("submission produces a wa.me link", bool(booking_link))
    if booking_link:
        from urllib.parse import unquote
        msg = unquote(booking_link[0].split("text=")[-1])
        for token in ["Test Enquiry", "9876543210", "Pune", "15 November 2026", "6:30 AM"]:
            check(f"message carries {token}", token in msg)
        check("message invents no price", not re.search(r"(₹|Rs\.?\s?\d|INR\s?\d)", msg))
        check("message invents no booking reference", not re.search(r"\b(booking|ref|confirmation)\s*(id|no|number|#)\b", msg, re.I))
    body = pg.inner_text("body")
    check("page states enquiry is not a confirmed booking",
          re.search(r"not a (confirmed )?booking|does not confirm", body, re.I) is not None)

    # 4. No fake prices / reviews / ratings anywhere
    print("=== no invented commercial claims ===")
    for path in ["/", "/services", "/about", "/faq", "/booking"]:
        pg.goto(f"{BASE}{path}", wait_until="networkidle")
        t = pg.inner_text("body")
        price = re.findall(r"(?:₹|Rs\.?)\s?\d+", t)
        check(f"no price shown on {path}", not price, str(price[:2]))
        stars = re.findall(r"\b\d(?:\.\d)?\s*(?:out of 5|/5|stars?)\b", t, re.I)
        check(f"no rating shown on {path}", not stars, str(stars[:2]))
        rev = re.findall(r"\b\d+\s+(?:happy )?(?:customer )?reviews?\b", t, re.I)
        check(f"no review count on {path}", not rev, str(rev[:2]))

    # 5. Mobile layout: no horizontal scroll on the key pages
    print("=== mobile layout ===")
    for w, h in [(360, 740), (412, 915)]:
        for path in ["/", "/services", "/booking", "/contact"]:
            pg.set_viewport_size({"width": w, "height": h})
            pg.goto(f"{BASE}{path}", wait_until="networkidle")
            over = pg.evaluate("() => document.documentElement.scrollWidth - document.documentElement.clientWidth")
            check(f"no horizontal scroll {path} @ {w}px", over <= 1, f"overflow {over}px")

    # 6. Legal pages present and honest
    print("=== legal pages ===")
    for path, needle in [("/privacy", "Privacy"), ("/terms", "Terms"),
                         ("/booking-policy", "Cancellation")]:
        pg.goto(f"{BASE}{path}", wait_until="networkidle")
        t = pg.inner_text("body")
        check(f"{path} present", needle.lower() in t.lower())
    pg.goto(f"{BASE}/booking-policy", wait_until="networkidle")
    t = pg.inner_text("body")
    check("booking policy marked as awaiting approval",
          re.search(r"awaiting business approval|must be approved|being finalised", t, re.I) is not None)

    # 7. Navigation works
    print("=== navigation ===")
    pg.set_viewport_size({"width": 1280, "height": 900})
    pg.goto(f"{BASE}/", wait_until="networkidle")
    for name, expect in [("Services", "/services"), ("Booking", "/booking"), ("Contact", "/contact")]:
        link = pg.query_selector(f"a[href='{expect}']")
        if link:
            link.click(); pg.wait_for_timeout(350)
            check(f"nav to {expect}", pg.url.rstrip("/").endswith(expect.rstrip("/")), pg.url)
            pg.goto(f"{BASE}/", wait_until="networkidle")
        else:
            warns.append(f"no direct nav link for {expect}")

    b.close()

print()
if fails:
    print(f"FAILED {len(fails)}:")
    for f in fails: print("  -", f)
    sys.exit(1)
print(f"ALL FINAL CHECKS PASSED{f' ({len(warns)} notes)' if warns else ''}")
for w in warns: print("  note:", w)
