import assert from "node:assert/strict";
import test from "node:test";
import { isCurrentRoutePath } from "../lib/routePath";

test("matches a route path when static export adds a trailing slash", () => {
  assert.equal(isCurrentRoutePath("/wiki/example", "/wiki/example/"), true);
});
