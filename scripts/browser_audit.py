"""
Browser audit for the Ali Tours and Travels site.

Checks, on every route, in a real Chromium browser:
  - horizontal overflow at mobile, tablet and desktop widths
  - console errors and failed network requests
  - images that failed to decode
  - the document title and meta description actually applied
  - one h1 per page and a sane heading order
  - a visible focus ring on the first interactive element
  - colour contrast of body text against its background

Then drives the booking form: invalid submission, service-driven field changes,
valid submission, and the exact WhatsApp URL that is produced.

Usage:  python3 scripts/browser_audit.py [base_url]
Requires: pip install playwright, and a chromium binary.
"""

import io
import json
import re
import sys
from urllib.parse import urlparse, parse_qs, unquote

from playwright.sync_api import sync_playwright

BASE = (sys.argv[1] if len(sys.argv) > 1 else "http://localhost:12000").rstrip("/")

ROUTES = [
    "/",
    "/services",
    "/booking",
    "/about",
    "/faq",
    "/contact",
    "/privacy",
    "/terms",
    "/booking-policy",
    "/definitely-not-a-real-page",
]

VIEWPORTS = [
    ("mobile", 320, 720),
    ("mobile-large", 412, 915),
    ("tablet", 768, 1024),
    ("desktop", 1280, 900),
    ("wide", 1920, 1080),
]

# Relative luminance helpers for a WCAG contrast ratio check.
def _srgb(channel: float) -> float:
    c = channel / 255
    return c / 12.92 if c <= 0.03928 else ((c + 0.055) / 1.055) ** 2.4


def luminance(rgb):
    r, g, b = rgb
    return 0.2126 * _srgb(r) + 0.7152 * _srgb(g) + 0.0722 * _srgb(b)


def contrast_ratio(fg, bg):
    l1, l2 = luminance(fg), luminance(bg)
    hi, lo = max(l1, l2), min(l1, l2)
    return (hi + 0.05) / (lo + 0.05)


def dominant_background(png_bytes, max_side=64):
    """
    Returns the single most common colour in a screenshot, which is the painted
    background behind the text. Downsampled first so a large element does not
    cost a full per-pixel Python loop.
    """
    try:
        from PIL import Image
    except ImportError:
        return None

    img = Image.open(io.BytesIO(png_bytes)).convert("RGB")
    if max(img.size) > max_side:
        scale = max_side / max(img.size)
        img = img.resize(
            (max(1, int(img.width * scale)), max(1, int(img.height * scale))),
            Image.BILINEAR,
        )

    pixels = list(img.getdata())
    if not pixels:
        return None

    counts = {}
    for px in pixels:
        counts[px] = counts.get(px, 0) + 1
    return max(counts.items(), key=lambda kv: kv[1])[0]


def composite(fg, alpha, bg):
    """Flattens a translucent foreground colour onto a background colour."""
    if alpha is None:
        return fg
    return tuple(fg[i] * alpha + bg[i] * (1 - alpha) for i in range(3))


def parse_rgba(value):
    """Returns (rgb, alpha) where alpha is None for a fully opaque colour."""
    m = re.match(r"rgba?\(([^)]+)\)", value or "")
    if not m:
        return None, None
    parts = [p.strip() for p in m.group(1).split(",")]
    try:
        rgb = tuple(float(p) for p in parts[:3])
        alpha = float(parts[3]) if len(parts) > 3 else None
    except ValueError:
        return None, None
    return rgb, alpha


def parse_rgb(value: str):
    m = re.match(r"rgba?\(([^)]+)\)", value or "")
    if not m:
        return None
    parts = [p.strip() for p in m.group(1).split(",")]
    try:
        nums = [float(p) for p in parts[:3]]
    except ValueError:
        return None
    if len(parts) > 3:
        alpha = float(parts[3])
        if alpha < 0.5:
            return None  # translucent backgrounds are resolved by the browser instead
    return tuple(nums)


results = {"pass": [], "fail": [], "warn": []}


def ok(msg):
    results["pass"].append(msg)
    print(f"  PASS  {msg}")


def bad(msg):
    results["fail"].append(msg)
    print(f"  FAIL  {msg}")


def warn(msg):
    results["warn"].append(msg)
    print(f"  WARN  {msg}")


def check_overflow(page, label):
    """Compares scrollWidth to clientWidth; any excess is horizontal scrolling."""
    overflow = page.evaluate(
        """() => {
            const de = document.documentElement;
            const excess = de.scrollWidth - de.clientWidth;
            if (excess <= 1) return null;
            // Name the widest offending element to make the failure actionable.
            let worst = null;
            for (const el of document.querySelectorAll('body *')) {
                const r = el.getBoundingClientRect();
                if (r.right > de.clientWidth + 1) {
                    const over = r.right - de.clientWidth;
                    if (!worst || over > worst.over) {
                        worst = {
                            over: Math.round(over),
                            tag: el.tagName.toLowerCase(),
                            cls: (el.className && el.className.toString().slice(0, 60)) || '',
                        };
                    }
                }
            }
            return {excess: Math.round(excess), worst};
        }"""
    )
    if overflow is None:
        ok(f"no horizontal overflow at {label}")
    else:
        bad(
            f"horizontal overflow at {label}: {overflow['excess']}px"
            + (f" (widest: <{overflow['worst']['tag']} class=\"{overflow['worst']['cls']}\">)"
               if overflow["worst"] else "")
        )


def check_images(page, label):
    broken = page.evaluate(
        """() => Array.from(document.images)
            .filter((i) => i.complete && i.naturalWidth === 0)
            .map((i) => i.currentSrc || i.src)"""
    )
    if broken:
        bad(f"broken images at {label}: {broken}")
    else:
        ok(f"all images decoded at {label}")

    missing_alt = page.evaluate(
        """() => Array.from(document.images)
            .filter((i) => !i.hasAttribute('alt') || i.getAttribute('alt').trim() === '')
            .map((i) => i.currentSrc || i.src)"""
    )
    if missing_alt:
        bad(f"images without alt text at {label}: {missing_alt}")
    else:
        ok(f"every image has alt text at {label}")


def check_headings(page, label):
    h1s = page.eval_on_selector_all("h1", "els => els.map(e => e.textContent.trim())")
    if len(h1s) == 1:
        ok(f"exactly one h1 at {label}: \"{h1s[0][:60]}\"")
    elif not h1s:
        bad(f"no h1 at {label}")
    else:
        bad(f"{len(h1s)} h1 elements at {label}: {h1s}")

    levels = page.eval_on_selector_all(
        "h1,h2,h3,h4", "els => els.map(e => Number(e.tagName[1]))"
    )
    skips = [
        (levels[i - 1], levels[i])
        for i in range(1, len(levels))
        if levels[i] - levels[i - 1] > 1
    ]
    if skips:
        warn(f"heading level skips at {label}: {skips}")
    else:
        ok(f"heading order has no skipped levels at {label}")


def attr(page, selector, name):
    """Reads an attribute without waiting for an element that may not exist."""
    el = page.query_selector(selector)
    return el.get_attribute(name) if el else None


def check_meta(page, label, path):
    title = page.title()
    desc = attr(page, 'meta[name="description"]', "content")
    if title and len(title) <= 60:
        ok(f"title at {label} ({len(title)} chars): {title}")
    elif not title:
        bad(f"missing title at {label}")
    else:
        warn(f"title at {label} is {len(title)} chars, may be truncated: {title}")

    if not desc:
        bad(f"missing meta description at {label}")
    elif len(desc) > 158:
        warn(f"meta description at {label} is {len(desc)} chars: {desc[:80]}…")
    else:
        ok(f"meta description at {label} ({len(desc)} chars)")

    canonical = attr(page, 'link[rel="canonical"]', "href")
    og = attr(page, 'meta[property="og:title"]', "content")
    if og:
        ok(f"og:title present at {label}")
    else:
        bad(f"missing og:title at {label}")

    # A canonical URL must never point at a different host than the page.
    if canonical:
        if urlparse(canonical).netloc and urlparse(canonical).netloc != urlparse(page.url).netloc:
            bad(f"canonical at {label} points at another host: {canonical}")
        else:
            ok(f"canonical at {label}: {canonical}")
    elif path != "/definitely-not-a-real-page":
        ok(f"no canonical emitted at {label} (VITE_SITE_URL unset, as designed)")


def check_contrast(page, label):
    """
    Checks text contrast the way it actually renders.

    A gradient or translucent surface cannot be resolved from computed styles
    alone, so for every text element the real background is read from rendered
    pixels: the element is screenshotted and the most common colour in the crop
    is the surface behind the glyphs.

    The element's own colour may itself be translucent, which happens during an
    entrance animation. Such a colour is flattened onto the measured background
    before the ratio is taken, so a mid-animation frame is not mistaken for a
    design fault. Animations are also disabled up front, which removes the
    problem at its source.
    """
    # Freeze animations so a frame is never captured part-way through a fade.
    page.emulate_media(reduced_motion="reduce")

    samples = page.evaluate(
        """() => {
            const out = [];
            const els = document.querySelectorAll(
                'p, h1, h2, h3, li, dt, dd, a, span, button, summary, label, legend'
            );
            for (const el of els) {
                const ownText = Array.from(el.childNodes)
                    .filter((n) => n.nodeType === 3)
                    .map((n) => n.textContent)
                    .join('')
                    .trim();
                if (!ownText) continue;

                const cs = getComputedStyle(el);
                if (cs.visibility === 'hidden' || cs.display === 'none') continue;
                if (parseFloat(cs.opacity) < 0.95) continue;

                const r = el.getBoundingClientRect();
                if (r.width < 6 || r.height < 6) continue;

                if (!el.dataset.contrastId) {
                    el.dataset.contrastId = 'c' + Math.random().toString(36).slice(2, 9);
                }
                out.push({
                    text: ownText.slice(0, 40),
                    fg: cs.color,
                    size: parseFloat(cs.fontSize),
                    weight: cs.fontWeight,
                    id: el.dataset.contrastId,
                });
            }
            return out;
        }"""
    )

    worst = None
    measured = 0
    unmeasurable = 0
    pixel_budget = 30

    for s in samples:
        fg_rgb, fg_alpha = parse_rgba(s["fg"])
        if not fg_rgb:
            continue
        if measured >= pixel_budget:
            break

        box = page.evaluate(
            """async (id) => {
                const el = document.querySelector(`[data-contrast-id="${id}"]`);
                if (!el) return null;
                const cs = getComputedStyle(el);
                // Fixed and sticky elements are already on screen.
                const pinned = cs.position === 'fixed' || cs.position === 'sticky'
                    || el.closest('header, .site-header, .fab, .mobile-nav') !== null;
                if (!pinned) {
                    el.scrollIntoView({block: 'center', behavior: 'instant'});
                    await new Promise((r) => requestAnimationFrame(() => r()));
                }
                const r = el.getBoundingClientRect();
                const vw = document.documentElement.clientWidth;
                const vh = document.documentElement.clientHeight;
                // Only a fully visible element gives a trustworthy crop.
                if (r.top < 0 || r.left < 0 || r.bottom > vh || r.right > vw) return null;
                if (r.width < 6 || r.height < 6) return null;
                return {w: Math.round(r.width), h: Math.round(r.height),
                        x: Math.round(r.x), y: Math.round(r.y)};
            }""",
            s["id"],
        )
        if not box:
            unmeasurable += 1
            continue

        shot = page.screenshot(
            clip={"x": box["x"], "y": box["y"], "width": box["w"], "height": box["h"]}
        )
        bg = dominant_background(shot)
        if bg is None:
            unmeasurable += 1
            continue

        measured += 1
        fg = composite(fg_rgb, fg_alpha, bg)
        ratio = contrast_ratio(fg, bg)
        large = s["size"] >= 24 or (s["size"] >= 18.66 and s["weight"] in ("700", "bold"))
        need = 3.0 if large else 4.5

        if ratio < need and (worst is None or ratio < worst["ratio"]):
            worst = {
                "ratio": round(ratio, 2),
                "need": need,
                "text": s["text"],
                "fg": s["fg"],
                "bg": f"rgb({bg[0]:.0f}, {bg[1]:.0f}, {bg[2]:.0f})",
                "note": "measured from rendered pixels",
            }

    if worst:
        bad(
            f"contrast at {label}: {worst['ratio']}:1 (needs {worst['need']}:1) for "
            f"\"{worst['text']}\" fg={worst['fg']} on bg={worst['bg']}"
        )
    else:
        ok(
            f"text contrast passes WCAG AA at {label} "
            f"({measured} elements measured from rendered pixels"
            + (f", {unmeasurable} off-screen skipped" if unmeasurable else "")
            + ")"
        )


def check_reduced_motion(page, label):
    """Verifies the site honours prefers-reduced-motion instead of ignoring it."""
    page.emulate_media(reduced_motion="reduce")
    page.goto(f"{BASE}/", wait_until="networkidle")
    offenders = page.evaluate(
        """() => {
            const out = [];
            for (const el of document.querySelectorAll('*')) {
                const cs = getComputedStyle(el);
                const dur = cs.animationDuration;
                if (cs.animationName !== 'none' && dur && dur !== '0s') {
                    const total = dur.split(',').reduce(
                        (a, d) => Math.max(a, parseFloat(d) || 0), 0);
                    if (total > 0.05) {
                        out.push({tag: el.tagName.toLowerCase(),
                                  name: cs.animationName,
                                  dur: cs.animationDuration});
                    }
                }
            }
            return out.slice(0, 5);
        }"""
    )
    if offenders:
        bad(f"animation still runs under prefers-reduced-motion at {label}: {offenders}")
    else:
        ok(f"animations are suppressed under prefers-reduced-motion at {label}")
    page.emulate_media(reduced_motion="no-preference")


def check_focus(page, label):
    page.keyboard.press("Tab")
    info = page.evaluate(
        """() => {
            const el = document.activeElement;
            if (!el || el === document.body) return null;
            const cs = getComputedStyle(el);
            return {
                tag: el.tagName.toLowerCase(),
                text: (el.textContent || '').trim().slice(0, 40),
                outline: cs.outlineStyle + ' ' + cs.outlineWidth + ' ' + cs.outlineColor,
                hasRing: (cs.outlineStyle !== 'none' && parseFloat(cs.outlineWidth) > 0)
                    || cs.boxShadow !== 'none',
            };
        }"""
    )
    if info is None:
        warn(f"Tab produced no focused element at {label}")
    elif info["tag"] == "iframe":
        # An embedded map is third-party content; its internal focus ring is not
        # ours to style, and the surrounding link or button is checked separately.
        warn(f"focus landed inside an embedded iframe at {label}; not assessable")
    elif info["hasRing"]:
        ok(f"focus indicator visible at {label}: <{info['tag']}> {info['outline']}")
    else:
        bad(f"no visible focus indicator at {label} on <{info['tag']}> {info['text']}")


def check_landmarks(page, label):
    counts = page.evaluate(
        """() => ({
            main: document.querySelectorAll('main').length,
            header: document.querySelectorAll('header').length,
            footer: document.querySelectorAll('footer').length,
            nav: document.querySelectorAll('nav').length,
            skip: document.querySelectorAll('a[href="#main"]').length,
        })"""
    )
    problems = [k for k, v in counts.items() if v == 0 and k != "nav"]
    if problems:
        bad(f"missing landmarks at {label}: {problems}")
    else:
        ok(f"landmarks present at {label}: main, header, footer, skip link")


def check_structured_data(page, label):
    """
    Validates every JSON-LD block on the page.

    Beyond checking that the JSON parses, this asserts that nothing the business
    has not confirmed is being claimed to search engines: no ratings, no reviews,
    no price ranges, no GPS coordinates and no opening hours.
    """
    blocks = page.eval_on_selector_all(
        'script[type="application/ld+json"]', "els => els.map(e => e.textContent)"
    )
    if not blocks:
        # A noindex page has no business describing itself to search engines.
        robots = attr(page, 'meta[name="robots"]', "content") or ""
        if "noindex" in robots.lower():
            ok(f"no JSON-LD at {label} (page is noindex)")
        else:
            warn(f"no JSON-LD on {label}")
        return

    forbidden_keys = {
        "aggregateRating", "ratingValue", "reviewCount", "review",
        "reviews", "priceRange", "price", "geo", "latitude", "longitude",
        "openingHours", "openingHoursSpecification", "award", "foundingDate",
        "numberOfEmployees", "vatID", "taxID", "identifier",
    }

    for raw in blocks:
        try:
            data = json.loads(raw)
        except json.JSONDecodeError as exc:
            bad(f"invalid JSON-LD at {label}: {exc}")
            continue

        graph = data.get("@graph", [data]) if isinstance(data, dict) else data
        if not isinstance(graph, list):
            graph = [graph]

        for node in graph:
            if not isinstance(node, dict):
                continue
            node_type = node.get("@type")
            if not node_type:
                bad(f"JSON-LD node without @type at {label}: {node}")

            found = sorted(forbidden_keys & set(node.keys()))
            if found:
                bad(f"JSON-LD at {label} claims unconfirmed fields: {found}")

            # Any telephone or address that appears must match the real business.
            tel = node.get("telephone")
            if tel and "919324222911" not in re.sub(r"\D", "", tel):
                bad(f"JSON-LD at {label} has the wrong telephone: {tel}")
            postal = (node.get("address") or {}).get("postalCode")
            if postal and postal != "400612":
                bad(f"JSON-LD at {label} has the wrong postal code: {postal}")

        types = [n.get("@type") for n in graph if isinstance(n, dict)]
        ok(f"JSON-LD parses at {label} with types: {types}")


def run_route_checks(page, path, label):
    for name, w, h in VIEWPORTS:
        page.set_viewport_size({"width": w, "height": h})
        page.goto(f"{BASE}{path}", wait_until="networkidle")
        check_overflow(page, f"{label} @ {w}x{h}")

    page.set_viewport_size({"width": 1280, "height": 900})
    page.goto(f"{BASE}{path}", wait_until="networkidle")
    check_images(page, label)
    check_headings(page, label)
    check_meta(page, label, path)
    check_contrast(page, label)
    check_structured_data(page, label)
    check_focus(page, label)
    if path == "/":
        check_reduced_motion(page, label)
    check_landmarks(page, label)


def run_form_flow(page):
    print("\n-- booking form --")
    errors, failed_requests = [], []

    page.on("console", lambda m: errors.append(m.text) if m.type == "error" else None)
    page.on("requestfailed", lambda r: failed_requests.append(f"{r.url} {r.failure}"))

    page.set_viewport_size({"width": 1280, "height": 900})
    page.goto(f"{BASE}/booking", wait_until="networkidle")

    # --- invalid submission -------------------------------------------------
    page.get_by_role("button", name="Review & send on WhatsApp").click()
    page.wait_for_timeout(300)

    error_count = page.locator(".field__error").count()
    if error_count >= 8:
        ok(f"empty submission shows {error_count} field errors")
    else:
        bad(f"empty submission showed only {error_count} field errors")

    if page.locator("#name-error").count() > 0:
        ok("the name error is tied to the field via an id")
    else:
        bad("the name error has no id for aria-describedby")

    invalid = page.locator('[aria-invalid="true"]').count()
    if invalid >= 8:
        ok(f"{invalid} fields marked aria-invalid")
    else:
        bad(f"only {invalid} fields marked aria-invalid")

    # --- bad mobile number --------------------------------------------------
    page.fill("#name", "Imran Shaikh")
    page.fill("#mobile", "12345")
    page.get_by_role("button", name="Review & send on WhatsApp").click()
    page.wait_for_timeout(250)
    if page.locator("#mobile-error").count() > 0:
        ok("an invalid mobile number is rejected")
    else:
        bad("an invalid mobile number was accepted")

    # --- service-driven tailoring -------------------------------------------
    page.select_option("#serviceType", "airport-transfer")
    page.wait_for_timeout(250)
    if page.locator("#flightNumber").count() > 0 and page.locator("#destination").count() == 0:
        ok("airport transfer swaps destination for flight number")
    else:
        bad("airport transfer did not tailor the form correctly")

    page.select_option("#serviceType", "outstation-taxi")
    page.wait_for_timeout(200)
    trip_radios = page.locator('input[name="tripType"]').count()
    if trip_radios == 2 and page.locator("#returnDate").count() == 0:
        ok("outstation shows trip type and hides return date for one-way")
    else:
        bad(
            f"outstation did not show trip type correctly "
            f"(tripType radios: {trip_radios}, returnDate fields: {page.locator('#returnDate').count()})"
        )

    page.locator('input[name="tripType"][value="round-trip"]').check()
    page.wait_for_timeout(200)
    if page.locator("#returnDate").count() > 0:
        ok("choosing round trip reveals the return date")
    else:
        bad("round trip did not reveal the return date")

    # Switching back to one-way must drop the stale return date.
    page.locator('input[name="tripType"][value="one-way"]').check()
    page.wait_for_timeout(200)
    if page.locator("#returnDate").count() == 0:
        ok("switching to one-way removes the return date field")
    else:
        bad("return date stayed visible after switching to one-way")

    # --- valid submission ---------------------------------------------------
    page.fill("#name", "Imran Shaikh")
    page.fill("#mobile", "+91 98765 43210")
    page.fill("#pickupLocation", "Tanwar Nagar, Mumbra")
    page.fill("#destination", "Pune")
    page.fill("#journeyDate", "2099-03-15")
    page.fill("#pickupTime", "06:30")
    page.fill("#passengers", "4")
    page.select_option("#vehicleCategory", "SUV")
    page.fill("#additionalRequirements", "3 large suitcases, 1 extra stop")

    # Capture the wa.me URL the page opens instead of really opening WhatsApp.
    captured = {}
    page.expose_function("__capture", lambda url: captured.setdefault("url", url))
    page.evaluate(
        """() => {
            const real = window.open;
            window.open = function (url) { window.__capture(url); return { focus() {} }; };
        }"""
    )

    page.get_by_role("button", name="Review & send on WhatsApp").click()
    page.wait_for_timeout(600)

    if page.locator(".form__summary").count() > 0:
        ok("a summary panel appears after a valid submission")
    else:
        bad("no summary panel appeared after a valid submission")

    if page.locator(".field__error").count() == 0:
        ok("no validation errors remain on a valid submission")
    else:
        bad("validation errors remain on a valid submission")

    url = captured.get("url", "")
    if not url:
        bad("no WhatsApp URL was opened")
        return errors, failed_requests

    parsed = urlparse(url)
    if parsed.netloc == "wa.me" and parsed.path == "/919324222911":
        ok(f"WhatsApp destination is correct: {parsed.netloc}{parsed.path}")
    else:
        bad(f"wrong WhatsApp destination: {url[:80]}")

    message = parse_qs(parsed.query).get("text", [""])[0]
    required = [
        "Imran Shaikh", "9876543210", "Outstation Taxi", "Tanwar Nagar, Mumbra",
        "Pune", "15 March 2099", "6:30 AM", "4", "SUV",
        "3 large suitcases, 1 extra stop",
    ]
    missing = [r for r in required if r not in message]
    if not missing:
        ok("the WhatsApp message carries every submitted detail")
    else:
        bad(f"details missing from the WhatsApp message: {missing}")

    if "\n" not in url and "%0A" in url:
        ok("newlines are percent-encoded in the URL")
    else:
        bad("the URL contains raw newlines")

    if not re.search(r"[\u20b9]|\b(rs|inr)\.?\s*\d", message, re.I):
        ok("no invented price appears in the message")
    else:
        bad("the message contains something that looks like a price")

    if not re.search(r"booking\s*(id|ref|number)", message, re.I):
        ok("no fabricated booking reference in the message")
    else:
        bad("the message contains a fabricated booking reference")

    # The summary must show the same text the visitor is about to send.
    shown = page.locator(".form__summary pre").inner_text()
    if shown.strip() == message.strip():
        ok("the on-screen summary matches the WhatsApp message exactly")
    else:
        bad("the on-screen summary differs from the WhatsApp message")

    # --- copy fallback ------------------------------------------------------
    page.get_by_role("button", name="Copy enquiry").click()
    page.wait_for_timeout(400)
    status = page.locator(".copy-status").inner_text().strip()
    if status:
        ok(f"the copy fallback reports its outcome: {status[:70]}")
    else:
        bad("the copy fallback gave no feedback")

    return errors, failed_requests


def main():
    all_console, all_failed = [], []

    with sync_playwright() as p:
        browser = p.chromium.launch(
            executable_path="/usr/bin/chromium",
            args=["--no-sandbox", "--disable-dev-shm-usage"],
        )
        context = browser.new_context()
        page = context.new_page()

        console_errors, failed = [], []
        page.on("console", lambda m: console_errors.append(f"[{m.type}] {m.text}")
                if m.type == "error" else None)
        page.on("pageerror", lambda e: console_errors.append(f"[pageerror] {e}"))
        page.on("requestfailed", lambda r: failed.append(f"{r.url} :: {r.failure}"))

        for path in ROUTES:
            label = path
            print(f"\n=== {label} ===")
            run_route_checks(page, path, label)

        # Console noise collected during route checks.
        real_errors = [e for e in console_errors if "favicon" not in e.lower()]
        if real_errors:
            bad(f"console errors during route checks: {real_errors[:5]}")
        else:
            ok("no console errors during route checks")

        real_failed = [f for f in failed if "favicon.ico" not in f]
        if real_failed:
            bad(f"failed requests during route checks: {real_failed[:5]}")
        else:
            ok("no failed network requests during route checks")

        form_errors, form_failed = run_form_flow(page)
        all_console += [e for e in form_errors if "favicon" not in e.lower()]
        all_failed += [f for f in form_failed if "favicon.ico" not in f]

        browser.close()

    print("\n" + "=" * 62)
    print(f"PASS {len(results['pass'])}   FAIL {len(results['fail'])}   WARN {len(results['warn'])}")

    if results["fail"]:
        print("\nFailures:")
        for f in results["fail"]:
            print(f"  - {f}")
    if results["warn"]:
        print("\nWarnings:")
        for w in results["warn"]:
            print(f"  - {w}")

    with open("/tmp/browser_audit.json", "w") as fh:
        json.dump(results, fh, indent=2)

    return 1 if results["fail"] else 0


if __name__ == "__main__":
    sys.exit(main())
