import { useState, useEffect, useMemo } from 'react';
import { motion } from 'framer-motion';
import GradientLogo from '../GradientLogo/GradientLogo';
import ThreeBodyLoader from '../Loader/ThreeBodyLoader';
import AnimatedProgress from '../AnimatedProgress/AnimatedProgress';
import TextType from '../TextType/TextType';
import Prism from '../Prism/Prism';
import './LoadingScreen.css';

const PROGRESS_STEPS = [0, 15, 32, 54, 75, 90, 100];

export default function LoadingScreen({ userName = 'Arun', onComplete }) {
  const [stepIndex, setStepIndex] = useState(0);
  const [currentProgress, setCurrentProgress] = useState(0);

  // Extract first name only
  const firstName = useMemo(() => {
    if (!userName) return 'Arun';
    return userName.trim().split(' ')[0];
  }, [userName]);

  const loadingSentences = useMemo(
    () => [
      "Preparing your AI workspace...",
      "Loading your Knowledge Vault...",
      "Building semantic memory...",
      "Connecting your documents...",
      "Almost ready..."
    ],
    []
  );

  useEffect(() => {
    // Progress animation from 0% to 100% over ~3 seconds
    const intervalTime = 400; // ms per step
    const timer = setInterval(() => {
      setStepIndex((prev) => {
        const next = prev + 1;
        if (next < PROGRESS_STEPS.length) {
          setCurrentProgress(PROGRESS_STEPS[next]);
          return next;
        } else {
          clearInterval(timer);
          setTimeout(() => {
            if (onComplete) onComplete();
          }, 450);
          return prev;
        }
      });
    }, intervalTime);

    return () => clearInterval(timer);
  }, [onComplete]);

  return (
    <div className="loading-screen">
      {/* Prism Animated WebGL Background Shader */}
      <Prism
        animationType="rotate"
        timeScale={0.5}
        height={3.5}
        baseWidth={5.5}
        scale={3.6}
        hueShift={0}
        colorFrequency={1}
        noise={0.3}
        glow={1.2}
        bloom={1.2}
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
          <div style={{ color: '#f4f4f5', fontSize: '1.25rem', fontWeight: 600, marginTop: '0.6rem' }}>
            Welcome back, {firstName}
          </div>
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
            text={loadingSentences}
            typingSpeed={65}
            deletingSpeed={25}
            pauseDuration={1400}
            showCursor={true}
            cursorCharacter="|"
            loop={true}
            variableSpeed={{ min: 55, max: 80 }}
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
