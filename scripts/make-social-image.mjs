/** 코드로 관리하는 공유 카드 SVG를 PNG로 내보낸다. 한국어 폰트가 있는 환경에서 실행한다. */
import sharp from "sharp";
await sharp("public/og.svg").png().toFile("public/og.png");
console.log("saved public/og.png");
