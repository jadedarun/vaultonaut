import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import LandingPage from './LandingPage/LandingPage';
import LoadingScreen from './LoadingScreen/LoadingScreen';

export default function OnboardingFlow({ children, initialStep = 'landing' }) {
  const [currentStep, setCurrentStep] = useState(initialStep);
  const [userName, setUserName] = useState('Alex');

  const handleAuthenticate = (name = 'Alex') => {
    setUserName(name || 'Alex');
    setCurrentStep('loading');
  };

  const handleLoadingComplete = () => {
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
          <LoadingScreen userName={userName} onComplete={handleLoadingComplete} />
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
