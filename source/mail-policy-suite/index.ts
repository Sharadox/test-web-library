import { readFileSync } from "node:fs";
import { expect, test } from "vitest";
import type { MailPolicySuiteOptions } from "@sharadox/test-web-library/mail-policy-suite/type";

/**
 * Registers the unit tests of an MTA-STS application (mta-sts.<domain>): its policy enforces TLS for the domain's mail
 * servers and is cached for a day, and Vercel serves it as plain text while every other path leads to the domain's
 * site, temporarily.
 *
 * @example
 * describeMailPolicy({ root: new URL("../../", import.meta.url), domain: "sharadox.com", mx: ["mail.protonmail.ch"] });
 */
export function describeMailPolicy({ root, domain, mx }: MailPolicySuiteOptions): void {
  const read = (path: string) => readFileSync(new URL(path, root), "utf8");
  const entries = read("public/.well-known/mta-sts.txt")
    .trim()
    .split("\n")
    .map((line) => line.split(": ") as [string, string]);
  const value = (key: string) => entries.filter(([name]) => name === key).map(([, entry]) => entry);

  test(`the policy enforces TLS for ${domain}'s mail servers`, () => {
    expect(value("version")).toEqual(["STSv1"]);
    expect(value("mode")).toEqual(["enforce"]);
    expect(value("mx")).toEqual([...mx]);
  });

  test("mail servers cache it for one day, so a change reaches them quickly", () => {
    expect(value("max_age")).toEqual(["86400"]);
  });

  test(`Vercel serves the policy as plain text and sends every other path to ${domain}`, () => {
    const configuration = JSON.parse(read("vercel.json")) as {
      outputDirectory: string;
      headers: { source: string; headers: { key: string; value: string }[] }[];
      redirects: { source: string; destination: string; permanent: boolean }[];
    };
    expect(configuration.outputDirectory).toBe("public");
    expect(configuration.headers[0]!.source).toBe("/.well-known/mta-sts.txt");
    expect(configuration.headers[0]!.headers).toContainEqual({
      key: "Content-Type",
      value: "text/plain; charset=utf-8",
    });
    const redirect = configuration.redirects[0]!;
    expect(redirect.destination).toBe(`https://${domain}`);
    expect(redirect.permanent).toBe(false);
    const pattern = new RegExp(`^${redirect.source.replace("/((?!", "/(?!(?:").replace(").*)", ")).*")}$`);
    expect(pattern.test("/.well-known/mta-sts.txt")).toBe(false);
    expect(pattern.test("/")).toBe(true);
    expect(pattern.test("/anything")).toBe(true);
  });
}
