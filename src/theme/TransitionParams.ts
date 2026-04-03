
/*
 * Copyright © 2026 DCS Corporation, 6909 Metro Park Drive Suite 500, Alexandria, VA 22310.
 * See the LICENSE file for rights & permissions.
 */
import { MotionProps } from "motion/react";

type TransitionResult = Omit<MotionProps, "style">;

export const TransitionParams = ({delay, endOpacity}: {delay?: number, endOpacity?: number}): TransitionResult => ({
  animate: {
    y: 0,
    opacity: endOpacity ?? 1
  },
  initial: {
    opacity: 0,
    y: 100
  },
  exit: {
    opacity: 0,
    y: -500
  },
  transition: {
    ease: "easeOut",
    duration: 0.5,
    delay: delay ?? 0
  }
});