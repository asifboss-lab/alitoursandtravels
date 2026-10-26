#!/usr/bin/env python3
"""
Checks that every photograph on the site is credited where it is shown.

Creative Commons licences require attribution to travel with the image, so this
fails if an image is displayed without a visible credit naming its author and
licence. It also confirms the credits list on the terms page is complete.
"""
import sys
from playwright.sync_api import sync_playwright

BASE = sys.argv[1] if len(sys.argv) > 1 else "http://localhost:12000"
VIEWPORTS = [(360, 740), (412, 915), (1280, 900)]

failures = []


def check(page, label, ok, detail=""):
    print(f"  {'PASS' if ok else 'FAIL'}  {label}{(' - ' + detail) if detail else ''}")
    if not ok:
        failures.append(label)


with sync_playwright() as p:
    browser = p.chromium.launch(executable_path="/usr/bin/chromium", args=["--no-sandbox"])

    # --- Every displayed image must sit inside a figure that names its author.
    for path in ["/", "/services", "/about"]:
        page = browser.new_page(viewport={"width": 1280, "height": 900})
        page.goto(f"{BASE}{path}", wait_until="networkidle")
        page.wait_for_timeout(300)
        print(f"=== {path} ===")

        imgs = page.evaluate(
            """() => Array.from(document.querySelectorAll('img')).map(img => {
                const fig = img.closest('figure');
                // The hero credit is a sibling paragraph rather than a figcaption.
                const hero = img.closest('.hero');
                const credit = (fig && fig.querySelector('figcaption'))
                    || (hero && hero.querySelector('.hero__credit'));
                return {
                    src: img.getAttribute('src'),
                    alt: (img.getAttribute('alt') || '').slice(0, 50),
                    credited: Boolean(credit),
                    text: credit ? credit.innerText.replace(/\\s+/g, ' ').slice(0, 400) : '',
                };
            })"""
        )
        for img in imgs:
            check(
                page,
                f"{img['src']} has a visible credit",
                img["credited"] and "licensed under" in img["text"],
                img["text"][:80],
            )
        page.close()

    # --- The credits list on the terms page must name every image in the build.
    page = browser.new_page(viewport={"width": 1280, "height": 900})
    page.goto(f"{BASE}/terms", wait_until="networkidle")
    print("=== /terms ===")
    entries = page.eval_on_selector_all(
        ".credit-list li", "els => els.map(e => e.innerText.replace(/\\s+/g,' '))"
    )
    check(page, "terms lists every photograph", len(entries) == 10, f"{len(entries)} entries")
    for e in entries:
        if "licensed under" not in e or "by " not in e:
            check(page, f"credit names author and licence: {e[:60]}", False)
    check(page, "every credit entry names an author and licence", all(
        "licensed under" in e and "by " in e for e in entries
    ))
    page.close()

    # --- The hero credit must not overlap the buttons on a narrow phone.
    for w, h in VIEWPORTS:
        page = browser.new_page(viewport={"width": w, "height": h})
        page.goto(f"{BASE}/", wait_until="networkidle")
        page.wait_for_timeout(300)
        geo = page.evaluate(
            """() => {
                const c = document.querySelector('.hero__credit').getBoundingClientRect();
                const b = document.querySelector('.hero__actions').getBoundingClientRect();
                const t = document.querySelector('#hero-heading').getBoundingClientRect();
                return {c: {y: c.y, bottom: c.bottom}, b: {y: b.y, bottom: b.bottom}, t: {y: t.y}};
            }"""
        )
        overlaps = not (geo["c"]["y"] >= geo["b"]["bottom"] - 1 or geo["c"]["bottom"] <= geo["b"]["y"])
        check(page, f"hero credit does not overlap buttons @ {w}x{h}", not overlaps)
        check(page, f"hero credit sits below the headline @ {w}x{h}", geo["c"]["y"] > geo["t"]["y"])
        page.close()

    browser.close()

print()
if failures:
    print(f"FAILED {len(failures)} check(s):")
    for f in failures:
        print(f"  - {f}")
    sys.exit(1)
print("All photograph attribution checks passed.")
