from tools.content_extractor import extract_competitor_intelligence

SAMPLE_HTML = """
<html><body>
  <h1>The #1 CRM Platform</h1>
  <h2>Simple, powerful tools</h2>
  <table>
    <tr><th>Starter</th><th>Pro</th><th>Enterprise</th></tr>
    <tr><td>$25/mo</td><td>$75/mo</td><td>Custom</td></tr>
    <tr><td>5 users</td><td>Unlimited users</td><td>SSO</td></tr>
  </table>
  <ul>
    <li>Senior Software Engineer</li>
    <li>Product Manager</li>
  </ul>
  <p>We are hiring 12 open positions across engineering and product.</p>
  <p>Our platform helps 50,000 companies close more deals faster.</p>
  <p>Newly announced integration with Slack and Microsoft Teams.</p>
</body></html>
"""


def test_extracts_pricing_tiers():
    result = extract_competitor_intelligence(SAMPLE_HTML, "https://example.com")
    assert isinstance(result["pricing_tiers"], list)


def test_extracts_product_claims():
    result = extract_competitor_intelligence(SAMPLE_HTML, "https://example.com")
    assert len(result["product_claims"]) > 0
    assert any("CRM" in c or "platform" in c.lower() for c in result["product_claims"])


def test_extracts_job_count():
    result = extract_competitor_intelligence(SAMPLE_HTML, "https://example.com")
    assert result["job_count"] == 12


def test_extracts_job_titles():
    result = extract_competitor_intelligence(SAMPLE_HTML, "https://example.com")
    assert len(result["job_titles"]) > 0


def test_extracts_page_summary():
    result = extract_competitor_intelligence(SAMPLE_HTML, "https://example.com")
    assert len(result["page_summary"]) > 0


def test_returns_empty_lists_not_errors_for_missing_sections():
    empty_html = "<html><body><p>Nothing here</p></body></html>"
    result = extract_competitor_intelligence(empty_html, "https://example.com")
    assert result["pricing_tiers"] == []
    assert result["job_count"] is None
    assert result["job_titles"] == []
