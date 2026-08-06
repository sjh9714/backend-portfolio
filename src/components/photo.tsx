/**
 * 미리 만들어 둔 AVIF·WebP를 srcSet으로 거는 이미지.
 *
 * 정적 export라 next/image가 최적화를 해 주지 않으므로
 * `scripts/fetch-photos.mjs`·`scripts/capture-screens.mjs`가 만든 파일을 직접 쓴다.
 * width/height를 박아 CLS를 0으로 유지하므로 **실제 비율과 맞춰 넘겨야 한다.**
 * 갤러리 사진은 5:4(1280×1024), 데모 화면은 1280×800이다.
 *
 * 갤러리에서 이미지는 도메인 분위기만 담당한다. 수치와 근거는 타이포와 다이어그램이 진다.
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
      />
    </picture>
  );
}
