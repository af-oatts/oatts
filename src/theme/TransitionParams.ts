import { AnimationProps } from "motion/react";

export const TransitionParams: ({delay, endOpacity}: {delay?: number, endOpacity?: number}) => AnimationProps = ({delay, endOpacity}) => ({
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