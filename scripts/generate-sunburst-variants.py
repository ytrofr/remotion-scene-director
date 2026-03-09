#!/usr/bin/env python3
"""
Generate sunburst variants from click-sunburst-soft.json (8-ray base).

Variants:
  - click-sunburst-soft-sm.json   — 8 rays, 50% length
  - click-sunburst-soft-xs.json   — 8 rays, 30% length
  - click-sunburst-soft-4.json    — 4 rays (cardinal), full length
  - click-sunburst-soft-4-sm.json — 4 rays (cardinal), 50% length
"""

import json
import copy
import os

SCRIPT_DIR = os.path.dirname(os.path.abspath(__file__))
PROJECT_ROOT = os.path.dirname(SCRIPT_DIR)
LOTTIE_DIR = os.path.join(PROJECT_ROOT, "public", "lottie")

SOURCE = os.path.join(LOTTIE_DIR, "click-sunburst-soft.json")

# Center of the sunburst (200x200 canvas)
CENTER = [100.0, 100.0]


def scale_rays(data, factor):
    """Scale ray endpoints toward their start point by factor (0-1)."""
    result = copy.deepcopy(data)
    for layer in result["layers"]:
        for shape_group in layer.get("shapes", []):
            for item in shape_group.get("it", []):
                if item.get("ty") == "sh":
                    verts = item["ks"]["k"]["v"]
                    if len(verts) == 2:
                        start = verts[0]
                        end = verts[1]
                        # Scale endpoint toward start
                        verts[1] = [
                            start[0] + (end[0] - start[0]) * factor,
                            start[1] + (end[1] - start[1]) * factor,
                        ]
    return result


def keep_rays(data, indices):
    """Keep only ray layers at given indices (0-based)."""
    result = copy.deepcopy(data)
    result["layers"] = [
        layer for i, layer in enumerate(data["layers"])
        if i in indices
    ]
    # Re-index
    for i, layer in enumerate(result["layers"]):
        layer["ind"] = i
        layer["nm"] = f"ray-{i}"
        for sg in layer.get("shapes", []):
            sg["nm"] = f"ray-group-{i}"
    return result


VARIANTS = {
    "click-sunburst-soft-sm": {"scale": 0.5},
    "click-sunburst-soft-xs": {"scale": 0.3},
    "click-sunburst-soft-4": {"rays": [0, 2, 4, 6], "scale": 1.0},  # cardinal: up, right, down, left
    "click-sunburst-soft-4-sm": {"rays": [0, 2, 4, 6], "scale": 0.5},
}


def main():
    with open(SOURCE) as f:
        base = json.load(f)

    count = 0
    for name, opts in VARIANTS.items():
        data = copy.deepcopy(base)

        # Filter rays if specified
        if "rays" in opts:
            data = keep_rays(data, opts["rays"])

        # Scale ray length
        if opts.get("scale", 1.0) != 1.0:
            data = scale_rays(data, opts["scale"])

        data["nm"] = name

        out_path = os.path.join(LOTTIE_DIR, f"{name}.json")
        with open(out_path, "w") as f:
            json.dump(data, f, separators=(",", ":"))

        print(f"  {name}.json")
        count += 1

    print(f"\nGenerated {count} sunburst variants in {LOTTIE_DIR}")


if __name__ == "__main__":
    main()
