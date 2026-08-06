/**
 * 갤러리 이미지.
 *
 * 정적 export라 next/image가 최적화를 해 주지 않으므로
 * `scripts/generate-images.mjs`가 미리 만들어 둔 AVIF·WebP를 srcSet으로 직접 건다.
 * 비율은 lusion 카드와 같은 5:4(1280×1024) — width/height를 박아 CLS를 0으로 유지한다.
 *
 * 이미지는 도메인 분위기만 담당한다. 수치와 근거는 전부 타이포와 다이어그램이 진다.
 */
const WIDTHS = [640, 1280, 1920];

export function Photo({
  base,
  alt,
  sizes = "(min-width: 768px) 50vw, 100vw",
  priority = false,
  className = "",
}: {
  base: string;
  alt: string;
  sizes?: string;
  priority?: boolean;
  className?: string;
}) {
  const srcSet = (ext: string) => WIDTHS.map((w) => `${base}-${w}.${ext} ${w}w`).join(", ");

  return (
    <picture>
      <source type="image/avif" srcSet={srcSet("avif")} sizes={sizes} />
      <source type="image/webp" srcSet={srcSet("webp")} sizes={sizes} />
      <img
        src={`${base}-1280.webp`}
        alt={alt}
        width={1280}
        height={1024}
        loading={priority ? "eager" : "lazy"}
        decoding={priority ? "sync" : "async"}
        fetchPriority={priority ? "high" : "auto"}
        className={className}
      />
    </picture>
  );
}
