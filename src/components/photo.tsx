import { PLACEHOLDERS } from "@/generated/placeholders";

/**
 * 미리 만들어 둔 AVIF·WebP를 srcSet으로 거는 이미지.
 *
 * 정적 export라 next/image가 최적화를 해 주지 않으므로
 * `scripts/capture-screens.mjs`·`scripts/make-card-images.mjs`가 만든 파일을 직접 쓴다.
 * width/height를 박아 CLS를 0으로 유지하므로 **실제 비율과 맞춰 넘겨야 한다.**
 * 갤러리 카드는 5:4(1280×1024), 데모 화면은 1280×800 또는 390×844다.
 *
 * lazy 이미지는 파일보다 디코드가 늦어 스크롤 직후 잠깐 빈 상자로 보였다.
 * 그래서 20px 흐림 미리보기를 <img> 배경으로 깐다 — 본 이미지가 그려지면 덮인다.
 */
const WIDTHS = [640, 1280, 1920];

export function Photo({
  base,
  alt,
  sizes = "(min-width: 768px) 50vw, 100vw",
  priority = false,
  width = 1280,
  height = 1024,
  className = "",
}: {
  base: string;
  alt: string;
  sizes?: string;
  priority?: boolean;
  width?: number;
  height?: number;
  className?: string;
}) {
  const srcSet = (ext: string) => WIDTHS.map((w) => `${base}-${w}.${ext} ${w}w`).join(", ");
  const placeholder = PLACEHOLDERS[base];

  return (
    <picture>
      <source type="image/avif" srcSet={srcSet("avif")} sizes={sizes} />
      <source type="image/webp" srcSet={srcSet("webp")} sizes={sizes} />
      <img
        src={`${base}-1280.webp`}
        alt={alt}
        width={width}
        height={height}
        loading={priority ? "eager" : "lazy"}
        decoding={priority ? "sync" : "async"}
        fetchPriority={priority ? "high" : "auto"}
        className={className}
        style={
          placeholder
            ? { backgroundImage: `url(${placeholder})`, backgroundSize: "cover" }
            : undefined
        }
      />
    </picture>
  );
}
