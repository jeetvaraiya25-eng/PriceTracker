import { useReducedMotion } from "framer-motion";

export const easeOut = [0.22, 1, 0.36, 1];

export const fadeInUp = {
  hidden: { opacity: 0, y: 12 },
  show: { opacity: 1, y: 0, transition: { duration: 0.3, ease: easeOut } },
};

export const scaleIn = {
  hidden: { opacity: 0, scale: 0.95 },
  show: { opacity: 1, scale: 1, transition: { duration: 0.25, ease: easeOut } },
};

export const staggerContainer = {
  hidden: {},
  show: { transition: { staggerChildren: 0.04 } },
};

export const slideLeft = {
  hidden: { opacity: 0, x: -12 },
  show: { opacity: 1, x: 0, transition: { duration: 0.28, ease: easeOut } },
};

export function motionSafe(reduced, variants) {
  if (!reduced) return variants;
  return {
    hidden: { opacity: 1, x: 0, y: 0, scale: 1 },
    show: { opacity: 1, x: 0, y: 0, scale: 1, transition: { duration: 0 } },
  };
}

export function useMotionSafe(variants) {
  const reduced = useReducedMotion();
  return motionSafe(reduced, variants);
}
