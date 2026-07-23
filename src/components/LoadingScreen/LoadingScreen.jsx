import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import GradientLogo from '../GradientLogo/GradientLogo';
import ThreeBodyLoader from '../Loader/ThreeBodyLoader';
import AnimatedProgress from '../AnimatedProgress/AnimatedProgress';
import './LoadingScreen.css';

const LOADING_MESSAGES = [
  'Preparing your workspace...',
  'Loading your knowledge vault...',
  'Building your AI memory...',
  'Almost ready...'
];

const PROGRESS_STEPS = [0, 12, 28, 46, 63, 81, 100];

export default function LoadingScreen({ onComplete }) {
  const [stepIndex, setStepIndex] = useState(0);
  const [currentProgress, setCurrentProgress] = useState(0);
  const [messageIndex, setMessageIndex] = useState(0);

  useEffect(() => {
    // Timer interval for progressing through percentage steps (0 to 100) over ~2.8 seconds
    const intervalTime = 380; // ms per step
    const timer = setInterval(() => {
      setStepIndex((prev) => {
        const next = prev + 1;
        if (next < PROGRESS_STEPS.length) {
          setCurrentProgress(PROGRESS_STEPS[next]);
          // Cycle loading message every ~2 steps
          if (next % 2 === 0 && Math.floor(next / 2) < LOADING_MESSAGES.length) {
            setMessageIndex(Math.floor(next / 2));
          }
          return next;
        } else {
          clearInterval(timer);
          // Trigger completion when reaching 100%
          setTimeout(() => {
            if (onComplete) onComplete();
          }, 350);
          return prev;
        }
      });
    }, intervalTime);

    return () => clearInterval(timer);
  }, [onComplete]);

  return (
    <div className="loading-screen">
      <div className="loading-screen__container">
        {/* Branding Above Loader */}
        <motion.div
          className="loading-screen__branding"
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.4 }}
        >
          <GradientLogo textSize="text-3xl" iconSize={32} />
        </motion.div>

        {/* Three Body Loader */}
        <motion.div
          className="loading-screen__loader-wrapper"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.1 }}
        >
          <ThreeBodyLoader size={46} color="#7C3AED" speed="0.8s" />
        </motion.div>

        {/* Rotating Loading Text */}
        <div className="loading-screen__text-wrapper">
          <AnimatePresence mode="wait">
            <motion.p
              key={messageIndex}
              className="loading-screen__message"
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -6 }}
              transition={{ duration: 0.35 }}
            >
              {LOADING_MESSAGES[messageIndex]}
            </motion.p>
          </AnimatePresence>
        </div>

        {/* Animated Progress percentage and purple bar */}
        <motion.div
          className="loading-screen__progress-wrapper"
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.2 }}
        >
          <AnimatedProgress progress={currentProgress} />
        </motion.div>
      </div>
    </div>
  );
}
