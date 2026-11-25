import { createHash } from "node:crypto";
import { writeFileSync } from "node:fs";
import { join } from "node:path";

// One printed safety label for every human. Funny first, plausible second.
const LINE =
  "WARNING: May store one argument for several days and release it as 'it's fine.'";

const outputDir = process.env.MAKEFUN_OUTPUT_DIR;
if (!outputDir) {
  process.stderr.write("MAKEFUN_OUTPUT_DIR is required\n");
  process.exit(1);
}

const codePoints = Array.from(LINE).length;
const utf16Units = LINE.length;
const utf8Bytes = Buffer.byteLength(LINE, "utf8");
const printableAscii = Array.from(LINE).every((ch) => {
  const code = ch.codePointAt(0) ?? 0;
  return code >= 0x20 && code <= 0x7e;
});

if (
  codePoints < 1 ||
  codePoints > 160 ||
  utf16Units > 160 ||
  utf8Bytes > 160 ||
  LINE !== LINE.trim() ||
  /[\r\n]/.test(LINE) ||
  !/\S/.test(LINE) ||
  !printableAscii
) {
  process.stderr.write("entry failed the conservative one-line gate\n");
  process.exit(1);
}

const filePath = join(outputDir, "entry.txt");
writeFileSync(filePath, LINE, { encoding: "utf8" });

const sha256 = createHash("sha256").update(LINE, "utf8").digest("hex");
process.stdout.write(
  `codepoints ${codePoints}\nutf16 ${utf16Units}\nutf8 ${utf8Bytes}\nsha256 ${sha256}\n`,
);
