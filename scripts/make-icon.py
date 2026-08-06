"""파비콘을 만든다 — SVG와 ICO를 같은 좌표에서 함께 낸다.

두 벌을 손으로 그리면 언젠가 어긋난다. 좌표를 여기 한 번만 적고 두 형식으로 내보낸다.

마크
    클랭 블루 바닥에 라임 점 하나, 그 뒤로 세로선이 화면을 관통한다.
    이 사이트가 하는 이야기가 "요청이 지나가는 길"이라 그 길과 그 위를 지나는 것을 그렸다.

왜 글자가 아닌가
    16px에서 '성'은 뭉개진다. 획이 다섯 방향으로 갈리는 글자를 16픽셀에 넣으면 얼룩이 된다.
    한글 파비콘을 쓰는 서비스가 드문 이유다(토스·당근·네이버 모두 기호나 라틴 한 글자).
    대신 채도 높은 파랑과 라임 조합은 탭 줄에서 드물어서, 글자 없이도 이 사이트로 식별된다.

왜 이 크기들인가
    레티나 맥에서 탭은 32px로 그린다. 16px은 그 아래 폴백이다.
    그래서 32px에서 제대로 보이게 잡고 16px에서 무너지지 않는지를 확인했다.
    세로선은 16px에서 1px까지 얇아지지만 점이 마크를 지탱한다.

실행: python3 scripts/make-icon.py
"""

from pathlib import Path

from PIL import Image, ImageDraw

ROOT = Path(__file__).resolve().parent.parent
APP = ROOT / "src" / "app"

# globals.css의 토큰과 같은 값이어야 한다
BLUE = "#0016ec"  # --color-accent
LIME = "#c1ff00"  # --color-signal

BOX = 32.0  # 좌표계. 아래 값은 전부 이 안의 단위다.
PATH_X = 16.0  # 세로선 중심
PATH_W = 2.0
PATH_ALPHA = 0.42  # 흰 선을 옅게 — 길이지 주인공이 아니다
DOT_Y = 19.0  # 중앙보다 아래. 내려가는 중이라는 인상을 준다.
DOT_R = 5.0

ICO_SIZES = [16, 32, 48, 64, 128, 256]
APPLE = 180


def write_svg() -> Path:
    svg = f"""<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 {BOX:.0f} {BOX:.0f}">
  <rect width="{BOX:.0f}" height="{BOX:.0f}" fill="{BLUE}"/>
  <rect x="{PATH_X - PATH_W / 2:g}" y="0" width="{PATH_W:g}" height="{BOX:.0f}"
        fill="#ffffff" opacity="{PATH_ALPHA:g}"/>
  <circle cx="{PATH_X:g}" cy="{DOT_Y:g}" r="{DOT_R:g}" fill="{LIME}"/>
</svg>
"""
    out = APP / "icon.svg"
    out.write_text(svg, encoding="utf-8")
    return out


def render(size: int) -> Image.Image:
    """같은 좌표를 래스터로. 계단이 지지 않게 8배로 그리고 줄인다."""
    ss = 8
    px = size * ss
    scale = px / BOX

    img = Image.new("RGBA", (px, px), BLUE)
    draw = ImageDraw.Draw(img)

    line = Image.new("RGBA", (px, px), (0, 0, 0, 0))
    ImageDraw.Draw(line).rectangle(
        [(PATH_X - PATH_W / 2) * scale, 0, (PATH_X + PATH_W / 2) * scale, px],
        fill=(255, 255, 255, round(255 * PATH_ALPHA)),
    )
    img = Image.alpha_composite(img, line)

    draw = ImageDraw.Draw(img)
    draw.ellipse(
        [
            (PATH_X - DOT_R) * scale,
            (DOT_Y - DOT_R) * scale,
            (PATH_X + DOT_R) * scale,
            (DOT_Y + DOT_R) * scale,
        ],
        fill=LIME,
    )

    return img.resize((size, size), Image.Resampling.LANCZOS)


def main() -> None:
    svg = write_svg()
    print(f"wrote {svg.relative_to(ROOT)}")

    frames = [render(s) for s in ICO_SIZES]
    ico = APP / "favicon.ico"
    # 크기마다 따로 그려서 넘긴다. Pillow에게 맡기면 256px 하나를 줄여 16px을 만드는데,
    # 그러면 라임 점 가장자리가 뭉개진다.
    #
    # 기준 이미지는 **가장 큰 것**이어야 한다. Pillow의 ICO 저장은 기준보다 큰 크기를
    # 목록에서 조용히 빼기 때문에, 16px을 기준으로 주면 16px 한 장만 담긴 파일이 나온다.
    # 실제로 그렇게 나왔고, 프레임 수를 세어 보고 알았다.
    largest = frames[-1]
    largest.save(
        ico,
        format="ICO",
        sizes=[(s, s) for s in ICO_SIZES],
        append_images=frames[:-1],
    )
    print(f"wrote {ico.relative_to(ROOT)}  ({ico.stat().st_size / 1024:.1f} KB, {ICO_SIZES})")

    apple = render(APPLE).convert("RGB")
    apple_path = APP / "apple-icon.png"
    apple.save(apple_path, format="PNG")
    print(f"wrote {apple_path.relative_to(ROOT)}  ({apple_path.stat().st_size / 1024:.1f} KB)")

    # 눈으로 확인할 대조표
    proof = Image.new("RGB", (16 + 32 + 64 + 40, 64), "#ffffff")
    x = 8
    for s in (16, 32, 64):
        proof.paste(render(s).convert("RGB"), (x, (64 - s) // 2))
        x += s + 12
    proof_path = ROOT / "scripts" / ".icon-proof.png"
    proof.save(proof_path)
    print(f"wrote {proof_path.relative_to(ROOT)}  (확인용, 커밋하지 않는다)")


if __name__ == "__main__":
    main()
