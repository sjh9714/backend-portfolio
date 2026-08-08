/**
 * 이력서 PDF가 어느 콘텐츠에서 나왔는지를 해시 한 줄로 남긴다.
 *
 * PDF는 커밋된 산출물이라 조용히 낡는다 — 콘텐츠의 수치를 고치고 재생성을 잊으면,
 * 화면과 채용담당자가 받는 파일이 서로 다른 숫자를 말하게 된다. 사이트가 근거를
 * 커밋 SHA로 고정하는 것과 같은 이유로, 이 파일도 출처를 고정한다.
 *
 * git은 mtime을 보존하지 않으므로 시간이 아니라 내용으로 비교한다.
 */
import { createHash } from "node:crypto";
import { readFileSync, readdirSync } from "node:fs";
import path from "node:path";

/** /resume 화면을 만드는 것들. 하나라도 바뀌면 PDF를 다시 뽑아야 한다. */
export const RESUME_SOURCES = [
  "src/content/resume.ts",
  "src/content/profile.ts",
  ...readdirSync("src/content/projects")
    .filter((f) => f.endsWith(".ts"))
    .sort()
    .map((f) => path.join("src/content/projects", f)),
];

export const HASH_FILE = "public/resume-sung-jinhyuk.pdf.sha256";

export function resumeSourceHash() {
  const h = createHash("sha256");
  for (const f of RESUME_SOURCES) {
    h.update(f);
    h.update(readFileSync(f));
  }
  return h.digest("hex");
}
