import GoogleButton from '../GoogleButton/GoogleButton';
import './AuthenticationCard.css';

export default function AuthenticationCard({ onGoogleLogin, onGoogleSignUp, isAuthenticating = false }) {
  return (
    <div className="auth-card">
      <div className="auth-card__content">
        <GoogleButton
          label="Continue with Google"
          onClick={() => onGoogleLogin(false)}
          disabled={isAuthenticating}
        />

        <div className="auth-card__divider">
          <span>or</span>
        </div>

        <div className="auth-card__secondary">
          <span className="auth-card__secondary-text">New to Vaultonaut?</span>
          <button
            type="button"
            className="auth-card__signup-link"
            onClick={() => onGoogleSignUp(true)}
            disabled={isAuthenticating}
          >
            Create an Account
          </button>
        </div>
      </div>
    </div>
  );
}
