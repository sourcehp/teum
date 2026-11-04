#!/usr/bin/env python3
"""샘플 이미지 생성기: 토큰 색 기반의 추상 인테리어 12장을 public/samples/에 만든다.

실행: python3 -I scripts/generate-samples.py  (Pillow, numpy 필요)
시드를 고정했으므로 몇 번을 돌려도 같은 결과가 나온다.
"""
import os
import numpy as np
from PIL import Image, ImageDraw, ImageFilter, ImageFont

W, H = 1600, 1067
OUT = os.path.join(os.path.dirname(os.path.abspath(__file__)), "..", "public", "samples")

# 디자인 토큰
BG, LINE, ACCENT, ACCENT_INK, INK, MUTED = (
    (247, 245, 242), (228, 224, 218), (184, 145, 106), (138, 106, 76), (31, 30, 28), (110, 106, 100),
)
WARM = (255, 214, 160)


def mix(a, b, t):
    return tuple(int(round(a[i] + (b[i] - a[i]) * t)) for i in range(3))


class Room:
    """일점 투시 방. u:좌우(0~1), v:높이(0~1), t:깊이(0 앞면~1 뒷벽)."""

    def __init__(self, back=(0.30, 0.22, 0.70, 0.72), margin=0.12):
        self.fx0, self.fy0 = -W * margin, -H * margin
        self.fx1, self.fy1 = W * (1 + margin), H * (1 + margin)
        self.bx0, self.by0, self.bx1, self.by1 = (back[0] * W, back[1] * H, back[2] * W, back[3] * H)

    def p(self, u, v, t):
        fx = self.fx0 + u * (self.fx1 - self.fx0)
        fy = self.fy1 - v * (self.fy1 - self.fy0)
        bx = self.bx0 + u * (self.bx1 - self.bx0)
        by = self.by1 - v * (self.by1 - self.by0)
        return (fx + (bx - fx) * t, fy + (by - fy) * t)

    def quad(self, pts):
        return [self.p(*q) for q in pts]


def shade(c, k):
    return tuple(max(0, min(255, int(x * k))) for x in c)


def add_layer(base, draw_fn, blur=0, alpha=1.0):
    layer = Image.new("RGBA", (W, H), (0, 0, 0, 0))
    draw_fn(ImageDraw.Draw(layer))
    if blur:
        layer = layer.filter(ImageFilter.GaussianBlur(blur))
    if alpha < 1:
        a = layer.getchannel("A").point(lambda x: int(x * alpha))
        layer.putalpha(a)
    base.alpha_composite(layer)


def box(room, d, u0, u1, t0, t1, v1, col, v0=0.0, top_k=1.12, side_k=0.82, shadow=True, hs=0.5):
    """바닥/벽에 놓인 직육면체. 앞면(t0)·윗면·보이는 옆면을 그린다.
    hs: 방 높이 대비 가구 높이 축척, 깊이는 앞쪽 과장을 줄이려고 뒤쪽으로 압축한다."""
    v0, v1 = v0 * hs, v1 * hs
    t0, t1 = 0.40 + 0.58 * t0, 0.40 + 0.58 * t1
    front = room.quad([(u0, v0, t0), (u1, v0, t0), (u1, v1, t0), (u0, v1, t0)])
    top = room.quad([(u0, v1, t0), (u1, v1, t0), (u1, v1, t1), (u0, v1, t1)])
    if (u0 + u1) / 2 < 0.5:
        side = room.quad([(u1, v0, t0), (u1, v0, t1), (u1, v1, t1), (u1, v1, t0)])
    else:
        side = room.quad([(u0, v0, t0), (u0, v0, t1), (u0, v1, t1), (u0, v1, t0)])
    if shadow and v0 == 0.0:
        sh = room.quad([(u0 - 0.02, 0, t0 - 0.01), (u1 + 0.05, 0, t0 - 0.01), (u1 + 0.07, 0, t1 + 0.03), (u0 - 0.02, 0, t1 + 0.03)])
        add_layer(d["img"], lambda g: g.polygon(sh, fill=(20, 16, 12, 120)), blur=14)
    g = ImageDraw.Draw(d["img"])
    g.polygon(side, fill=shade(col, side_k))
    g.polygon(top, fill=shade(col, top_k))
    g.polygon(front, fill=col)


def pendant(d, room, u, t, drop, col, r=26):
    x, y = room.p(u, 1.0, t)
    y2 = y + drop
    g = ImageDraw.Draw(d["img"])
    g.line([(x, y), (x, y2)], fill=INK, width=2)
    g.pieslice([x - r, y2 - r, x + r, y2 + r], 180, 360, fill=col)
    g.rectangle([x - r, y2 - 2, x + r, y2 + 3], fill=shade(col, 0.8))
    add_layer(d["img"], lambda gg: gg.ellipse([x - r * 2.2, y2 - r, x + r * 2.2, y2 + r * 2.6], fill=(*WARM, 70)), blur=24)


def frame(d, room, u0, u1, v0, v1, col, inner=None):
    quad = room.quad([(u0, v0, 1), (u1, v0, 1), (u1, v1, 1), (u0, v1, 1)])
    g = ImageDraw.Draw(d["img"])
    g.polygon(quad, fill=col)
    if inner:
        du, dv = (u1 - u0) * 0.1, (v1 - v0) * 0.1
        q2 = room.quad([(u0 + du, v0 + dv, 1), (u1 - du, v0 + dv, 1), (u1 - du, v1 - dv, 1), (u0 + du, v1 - dv, 1)])
        g.polygon(q2, fill=inner)


def new_scene(room, wall, floor, ceil, side_k=0.9):
    img = Image.new("RGBA", (W, H), wall + (255,))
    g = ImageDraw.Draw(img)
    g.polygon(room.quad([(0, 0, 0), (1, 0, 0), (1, 0, 1), (0, 0, 1)]), fill=floor)
    g.polygon(room.quad([(0, 1, 0), (1, 1, 0), (1, 1, 1), (0, 1, 1)]), fill=ceil)
    g.polygon(room.quad([(0, 0, 0), (0, 1, 0), (0, 1, 1), (0, 0, 1)]), fill=shade(wall, side_k))
    g.polygon(room.quad([(1, 0, 0), (1, 1, 0), (1, 1, 1), (1, 0, 1)]), fill=shade(wall, side_k * 0.94))
    g.polygon(room.quad([(0, 0, 1), (1, 0, 1), (1, 1, 1), (0, 1, 1)]), fill=wall)
    # 바닥 판재 이음선
    for i in range(1, 9):
        u = i / 9
        g.line([room.p(u, 0, 0), room.p(u, 0, 1)], fill=shade(floor, 0.93), width=2)
    return {"img": img}


def light_slit(d, room, u0, u1, v0, v1, strength=1.0, floor_cast=True):
    """뒷벽의 세로 틈새 빛: 밝은 슬릿 + 번짐 + 바닥에 떨어지는 빛 + 옆 벽 번짐."""
    img = d["img"]
    quad = room.quad([(u0, v0, 1), (u1, v0, 1), (u1, v1, 1), (u0, v1, 1)])
    add_layer(img, lambda g: g.polygon(quad, fill=(*WARM, int(255 * strength))), blur=45, alpha=0.65)
    add_layer(img, lambda g: g.polygon(quad, fill=(*WARM, int(255 * strength))), blur=12, alpha=0.8)
    g = ImageDraw.Draw(img)
    g.polygon(quad, fill=(255, 244, 224))
    if floor_cast:
        mid = (u0 + u1) / 2
        cast = room.quad([(u0, 0, 1), (u1, 0, 1), (mid + 0.30, 0, 0.12), (mid - 0.30, 0, 0.12)])
        add_layer(img, lambda gg: gg.polygon(cast, fill=(*WARM, int(150 * strength))), blur=34)


def finish(d, seed, out, worn=False, label=True, dark=0.0, warm_bias=0.0):
    rng = np.random.default_rng(seed)
    img = d["img"].convert("RGB")
    a = np.asarray(img).astype(np.float32)
    yy, xx = np.mgrid[0:H, 0:W].astype(np.float32)
    # 비네팅
    r = np.sqrt(((xx - W / 2) / (W / 2)) ** 2 + ((yy - H / 2) / (H / 2)) ** 2)
    a *= (1.0 - 0.28 * np.clip(r - 0.35, 0, 1.2) ** 1.4 - dark)[..., None]
    # 위쪽 천장 쪽 완만한 어둠
    a *= (0.90 + 0.10 * (yy / H))[..., None]
    if worn:
        gray = a.mean(axis=2, keepdims=True)
        a = a * 0.55 + gray * 0.45
        blot = np.asarray(Image.fromarray((rng.random((H // 40, W // 40)) * 255).astype(np.uint8)).resize((W, H), Image.BICUBIC).filter(ImageFilter.GaussianBlur(30))).astype(np.float32)
        blot = (blot - blot.min()) / (np.ptp(blot) + 1e-6)
        a *= (0.80 + 0.30 * blot)[..., None]
        a[..., 2] *= 0.93
    if warm_bias:
        a[..., 0] *= 1 + warm_bias
        a[..., 2] *= 1 - warm_bias
    # 필름 그레인
    a += rng.normal(0, 3.2, (H, W, 1)).astype(np.float32)
    img = Image.fromarray(np.clip(a, 0, 255).astype(np.uint8))
    if label:
        g = ImageDraw.Draw(img, "RGBA")
        try:
            font = ImageFont.load_default(size=22)
        except TypeError:
            font = ImageFont.load_default()
        g.text((W - 112, H - 46), "SAMPLE", fill=(255, 255, 255, 150), font=font)
    img.save(os.path.join(OUT, out), "WEBP", quality=82, method=6)


# ---------------------------------------------------------------------------
# 장면 ---------------------------------------------------------------------

def scene_living(seed, flip=False, wall=BG, floor=(214, 196, 172), sofa=(150, 140, 128), slit=(0.58, 0.64), out="living.webp"):
    room = Room(back=(0.26, 0.20, 0.74, 0.70) if not flip else (0.30, 0.22, 0.78, 0.72))
    d = new_scene(room, wall, floor, shade(wall, 1.02))
    light_slit(d, room, slit[0], slit[1], 0.0, 0.94)
    frame(d, room, 0.18, 0.38, 0.40, 0.80, mix(wall, ACCENT, 0.5), mix(wall, ACCENT_INK, 0.25))
    box(room, d, 0.12, 0.52, 0.55, 0.72, 0.5, sofa)       # 소파 좌석
    box(room, d, 0.12, 0.52, 0.70, 0.76, 0.78, shade(sofa, 0.95), shadow=False)  # 등받이
    box(room, d, 0.62, 0.84, 0.32, 0.46, 0.26, ACCENT_INK)  # 로우 테이블
    box(room, d, 0.04, 0.12, 0.60, 0.74, 0.86, LINE, hs=0.8)        # 선반장
    box(room, d, 0.66, 0.70, 0.88, 0.92, 0.50, INK)         # 스탠드 받침
    pendant(d, room, 0.40, 0.45, 150, ACCENT)
    finish(d, seed, out, warm_bias=0.02)


def scene_kitchen(seed, island=(0.30, 0.74), cab=(150, 138, 122), wall=BG, out="kitchen.webp"):
    room = Room(back=(0.24, 0.20, 0.76, 0.70))
    d = new_scene(room, wall, (222, 210, 192), shade(wall, 1.02))
    light_slit(d, room, 0.60, 0.66, 0.0, 0.92)
    box(room, d, 0.06, 0.58, 0.82, 1.0, 0.44, cab, shadow=False)          # 하부장
    box(room, d, 0.06, 0.58, 0.80, 0.98, 0.46, mix(cab, BG, 0.5), v0=0.44, top_k=1.05, shadow=False)
    box(room, d, 0.06, 0.58, 0.90, 1.0, 0.92, shade(cab, 1.06), v0=0.62, shadow=False, hs=1.0)  # 상부장
    box(room, d, island[0], island[1], 0.28, 0.46, 0.36, shade(cab, 0.9))   # 아일랜드
    box(room, d, island[0] - 0.01, island[1] + 0.01, 0.26, 0.48, 0.38, mix(BG, LINE, 0.5), v0=0.36, top_k=1.05, shadow=False)
    for u in (0.40, 0.58):
        box(room, d, u, u + 0.06, 0.12, 0.17, 0.22, INK)                   # 스툴
    for u in (0.32, 0.52):
        pendant(d, room, u, 0.40, 130, mix(ACCENT, WARM, 0.2), r=24)
    finish(d, seed, out, warm_bias=0.02)


def scene_bedroom(seed, wall=(236, 231, 224), bed=(205, 195, 182), out="bedroom.webp", slit=(0.20, 0.25)):
    room = Room(back=(0.28, 0.22, 0.72, 0.72))
    d = new_scene(room, wall, (208, 190, 166), shade(wall, 1.03))
    light_slit(d, room, slit[0], slit[1], 0.0, 0.90)
    frame(d, room, 0.40, 0.66, 0.55, 0.80, mix(wall, ACCENT_INK, 0.35), mix(wall, ACCENT, 0.5))
    box(room, d, 0.22, 0.78, 0.30, 0.78, 0.26, bed)                       # 매트리스
    box(room, d, 0.22, 0.78, 0.30, 0.78, 0.30, shade(bed, 1.08), v0=0.26, top_k=1.04, shadow=False)  # 침구
    box(room, d, 0.20, 0.80, 0.78, 0.82, 0.62, mix(ACCENT_INK, wall, 0.2), shadow=False)           # 헤드보드
    box(room, d, 0.10, 0.20, 0.64, 0.80, 0.24, LINE)                      # 협탁
    box(room, d, 0.80, 0.90, 0.64, 0.80, 0.24, LINE)
    finish(d, seed, out, warm_bias=0.03)


def scene_cafe(seed, out="cafe.webp", dark_wall=False):
    wall = (84, 70, 58) if dark_wall else (232, 224, 212)
    room = Room(back=(0.22, 0.18, 0.78, 0.68))
    d = new_scene(room, wall, (160, 126, 96) if dark_wall else (196, 168, 134), shade(wall, 0.95))
    light_slit(d, room, 0.46, 0.50, 0.0, 0.92, strength=1.0)
    box(room, d, 0.10, 0.90, 0.86, 0.96, 0.40, ACCENT_INK)               # 카운터
    box(room, d, 0.10, 0.90, 0.84, 0.98, 0.42, mix(BG, LINE, 0.6), v0=0.40, top_k=1.05, shadow=False)
    box(room, d, 0.14, 0.40, 0.90, 0.96, 0.82, shade(wall, 0.85), v0=0.54, shadow=False, hs=1.0)  # 진열 선반
    box(room, d, 0.60, 0.86, 0.90, 0.96, 0.82, shade(wall, 0.85), v0=0.54, shadow=False, hs=1.0)
    for u, t in ((0.14, 0.40), (0.34, 0.30), (0.62, 0.40), (0.82, 0.30)):
        box(room, d, u, u + 0.12, t, t + 0.10, 0.20, INK if dark_wall else ACCENT)  # 테이블
        box(room, d, u + 0.05, u + 0.07, t + 0.02, t + 0.05, 0.19, MUTED, shadow=False)
    for u in (0.28, 0.50, 0.72):
        pendant(d, room, u, 0.62, 170 if u != 0.5 else 140, ACCENT, r=22)
    finish(d, seed, out, dark=0.06 if dark_wall else 0.0, warm_bias=0.04)


def scene_showroom(seed, out="showroom.webp"):
    room = Room(back=(0.20, 0.16, 0.80, 0.66))
    d = new_scene(room, (240, 238, 234), (202, 198, 192), (250, 248, 245))
    light_slit(d, room, 0.12, 0.15, 0.0, 0.95)
    light_slit(d, room, 0.85, 0.88, 0.0, 0.95, strength=0.7, floor_cast=False)
    for i, (u, t, h, c) in enumerate(((0.18, 0.75, 0.55, ACCENT), (0.40, 0.60, 0.40, LINE), (0.62, 0.62, 0.62, ACCENT_INK), (0.80, 0.78, 0.46, (150, 140, 128)))):
        box(room, d, u, u + 0.12, t, t + 0.12, h, c)
    box(room, d, 0.30, 0.70, 0.22, 0.34, 0.10, INK)                       # 전시 단상
    box(room, d, 0.34, 0.46, 0.25, 0.31, 0.24, ACCENT, v0=0.10)
    box(room, d, 0.54, 0.64, 0.25, 0.31, 0.32, BG, v0=0.10)
    finish(d, seed, out)


def scene_office(seed, out="office.webp"):
    room = Room(back=(0.18, 0.20, 0.82, 0.70))
    d = new_scene(room, (238, 236, 232), (176, 170, 160), (250, 249, 246))
    light_slit(d, room, 0.30, 0.34, 0.0, 0.92)
    light_slit(d, room, 0.64, 0.68, 0.0, 0.92, strength=0.8)
    for u in (0.12, 0.40, 0.68):                                          # 데스크 열
        box(room, d, u, u + 0.20, 0.30, 0.46, 0.20, (190, 176, 156))
        box(room, d, u + 0.07, u + 0.13, 0.36, 0.38, 0.30, INK, v0=0.20, shadow=False)  # 모니터
    for u in (0.16, 0.44, 0.72):
        box(room, d, u, u + 0.06, 0.50, 0.55, 0.12, MUTED)                # 의자
    box(room, d, 0.06, 0.94, 0.88, 0.98, 0.50, (205, 198, 188), shadow=False, hs=0.9)  # 수납 벽장
    for i in range(6):
        pendant(d, room, 0.15 + i * 0.14, 0.55, 90, WARM, r=14)
    finish(d, seed, out)


def scene_before(seed, out="living-before.webp"):
    """낡고 어두운 공간: 칙칙한 색, 얼룩, 벗겨진 벽, 어긋난 가구."""
    wall, floor = (176, 168, 150), (140, 118, 92)
    room = Room(back=(0.27, 0.21, 0.73, 0.71))
    d = new_scene(room, wall, floor, (196, 190, 176), side_k=0.84)
    rng = np.random.default_rng(seed)
    g = ImageDraw.Draw(d["img"])
    for _ in range(14):                                                    # 벽 얼룩·균열
        u, v = rng.uniform(0.05, 0.95), rng.uniform(0.1, 0.95)
        x, y = room.p(u, v, 1)
        pts = [(x, y)]
        for _ in range(5):
            x += rng.uniform(-14, 14)
            y += rng.uniform(6, 26)
            pts.append((x, y))
        g.line(pts, fill=(112, 104, 90), width=2)
    add_layer(d["img"], lambda gg: [gg.ellipse([x0, y0, x0 + rw, y0 + rh], fill=(92, 84, 66, 80)) for x0, y0, rw, rh in
              [(rng.uniform(400, 1100), rng.uniform(180, 520), rng.uniform(80, 260), rng.uniform(60, 180)) for _ in range(6)]], blur=22)
    light_slit(d, room, 0.78, 0.82, 0.05, 0.85, strength=0.35, floor_cast=False)
    box(room, d, 0.10, 0.46, 0.60, 0.78, 0.40, (98, 84, 70))               # 낡은 소파
    box(room, d, 0.08, 0.24, 0.74, 0.80, 0.58, (88, 76, 62), shadow=False)
    box(room, d, 0.58, 0.82, 0.30, 0.50, 0.30, (72, 64, 54))
    box(room, d, 0.88, 0.97, 0.55, 0.75, 0.70, (120, 108, 92))
    finish(d, seed, out, worn=True, dark=0.10)


def main():
    os.makedirs(OUT, exist_ok=True)
    scene_before(101, "living-before.webp")
    scene_living(102, out="living-after.webp")
    scene_kitchen(103, out="kitchen-seongsu.webp")
    scene_bedroom(104, out="bedroom-seongsu.webp")
    scene_bedroom(105, wall=(228, 222, 214), bed=(190, 176, 160), out="bedroom-mapo.webp", slit=(0.78, 0.82))
    scene_kitchen(106, island=(0.34, 0.70), cab=(214, 206, 194), out="kitchen-mapo.webp")
    scene_living(107, flip=True, wall=(240, 236, 230), floor=(200, 184, 160), sofa=(110, 104, 96), slit=(0.40, 0.44), out="living-bundang.webp")
    scene_kitchen(108, island=(0.26, 0.66), cab=(88, 80, 72), wall=(226, 220, 210), out="kitchen-bundang.webp")
    scene_cafe(109, out="cafe-yeonnam.webp")
    scene_cafe(110, out="cafe-yeonnam-night.webp", dark_wall=True)
    scene_showroom(111, out="showroom-gangnam.webp")
    scene_office(112, out="office-pangyo.webp")


if __name__ == "__main__":
    main()
