import { vi } from "vitest";

/** A stand-in for @playwright/test: records registered tests and every assertion, so suites can be run on fakes. */
export const registered: { name: string; body: (fixtures: Record<string, unknown>) => Promise<void> }[] = [];
export const assertions: { value: unknown; matcher: string; expected: unknown[] }[] = [];

export const test = Object.assign(
  (name: string, body: (fixtures: Record<string, unknown>) => Promise<void>) => registered.push({ name, body }),
  { skip: vi.fn() },
);

/** Records `expect(value).matcher(...)` and `expect(value).not.matcher(...)` (as "not.matcher"). */
export const expect = (value: unknown, prefix = ""): Record<string, unknown> =>
  new Proxy(
    {},
    {
      get: (_, matcher: string) =>
        matcher === "not"
          ? expect(value, "not.")
          : (...expected: unknown[]) => {
              assertions.push({ value, matcher: prefix + matcher, expected });
              return Promise.resolve();
            },
    },
  );

/**
 * A fake page or locator: every method returns another fake, except the ones given in `answers`, which return
 * their value (wrapped in a promise when `async`).
 */
export function fake(answers: Record<string, unknown> = {}): Record<string, unknown> {
  return new Proxy(
    {},
    {
      get: (_, property: string) => {
        if (property === "then") return undefined;
        if (property in answers) return answers[property];
        return vi.fn(() => fake(answers));
      },
    },
  );
}
