import re
from bs4 import BeautifulSoup
from models.responses import PricingTier


def extract_competitor_intelligence(html: str, url: str) -> dict:
    """Parse HTML from Web Unlocker into structured competitive intelligence."""
    soup = BeautifulSoup(html, "lxml")

    for tag in soup(["script", "style", "nav", "footer", "head"]):
        tag.decompose()

    return {
        "pricing_tiers": _extract_pricing(soup),
        "product_claims": _extract_claims(soup),
        "job_count": _extract_job_count(soup),
        "job_titles": _extract_job_titles(soup),
        "page_summary": _extract_summary(soup),
        "raw_signals": _extract_signals(soup),
    }


def _extract_pricing(soup: BeautifulSoup) -> list[dict]:
    tiers = []
    currency_re = re.compile(r"[\$€£¥₹]\s*[\d,]+|free|per month|\/mo|\/year", re.I)

    for table in soup.find_all("table"):
        text = table.get_text(" ", strip=True)
        if currency_re.search(text):
            headers = [th.get_text(strip=True) for th in table.find_all("th")]
            for i, header in enumerate(headers[:4]):
                if header:
                    cells = table.find_all("td")
                    price_cell = next(
                        (c.get_text(strip=True) for c in cells if currency_re.search(c.get_text())),
                        None,
                    )
                    tiers.append({"name": header, "price": price_cell, "features": []})
            if tiers:
                return tiers

    for section in soup.find_all(["div", "section"], class_=re.compile(r"pric|plan|tier", re.I)):
        heading = section.find(["h2", "h3", "h4"])
        if heading:
            name = heading.get_text(strip=True)
            price_el = section.find(string=currency_re)
            features = [li.get_text(strip=True) for li in section.find_all("li")][:5]
            tiers.append({"name": name, "price": price_el, "features": features})
        if len(tiers) >= 4:
            break

    return tiers


def _extract_claims(soup: BeautifulSoup) -> list[str]:
    claims = []
    for el in soup.find_all(["h1", "h2", "h3"]):
        text = el.get_text(strip=True)
        if 5 < len(text) < 120:
            claims.append(text)
    return list(dict.fromkeys(claims))[:8]


def _extract_job_count(soup: BeautifulSoup) -> int | None:
    job_re = re.compile(r"(\d+)\s*(open|current)?\s*(job|position|role|opening)", re.I)
    match = job_re.search(soup.get_text())
    return int(match.group(1)) if match else None


def _extract_job_titles(soup: BeautifulSoup) -> list[str]:
    titles = []
    for el in soup.find_all(["li", "a", "h3", "h4"], string=re.compile(
        r"engineer|developer|manager|analyst|designer|scientist|lead|director", re.I
    )):
        text = el.get_text(strip=True)
        if 5 < len(text) < 80:
            titles.append(text)
    return list(dict.fromkeys(titles))[:6]


def _extract_summary(soup: BeautifulSoup) -> str:
    paragraphs = []
    for p in soup.find_all("p"):
        text = p.get_text(strip=True)
        if len(text) > 60:
            paragraphs.append(text)
        if len(paragraphs) == 3:
            break
    return " | ".join(paragraphs) if paragraphs else ""


def _extract_signals(soup: BeautifulSoup) -> list[str]:
    signals = []
    for el in soup.find_all(string=re.compile(
        r"new|launch|announc|partner|integrat|award|certif|compli", re.I
    )):
        text = el.strip()
        if 10 < len(text) < 150:
            signals.append(text)
    return list(dict.fromkeys(signals))[:5]
