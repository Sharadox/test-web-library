export interface MailPolicySuiteOptions {
  /** The application's folder (`new URL("../../", import.meta.url)` from a test in source/<folder>/). */
  root: URL;
  /** The mail domain the policy is for, where every other address leads, for example "sharadox.com". */
  domain: string;
  /** The mail servers the policy names, in order. */
  mx: readonly string[];
}
