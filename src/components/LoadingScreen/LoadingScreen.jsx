import { useState, useEffect, useMemo } from 'react';
import { motion } from 'framer-motion';
import GradientLogo from '../GradientLogo/GradientLogo';
import ThreeBodyLoader from '../Loader/ThreeBodyLoader';
import AnimatedProgress from '../AnimatedProgress/AnimatedProgress';
import TextType from '../TextType/TextType';
import Lightfall from '../Lightfall/Lightfall';
import './LoadingScreen.css';

const PROGRESS_STEPS = [0, 12, 28, 46, 63, 81, 100];

export default function LoadingScreen({ userName = 'Alex', onComplete }) {
  const [stepIndex, setStepIndex] = useState(0);
  const [currentProgress, setCurrentProgress] = useState(0);

  const sentences = useMemo(
    () => [
      `Welcome ${userName} to the Vault!`,
      `Initializing AI memory for ${userName}...`,
      `Preparing your knowledge vault...`,
      `Your workspace is ready!`
    ],
    [userName]
  );

  useEffect(() => {
    // Timer interval for progressing through percentage steps (0 to 100) over ~3 seconds
    const intervalTime = 420; // ms per step
    const timer = setInterval(() => {
      setStepIndex((prev) => {
        const next = prev + 1;
        if (next < PROGRESS_STEPS.length) {
          setCurrentProgress(PROGRESS_STEPS[next]);
          return next;
        } else {
          clearInterval(timer);
          // Trigger completion when reaching 100%
          setTimeout(() => {
            if (onComplete) onComplete();
          }, 400);
          return prev;
        }
      });
    }, intervalTime);

    return () => clearInterval(timer);
  }, [onComplete]);

  return (
    <div className="loading-screen">
      {/* Lightfall Animated Background Shader */}
      <Lightfall
        colors={['#A6C8FF', '#5227FF', '#FF9FFC', '#7C3AED']}
        backgroundColor="#080c1d"
        speed={0.8}
        streakCount={8}
        streakWidth={1}
        streakLength={1.2}
        glow={1.2}
        density={0.7}
        twinkle={1}
        zoom={2.2}
        backgroundGlow={1}
        opacity={1}
        mouseInteraction={true}
        mouseStrength={1}
        mouseRadius={0.6}
      />

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
          <ThreeBodyLoader size={46} color="#A855F7" speed="0.8s" />
        </motion.div>

        {/* React Bits TextType Component for Typing Effect */}
        <div className="loading-screen__text-wrapper">
          <TextType
            text={sentences}
            typingSpeed={45}
            pauseDuration={1000}
            deletingSpeed={25}
            loop={true}
            showCursor={true}
            cursorCharacter="|"
            cursorBlinkDuration={0.4}
            className="loading-screen__typing-text"
          />
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
