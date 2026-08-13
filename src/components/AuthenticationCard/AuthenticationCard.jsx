import GoogleButton from '../GoogleButton/GoogleButton';
import { useGoogleAuth } from '../../context/GoogleAuthContext';
import './AuthenticationCard.css';

export default function AuthenticationCard({ onGoogleLogin, isAuthenticating = false }) {
  const { authStatus, loginWithGoogle, processDemoLogin } = useGoogleAuth();

  const handleGoogleClick = () => {
    if (onGoogleLogin) {
      onGoogleLogin();
    } else {
      loginWithGoogle();
    }
  };

  const isBusy = isAuthenticating || authStatus === 'signing_in' || authStatus === 'authenticating';

  return (
    <div className="auth-card">
      <div className="auth-card__content">
        <GoogleButton
          label={isBusy ? 'Connecting to Google...' : 'Continue with Google'}
          onClick={handleGoogleClick}
          disabled={isBusy}
        />

        <button
          type="button"
          className="btn-white-outline demo-login-btn"
          onClick={processDemoLogin}
          disabled={isBusy}
          style={{ width: '100%', justifyContent: 'center', marginTop: '0.8rem', fontSize: '0.86rem' }}
        >
          Developer Demo Login (Bypass)
        </button>

        <div className="auth-card__divider">
          <span>or</span>
        </div>

        <div className="auth-card__secondary">
          <span className="auth-card__secondary-text">New to Vaultonaut?</span>
          <button
            type="button"
            className="auth-card__signup-link"
            onClick={handleGoogleClick}
            disabled={isBusy}
          >
            Create an Account with Google
          </button>
        </div>
      </div>
    </div>
  );
}
