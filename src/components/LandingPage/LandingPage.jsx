import { motion } from 'framer-motion';
import GradientLogo from '../GradientLogo/GradientLogo';
import AuthenticationCard from '../AuthenticationCard/AuthenticationCard';
import Lightfall from '../Lightfall/Lightfall';
import './LandingPage.css';

export default function LandingPage({ onAuthenticate, isAuthenticating }) {
  return (
    <div className="landing-page">
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
        <p>Private & Local-First AI Knowledge Vault</p>
      </footer>
    </div>
  );
}
