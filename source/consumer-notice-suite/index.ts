import { expect, test } from "@playwright/test";

/**
 * Registers a test that the footer carries what Portuguese consumer law asks of every site: the link to the
 * complaints book and the alternative dispute resolution center (CIMAAL, for the Algarve).
 *
 * @example
 * describeConsumerNotices("/pt");
 */
export function describeConsumerNotices(path: string): void {
  test("the footer carries the complaints book and the consumer dispute notice", async ({ page }) => {
    await page.goto(path);
    const footer = page.getByRole("contentinfo");
    await expect(footer.getByRole("link", { name: "Livro de Reclamações" })).toHaveAttribute(
      "href",
      "https://www.livroreclamacoes.pt/",
    );
    await expect(footer.getByRole("link", { name: /CIMAAL/ })).toHaveAttribute(
      "href",
      "https://www.consumoalgarve.pt/",
    );
  });
}
