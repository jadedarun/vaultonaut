import { motion } from 'framer-motion';
import GradientLogo from '../GradientLogo/GradientLogo';
import AuthenticationCard from '../AuthenticationCard/AuthenticationCard';
import './LandingPage.css';

export default function LandingPage({ onAuthenticate, isAuthenticating }) {
  return (
    <div className="landing-page">
      <main className="landing-page__container">
        {/* Centered Branding Section */}
        <motion.div
          className="landing-page__header"
          initial={{ opacity: 0, y: -15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
        >
          <div className="landing-page__logo-wrapper">
            <GradientLogo textSize="text-4xl" iconSize={38} />
          </div>

          <div className="landing-page__subtitle-group">
            <h2 className="landing-page__title">Your AI-Powered Second Brain</h2>
            <p className="landing-page__tagline">
              <span>Store.</span>
              <span className="dot">•</span>
              <span>Search.</span>
              <span className="dot">•</span>
              <span>Study.</span>
              <span className="dot">•</span>
              <span>Remember.</span>
            </p>
          </div>
        </motion.div>

        {/* Centered Authentication Section */}
        <motion.div
          className="landing-page__auth-wrapper"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.15, ease: [0.16, 1, 0.3, 1] }}
        >
          <AuthenticationCard
            onGoogleLogin={() => onAuthenticate(false)}
            onGoogleSignUp={() => onAuthenticate(true)}
            isAuthenticating={isAuthenticating}
          />
        </motion.div>
      </main>

      <footer className="landing-page__footer">
        <p>Private & Local-First AI Knowledge Vault</p>
      </footer>
    </div>
  );
}
