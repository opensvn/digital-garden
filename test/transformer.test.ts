import assert from "node:assert/strict";
import test from "node:test";
import { Transformer } from "../lib/transformer";

test("renders GitHub-flavored Markdown tables as HTML tables", () => {
  const [[html]] = Transformer.getHtmlContent(`| Name | Value |
| --- | --- |
| alpha | 1 |`);

  assert.match(html, /<table>/);
  assert.match(html, /<th>Name<\/th>/);
  assert.match(html, /<td>alpha<\/td>/);
});
