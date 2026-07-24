import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import LandingPage from './LandingPage/LandingPage';
import LoadingScreen from './LoadingScreen/LoadingScreen';
import Toast from './Toast/Toast';
import { useGoogleAuth } from '../context/GoogleAuthContext';

export default function OnboardingFlow({ children }) {
  const { user, authStatus, toast, clearToast, loginWithGoogle } = useGoogleAuth();
  const [currentStep, setCurrentStep] = useState('landing');

  // React to authStatus changes
  useEffect(() => {
    if (authStatus === 'authenticated' && user) {
      // If returning session on mount, skip directly to dashboard or short loading
      if (currentStep === 'landing') {
        setCurrentStep('loading');
      }
    } else if (authStatus === 'loading_workspace') {
      setCurrentStep('loading');
    } else if (authStatus === 'idle') {
      setCurrentStep('landing');
    }
  }, [authStatus, user, currentStep]);

  const handleLoadingComplete = () => {
    setCurrentStep('dashboard');
  };

  const pageTransition = {
    initial: { opacity: 0 },
    animate: { opacity: 1 },
    exit: { opacity: 0 },
    transition: { duration: 0.4, ease: [0.16, 1, 0.3, 1] }
  };

  const displayName = user?.firstName || user?.displayName || 'Arun';

  return (
    <>
      <AnimatePresence mode="wait">
        {currentStep === 'landing' && (
          <motion.div key="landing-step" style={{ width: '100%' }} {...pageTransition}>
            <LandingPage onAuthenticate={loginWithGoogle} isAuthenticating={authStatus === 'signing_in' || authStatus === 'authenticating'} />
          </motion.div>
        )}

        {currentStep === 'loading' && (
          <motion.div key="loading-step" style={{ width: '100%' }} {...pageTransition}>
            <LoadingScreen userName={displayName} onComplete={handleLoadingComplete} />
          </motion.div>
        )}

        {currentStep === 'dashboard' && (
          <motion.div key="dashboard-step" style={{ width: '100%', height: '100%' }} {...pageTransition}>
            {children}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Global Toast for Errors */}
      {toast && (
        <div className="toast-container">
          <Toast
            type={toast.type}
            title={toast.title}
            message={toast.message}
            onRetry={toast.onRetry}
            onClose={clearToast}
          />
        </div>
      )}
    </>
  );
}
