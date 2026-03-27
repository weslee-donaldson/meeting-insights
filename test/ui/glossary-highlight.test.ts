// @vitest-environment jsdom
import { describe, it, expect } from "vitest";
import { highlightGlossaryTerms } from "../../electron-ui/ui/src/lib/glossary-highlight.js";

const glossary = [
  { term: "CSTAR", variants: ["C*", "C star", "sea star"], description: "Legacy order proxy" },
  { term: "Recurly", variants: ["recurrly", "recordly"], description: "Billing platform" },
];

describe("highlightGlossaryTerms", () => {
  it("wraps first occurrence of glossary term in highlight span", () => {
    const result = highlightGlossaryTerms("The CSTAR system handles orders", glossary);
    expect(result).toBe(
      'The <span class="glossary-term" title="Legacy order proxy" data-term="CSTAR">CSTAR</span> system handles orders',
    );
  });

  it("matches variant and uses canonical term in data-term", () => {
    const result = highlightGlossaryTerms("Check sea star for details", glossary);
    expect(result).toBe(
      'Check <span class="glossary-term" title="Legacy order proxy" data-term="CSTAR">sea star</span> for details',
    );
  });

  it("only highlights first occurrence per canonical term", () => {
    const result = highlightGlossaryTerms("CSTAR feeds into CSTAR again", glossary);
    expect(result).toBe(
      '<span class="glossary-term" title="Legacy order proxy" data-term="CSTAR">CSTAR</span> feeds into CSTAR again',
    );
  });

  it("returns text unchanged when glossary is empty", () => {
    const result = highlightGlossaryTerms("No terms here", []);
    expect(result).toBe("No terms here");
  });

  it("returns text unchanged when no terms match", () => {
    const result = highlightGlossaryTerms("No matching terms", glossary);
    expect(result).toBe("No matching terms");
  });

  it("returns empty string unchanged", () => {
    const result = highlightGlossaryTerms("", glossary);
    expect(result).toBe("");
  });

  it("handles HTML content without breaking tags", () => {
    const result = highlightGlossaryTerms("<p>The CSTAR system</p>", glossary);
    expect(result).toBe(
      '<p>The <span class="glossary-term" title="Legacy order proxy" data-term="CSTAR">CSTAR</span> system</p>',
    );
  });

  it("escapes description HTML in title attribute", () => {
    const g = [{ term: "Test", variants: [], description: 'Uses <script> & "quotes"' }];
    const result = highlightGlossaryTerms("Test value", g);
    expect(result).toBe(
      '<span class="glossary-term" title="Uses &lt;script&gt; &amp; &quot;quotes&quot;" data-term="Test">Test</span> value',
    );
  });

  it("highlights multiple different terms in one string", () => {
    const result = highlightGlossaryTerms("CSTAR integrates with Recurly", glossary);
    expect(result).toBe(
      '<span class="glossary-term" title="Legacy order proxy" data-term="CSTAR">CSTAR</span> integrates with <span class="glossary-term" title="Billing platform" data-term="Recurly">Recurly</span>',
    );
  });

  it("longest match wins when terms overlap", () => {
    const g = [
      { term: "C star system", variants: [], description: "Full system name" },
      { term: "CSTAR", variants: ["C star"], description: "Short name" },
    ];
    const result = highlightGlossaryTerms("The C star system is running", g);
    expect(result).toBe(
      'The <span class="glossary-term" title="Full system name" data-term="C star system">C star system</span> is running',
    );
  });
});
