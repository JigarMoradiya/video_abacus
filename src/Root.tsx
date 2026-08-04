import React from "react";
import { Composition } from "remotion";
import { REELS } from "./reels";
import { FPS, W, H } from "./data/tokens";

export const RemotionRoot: React.FC = () => (
  <>
    {REELS.map((r) => (
      <Composition
        key={r.id}
        id={r.id}
        component={r.component}
        durationInFrames={r.durationInFrames}
        fps={FPS}
        width={r.width ?? W}
        height={r.height ?? H}
      />
    ))}
  </>
);
