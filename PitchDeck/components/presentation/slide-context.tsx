"use client";

import { createContext, useContext } from "react";

export type SlideState = {
  /** Whether this slide is currently on screen */
  active: boolean;
  /** Zero-based position of this slide in the deck */
  index: number;
};

export const SlideContext = createContext<SlideState>({
  active: false,
  index: 0,
});

export function useSlide(): SlideState {
  return useContext(SlideContext);
}
