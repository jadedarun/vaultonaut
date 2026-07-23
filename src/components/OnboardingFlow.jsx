import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import LandingPage from './LandingPage/LandingPage';
import LoadingScreen from './LoadingScreen/LoadingScreen';

export default function OnboardingFlow({ children, initialStep = 'landing' }) {
  const [currentStep, setCurrentStep] = useState(initialStep);
  const [isSignUp, setIsSignUp] = useState(false);

  const handleAuthenticate = (isNewUser = false) => {
    setIsSignUp(isNewUser);
    // Smooth transition to loading screen
    setCurrentStep('loading');
  };

  const handleLoadingComplete = () => {
    // Automatically transition to dashboard upon reaching 100%
    setCurrentStep('dashboard');
  };

  const pageTransition = {
    initial: { opacity: 0 },
    animate: { opacity: 1 },
    exit: { opacity: 0 },
    transition: { duration: 0.4, ease: [0.16, 1, 0.3, 1] }
  };

  return (
    <AnimatePresence mode="wait">
      {currentStep === 'landing' && (
        <motion.div key="landing-step" style={{ width: '100%' }} {...pageTransition}>
          <LandingPage onAuthenticate={handleAuthenticate} />
        </motion.div>
      )}

      {currentStep === 'loading' && (
        <motion.div key="loading-step" style={{ width: '100%' }} {...pageTransition}>
          <LoadingScreen onComplete={handleLoadingComplete} />
        </motion.div>
      )}

      {currentStep === 'dashboard' && (
        <motion.div key="dashboard-step" style={{ width: '100%', height: '100%' }} {...pageTransition}>
          {children}
        </motion.div>
      )}
    </AnimatePresence>
  );
}
