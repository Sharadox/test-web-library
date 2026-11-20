import { beforeEach, expect, test, vi } from "vitest";
import { assertions, fake, registered } from "@sharadox/test-web-library/test-fixture/playwright";

vi.mock("@playwright/test", () => import("@sharadox/test-web-library/test-fixture/playwright"));
const { describeConsumerNotices } = await import("@sharadox/test-web-library/consumer-notice-suite");

beforeEach(() => {
  registered.length = 0;
  assertions.length = 0;
});

test("expects the complaints book and the dispute center in the footer", async () => {
  describeConsumerNotices("/pt");
  const goto = vi.fn(async () => {});
  await registered[0]!.body({ page: fake({ goto }) });
  expect(goto).toHaveBeenCalledWith("/pt");
  expect(assertions.map(({ expected }) => expected)).toEqual([
    ["href", "https://www.livroreclamacoes.pt/"],
    ["href", "https://www.consumoalgarve.pt/"],
  ]);
});
