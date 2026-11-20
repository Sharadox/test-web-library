import { describeMailPolicy } from "@sharadox/test-web-library/mail-policy-suite";

// Runs the suite on a real policy (Sharadox's), as an MTA-STS application would.
describeMailPolicy({
  root: new URL("../test-fixture/mail-policy/", import.meta.url),
  domain: "sharadox.com",
  mx: ["mail.protonmail.ch", "mailsec.protonmail.ch"],
});
