'use client';
import { motion, useScroll, useSpring } from 'framer-motion';

export function ScrollProgress() {
  const { scrollYProgress } = useScroll();
  const scaleX = useSpring(scrollYProgress, {
    stiffness: 200,
    damping: 30,
    restDelta: 0.001
  });

  return (
    <motion.div
      data-testid="scroll-progress"
      style={{ scaleX }}
      className="fixed top-0 left-0 right-0 h-[3px] bg-gradient-to-r from-teal-500 via-cyan-400 to-emerald-400 origin-left z-[1001] shadow-[0_0_8px_rgba(20,184,166,0.8)]"
    />
  );
}
