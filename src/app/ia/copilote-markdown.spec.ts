import { renderMarkdown } from "./copilote-markdown";

describe("renderMarkdown", () => {
  it("escapes any HTML coming from the model", () => {
    const html = renderMarkdown('<img src=x onerror="alert(1)"> **gras**');
    expect(html).not.toContain("<img");
    expect(html).toContain("&lt;img src=x onerror=&quot;alert(1)&quot;&gt;");
    expect(html).toContain("<strong>gras</strong>");
  });

  it("renders paragraphs, lists and inline code", () => {
    const html = renderMarkdown(
      "Deux voyages :\n\n- **VOY-1** en cours\n- VOY-2 *planifié*\n\n1. un\n2. deux\n\nVoir `DOS-1`."
    );
    expect(html).toBe(
      "<p>Deux voyages :</p>" +
        "<ul><li><strong>VOY-1</strong> en cours</li><li>VOY-2 <em>planifié</em></li></ul>" +
        "<ol><li>un</li><li>deux</li></ol>" +
        "<p>Voir <code>DOS-1</code>.</p>"
    );
  });

  it("renders tables and headings", () => {
    const html = renderMarkdown(
      "## Flotte\n| Véhicule | Statut |\n|---|---|\n| AB-123-CD | DISPONIBLE |"
    );
    expect(html).toBe(
      "<h4>Flotte</h4>" +
        "<table><thead><tr><th>Véhicule</th><th>Statut</th></tr></thead>" +
        "<tbody><tr><td>AB-123-CD</td><td>DISPONIBLE</td></tr></tbody></table>"
    );
  });

  it("keeps code blocks verbatim", () => {
    expect(renderMarkdown('```json\n{"a": "<b>"}\n```')).toBe(
      "<pre><code>{&quot;a&quot;: &quot;&lt;b&gt;&quot;}</code></pre>"
    );
  });
});
