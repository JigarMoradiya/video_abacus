// Audit helper: when a still is rendered with inputProps {hideText: true} (tools/phrase_stills.mjs --notext)
// every SVG <text> and every HTML text span turns transparent, so tools/contrast_audit.py can diff the
// two renders to find exactly which pixels are text and what sits behind them. Renders nothing otherwise.
import React from "react";
import { getInputProps } from "remotion";

export const HideTextStyle: React.FC = () => {
  const hide = Boolean((getInputProps() as { hideText?: boolean }).hideText);
  if (!hide) return null;
  return <style>{`text, tspan { fill: transparent !important; stroke: none !important; } span { color: transparent !important; } `}</style>;
};
