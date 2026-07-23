import { motion } from 'framer-motion';
import GradientLogo from '../GradientLogo/GradientLogo';
import AuthenticationCard from '../AuthenticationCard/AuthenticationCard';
import Prism from '../Prism/Prism';
import './LandingPage.css';

export default function LandingPage({ onAuthenticate, isAuthenticating }) {
  return (
    <div className="landing-page">
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
            onGoogleLogin={(name) => onAuthenticate(name, false)}
            onGoogleSignUp={(name) => onAuthenticate(name, true)}
            isAuthenticating={isAuthenticating}
          />
        </motion.div>
      </main>

      <footer className="landing-page__footer">
        <span className="landing-page__highlight-badge">
          Private & Local-First AI Knowledge Vault
        </span>
      </footer>
    </div>
  );
}
