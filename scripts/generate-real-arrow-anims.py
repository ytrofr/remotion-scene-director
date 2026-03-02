#!/usr/bin/env python3
"""
Generate 26 Real Arrow cursor animation Lottie files.
13 animation types x 2 bases (black filled + outline 5px).

Bases: cursor-real-black.json, cursor-real-outline-5px.json
Sunbursts: click-sunburst.json (12-ray), click-sunburst-soft.json (8-ray)

Output: public/lottie/cursor-real-anim-{base}-{type}.json
"""

import json
import copy
import os

SCRIPT_DIR = os.path.dirname(os.path.abspath(__file__))
PROJECT_ROOT = os.path.dirname(SCRIPT_DIR)
LOTTIE_DIR = os.path.join(PROJECT_ROOT, "public", "lottie")

BASES = {
    "black": os.path.join(LOTTIE_DIR, "cursor-real-black.json"),
    "outline": os.path.join(LOTTIE_DIR, "cursor-real-outline-5px.json"),
}

BASE_SCALE = 133.9  # Default scale from source files
REST_POS = [103.7, 118.1, 0]  # Default position from source files

# Tip of the pointer on the 200x200 canvas (computed from shape geometry)
# Shape tip vertex [-33.848, -36.177] + group offset [245.619, 279.694]
# -> layer space [211.771, 243.517] -> canvas via anchor/pos/scale = [58.4, 69.7]
TIP_POS = [58.4, 69.7, 0]


# ── Easing helpers (smooth ease-in-out) ─────────────────────
#
# Using cubic-bezier(0.33, 0, 0.67, 1) — standard smooth ease-in-out.
# The previous (0.4/0.6, 1/0) values were too snappy.

def ease_scale(t, val):
    """Scale easing — single-value arrays for i/o."""
    return {"t": t, "s": val, "i": {"x": [0.33], "y": [1]}, "o": {"x": [0.67], "y": [0]}}

def ease_scale_end(t, val):
    """Final scale keyframe (no easing)."""
    return {"t": t, "s": val}

def ease_pos(t, val):
    """Position easing — 3-value arrays for XYZ."""
    return {"t": t, "s": val, "i": {"x": [0.33, 0.33, 0.33], "y": [1, 1, 1]}, "o": {"x": [0.67, 0.67, 0.67], "y": [0, 0, 0]}}

def ease_pos_end(t, val):
    """Final position keyframe."""
    return {"t": t, "s": val}

def ease_rot(t, val):
    """Rotation easing — single-value arrays."""
    return {"t": t, "s": val, "i": {"x": [0.33], "y": [1]}, "o": {"x": [0.67], "y": [0]}}

def ease_rot_end(t, val):
    """Final rotation keyframe."""
    return {"t": t, "s": val}

def ease_opacity(t, val):
    """Opacity easing."""
    return {"t": t, "s": val, "i": {"x": [0.33], "y": [1]}, "o": {"x": [0.67], "y": [0]}}

def ease_opacity_end(t, val):
    """Final opacity keyframe."""
    return {"t": t, "s": val}


# ── Animation type functions ────────────────────────────────
# All frame counts tuned for 60fps / 90-frame duration.
# Wider keyframe spacing = smoother motion.

def anim_click():
    """Scale pulse: rest -> squeeze -> rest (gentle, 40 frames)."""
    S = BASE_SCALE
    return {
        "s": {"a": 1, "k": [
            ease_scale(0, [S, S, 100]),
            ease_scale(16, [118, 118, 100]),
            ease_scale_end(40, [S, S, 100]),
        ]},
    }

def anim_dblclick():
    """Double scale pulse with breathing room between taps."""
    S = BASE_SCALE
    return {
        "s": {"a": 1, "k": [
            ease_scale(0, [S, S, 100]),
            ease_scale(12, [118, 118, 100]),
            ease_scale(26, [S, S, 100]),
            ease_scale(38, [118, 118, 100]),
            ease_scale_end(54, [S, S, 100]),
        ]},
    }

def anim_slide():
    """Smooth horizontal oscillation (wider range, gentler curves)."""
    P = REST_POS
    return {
        "p": {"a": 1, "k": [
            ease_pos(0, [70, P[1], 0]),
            ease_pos(28, [140, P[1], 0]),
            ease_pos(56, [70, P[1], 0]),
            ease_pos(84, [140, P[1], 0]),
            ease_pos_end(89, P),
        ]},
    }

def anim_wobble():
    """Smooth damping rotation oscillation (wider frame gaps)."""
    return {
        "r": {"a": 1, "k": [
            ease_rot(0, [0]),
            ease_rot(13, [10]),
            ease_rot(28, [-10]),
            ease_rot(43, [6]),
            ease_rot(58, [-6]),
            ease_rot(73, [3]),
            ease_rot_end(85, [0]),
        ]},
    }

def anim_idle():
    """Gentle breathing scale (2 smooth cycles over 90 frames)."""
    S = BASE_SCALE
    S_LOW = 130
    return {
        "s": {"a": 1, "k": [
            ease_scale(0, [S, S, 100]),
            ease_scale(22, [S_LOW, S_LOW, 100]),
            ease_scale(44, [S, S, 100]),
            ease_scale(66, [S_LOW, S_LOW, 100]),
            ease_scale_end(89, [S, S, 100]),
        ]},
    }

def anim_drag():
    """Smooth vertical move + gentle scale grab/release."""
    S = BASE_SCALE
    P = REST_POS
    return {
        "p": {"a": 1, "k": [
            ease_pos(0, P),
            ease_pos(18, [P[0], 80, 0]),
            ease_pos(65, [P[0], 150, 0]),
            ease_pos_end(85, P),
        ]},
        "s": {"a": 1, "k": [
            ease_scale(0, [S, S, 100]),
            ease_scale(15, [122, 122, 100]),
            ease_scale(22, [S, S, 100]),
            ease_scale(60, [S, S, 100]),
            ease_scale(72, [122, 122, 100]),
            ease_scale_end(85, [S, S, 100]),
        ]},
    }

def anim_bounce():
    """Smooth vertical bounce with decreasing amplitude."""
    P = REST_POS
    return {
        "p": {"a": 1, "k": [
            ease_pos(0, P),
            ease_pos(15, [P[0], 65, 0]),
            ease_pos(30, P),
            ease_pos(42, [P[0], 88, 0]),
            ease_pos(54, P),
            ease_pos(64, [P[0], 107, 0]),
            ease_pos_end(74, P),
        ]},
    }

def anim_swish_slide():
    """Smooth horizontal slide + gentle tilt (wider spacing)."""
    P = REST_POS
    return {
        "p": {"a": 1, "k": [
            ease_pos(0, [40, P[1], 0]),
            ease_pos(28, [160, P[1], 0]),
            ease_pos(56, [40, P[1], 0]),
            ease_pos(84, [160, P[1], 0]),
            ease_pos_end(89, P),
        ]},
        "r": {"a": 1, "k": [
            ease_rot(0, [0]),
            ease_rot(14, [-6]),
            ease_rot(28, [0]),
            ease_rot(42, [6]),
            ease_rot(56, [0]),
            ease_rot(70, [-6]),
            ease_rot(84, [0]),
            ease_rot_end(89, [0]),
        ]},
    }

def anim_hover_pulse():
    """Scale + opacity breathing (2 smooth cycles)."""
    S = BASE_SCALE
    S_HI = 139
    return {
        "s": {"a": 1, "k": [
            ease_scale(0, [S, S, 100]),
            ease_scale(22, [S_HI, S_HI, 100]),
            ease_scale(44, [S, S, 100]),
            ease_scale(66, [S_HI, S_HI, 100]),
            ease_scale_end(89, [S, S, 100]),
        ]},
        "o": {"a": 1, "k": [
            ease_opacity(0, [100]),
            ease_opacity(22, [78]),
            ease_opacity(44, [100]),
            ease_opacity(66, [78]),
            ease_opacity_end(89, [100]),
        ]},
    }


# ── Multi-layer animation builders ─────────────────────────

def inject_animation(base_data, overrides):
    """Apply keyframe overrides to cursor layer's ks properties."""
    data = copy.deepcopy(base_data)
    layer = data["layers"][0]
    for prop, value in overrides.items():
        layer["ks"][prop] = value
    return data


def create_ghost_layers(data, count=3, opacities=None, delays=None, scales=None):
    """Create ghost trail copies of the cursor layer behind the main one."""
    if opacities is None:
        opacities = [55, 30, 12]
    if delays is None:
        delays = [4, 8, 12]
    if scales is None:
        scales = [129, 124, 119]

    cursor_layer = data["layers"][0]
    ghosts = []

    for i in range(count):
        ghost = copy.deepcopy(cursor_layer)
        ghost["nm"] = f"ghost-{i}"
        ghost["ind"] = 100 + i

        # Static opacity
        ghost["ks"]["o"] = {"a": 0, "k": opacities[i]}

        # Static scale (smaller)
        ghost["ks"]["s"] = {"a": 0, "k": [scales[i], scales[i], 100]}

        # Shift position keyframes by delay
        if ghost["ks"]["p"].get("a") == 1:
            shifted = []
            for kf in ghost["ks"]["p"]["k"]:
                kf_copy = copy.deepcopy(kf)
                kf_copy["t"] = kf_copy["t"] + delays[i]
                shifted.append(kf_copy)
            ghost["ks"]["p"]["k"] = shifted

        ghosts.append(ghost)

    # Cursor first (renders on top), ghosts behind
    data["layers"] = [cursor_layer] + ghosts
    return data


def create_dash_trail(data):
    """Add a dashed-line shape layer behind the cursor showing travel path."""
    P = REST_POS
    dash_layer = {
        "ddd": 0, "ind": 200, "ty": 4, "nm": "dash-trail", "sr": 1,
        "ks": {
            "o": {"a": 1, "k": [
                ease_opacity(0, [0]),
                ease_opacity(8, [70]),
                ease_opacity(45, [70]),
                ease_opacity_end(60, [0]),
            ]},
            "r": {"a": 0, "k": 0},
            "p": {"a": 0, "k": [0, 0, 0]},
            "a": {"a": 0, "k": [0, 0, 0]},
            "s": {"a": 0, "k": [100, 100, 100]},
        },
        "ao": 0,
        "shapes": [{
            "ty": "gr",
            "it": [
                {
                    "ty": "sh", "d": 1,
                    "ks": {"a": 0, "k": {
                        "i": [[0, 0], [0, 0]],
                        "o": [[0, 0], [0, 0]],
                        "v": [[40, P[1]], [160, P[1]]],
                        "c": False,
                    }},
                },
                {
                    "ty": "tm",
                    "s": {"a": 0, "k": 0},
                    "e": {"a": 1, "k": [
                        {"t": 0, "s": [0], "i": {"x": [0.33], "y": [1]}, "o": {"x": [0.67], "y": [0]}},
                        {"t": 25, "s": [100]},
                    ]},
                    "o": {"a": 0, "k": 0},
                },
                {
                    "ty": "st",
                    "c": {"a": 0, "k": [0, 0, 0, 1]},
                    "o": {"a": 0, "k": 100},
                    "w": {"a": 0, "k": 2},
                    "lc": 2, "lj": 1,
                    "d": [
                        {"n": "d", "nm": "dash", "v": {"a": 0, "k": 6}},
                        {"n": "g", "nm": "gap", "v": {"a": 0, "k": 4}},
                        {"n": "o", "nm": "offset", "v": {"a": 0, "k": 0}},
                    ],
                },
                {
                    "ty": "tr",
                    "p": {"a": 0, "k": [0, 0]},
                    "a": {"a": 0, "k": [0, 0]},
                    "s": {"a": 0, "k": [100, 100]},
                    "r": {"a": 0, "k": 0},
                    "o": {"a": 0, "k": 100},
                },
            ],
            "nm": "dash-group",
        }],
        "ip": 0, "op": 90, "st": 0,
    }
    # Cursor on top, dash trail behind
    data["layers"].append(dash_layer)
    return data


def get_cursor_color(data):
    """Extract the primary color from the cursor layer's fill or stroke."""
    layer = data["layers"][0]
    for shape_group in layer.get("shapes", []):
        for item in shape_group.get("it", []):
            # Prefer stroke color for outline cursors, fill for filled
            if item.get("ty") == "st":
                return item["c"]["k"][:3]  # [r, g, b]
            if item.get("ty") == "fl":
                c = item["c"]["k"][:3]
                # Skip white fills (outline cursor has white fill + black stroke)
                if c != [1, 1, 1]:
                    return c
    return [0, 0, 0]  # fallback to black


def merge_sunburst(data, sunburst_path):
    """Merge sunburst ray layers positioned at the cursor TIP, remapping 30fps -> 60fps."""
    with open(sunburst_path) as f:
        sunburst = json.load(f)

    # Match ray color to cursor color
    cursor_color = get_cursor_color(data)

    # Offset to move rays from center (100,100) to cursor tip
    tip_offset_x = TIP_POS[0] - 100  # -41.6
    tip_offset_y = TIP_POS[1] - 100  # -30.3

    for ray_layer in sunburst["layers"]:
        remapped = copy.deepcopy(ray_layer)
        remapped["ind"] = remapped["ind"] + 100  # Avoid index collision

        # Remap all keyframe t values: x2 (30fps -> 60fps)
        for prop_key in ["o", "r", "p", "a", "s"]:
            prop = remapped["ks"].get(prop_key, {})
            if prop.get("a") == 1:
                for kf in prop["k"]:
                    if "t" in kf:
                        kf["t"] = kf["t"] * 2

        # Remap trim path keyframes in shapes
        for shape_group in remapped.get("shapes", []):
            for item in shape_group.get("it", []):
                if item.get("ty") == "tm":
                    for sub_key in ["s", "e"]:
                        sub = item.get(sub_key, {})
                        if sub.get("a") == 1:
                            for kf in sub["k"]:
                                if "t" in kf:
                                    kf["t"] = kf["t"] * 2

        # Offset ray shape vertices to cursor tip position
        # and recolor strokes to match cursor
        for shape_group in remapped.get("shapes", []):
            for item in shape_group.get("it", []):
                if item.get("ty") == "sh":
                    verts = item["ks"]["k"]["v"]
                    for v in verts:
                        v[0] += tip_offset_x
                        v[1] += tip_offset_y
                if item.get("ty") == "st":
                    item["c"]["k"] = cursor_color + [1]  # [r, g, b, a]

        # Set opacity to 90 for softer overlay
        if remapped["ks"]["o"].get("a") == 1:
            for kf in remapped["ks"]["o"]["k"]:
                if "s" in kf and kf["s"] == [100]:
                    kf["s"] = [90]
        remapped["op"] = 90  # Match animation duration

        # Append behind cursor (cursor = layers[0])
        data["layers"].append(remapped)

    return data


# ── Main generator ──────────────────────────────────────────

ANIMATION_TYPES = {
    "click": anim_click,
    "dblclick": anim_dblclick,
    "slide": anim_slide,
    "wobble": anim_wobble,
    "idle": anim_idle,
    "drag": anim_drag,
    "bounce": anim_bounce,
    "swish-trail": anim_slide,      # Uses slide position + ghost layers
    "swish-dash": anim_slide,       # Uses slide position + dash trail
    "swish-slide": anim_swish_slide,
    "hover-pulse": anim_hover_pulse,
    "click-burst": anim_click,       # Uses click scale + sunburst
    "click-burst-soft": anim_click,  # Uses click scale + soft sunburst
}


def generate_all():
    count = 0
    sunburst_path = os.path.join(LOTTIE_DIR, "click-sunburst.json")
    sunburst_soft_path = os.path.join(LOTTIE_DIR, "click-sunburst-soft.json")

    for base_name, base_path in BASES.items():
        with open(base_path) as f:
            base_data = json.load(f)

        for anim_type, anim_fn in ANIMATION_TYPES.items():
            overrides = anim_fn()
            data = inject_animation(base_data, overrides)

            # Set metadata — use "anim" prefix to avoid collision with static variants
            filename = f"cursor-real-anim-{base_name}-{anim_type}"
            data["nm"] = filename
            data["fr"] = 60
            data["ip"] = 0
            data["op"] = 90

            # Apply multi-layer effects
            if anim_type == "swish-trail":
                create_ghost_layers(data)
            elif anim_type == "swish-dash":
                create_dash_trail(data)
            elif anim_type == "click-burst":
                merge_sunburst(data, sunburst_path)
            elif anim_type == "click-burst-soft":
                merge_sunburst(data, sunburst_soft_path)

            # Update layer op to match animation
            for layer in data["layers"]:
                layer["op"] = 90

            out_path = os.path.join(LOTTIE_DIR, f"{filename}.json")
            with open(out_path, "w") as f:
                json.dump(data, f, separators=(",", ":"))

            print(f"  {filename}.json")
            count += 1

    print(f"\nGenerated {count} files in {LOTTIE_DIR}")


if __name__ == "__main__":
    generate_all()
