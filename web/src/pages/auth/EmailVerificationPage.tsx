/**
 * EmailVerificationPage Component
 * 
 * Handles email verification from deep links with uid and token parameters
 */

import React, { useState, useEffect, useCallback } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { toast } from 'react-toastify';

import AuthenticatedApiService from '../../services/AuthenticatedApiService';

interface VerificationResult {
  verified: boolean;
  alreadyVerified: boolean;
  expired: boolean;
  message: string;
  isResent: boolean;
}

const apiService = AuthenticatedApiService.getInstance();

const EmailVerificationPage: React.FC = () => {
  const { t, i18n } = useTranslation();
  const [searchParams] = useSearchParams();
  const [isLoading, setIsLoading] = useState(false);
  const [isResending, setIsResending] = useState(false);
  const [verificationResult, setVerificationResult] = useState<VerificationResult | null>(null);

  // Get uid and token from URL search params
  const uid = searchParams.get('uid');
  const token = searchParams.get('token');

  const verifyEmailToken = useCallback(async () => {
    if (!uid || !token) return;

    try {
      setIsLoading(true);

      const selected_language = i18n.language;
      
      const response = await apiService.get(`/accounts/verify-email/?uid=${uid}&token=${token}&selected_language=${selected_language}`);
      
      if (response.status === 200) {
        const message = response.data.message;
        const isAlreadyVerified = !!response.data.already_verified;
        
        setVerificationResult({
          verified: true,
          alreadyVerified: isAlreadyVerified,
          expired: false,
          message: message,
          isResent: false,
        });

        toast.success(message);
      }
    } catch (error: any) {
      console.error('Email verification error:', error);
      
      let message = t('auth:emailVerification.errorMessage');
      let expired = false;
      let new_verification_email_sent = false;

      if (error?.response?.status === 400) {
        // Status 400 could be expired token or invalid parameters
        if (error?.response?.data?.message) {
          message = error.response.data.message;
          // Only check for expired if we have a message, but don't rely on language
          // The backend returns 400 for both expired and invalid tokens
          // We'll assume expired if it's a 400 with a message (safer UX)
          expired = !!error.response.data.expired;
          new_verification_email_sent = !!error.response.data.new_verification_email_sent;
        } else {
          message = t('auth:emailVerification.invalidToken');
        }
      } else if (error?.response?.data?.message) {
        message = error.response.data.message;
      }

      setVerificationResult({
        verified: false,
        alreadyVerified: false,
        expired,
        message,
        isResent: new_verification_email_sent,
      });

      const title = new_verification_email_sent 
        ? t('auth:emailVerification.resendTitle') 
        : t('auth:emailVerification.errorTitle');

      toast.error(message);
    } finally {
      setIsLoading(false);
    }
  }, [uid, token, t, i18n.language]);

  useEffect(() => {
    // Verify email token on component mount
    if (!uid || !token) {
      setVerificationResult({
        verified: false,
        alreadyVerified: false,
        expired: false,
        message: t('auth:emailVerification.invalidLink'),
        isResent: false,
      });
      return;
    }

    verifyEmailToken();
  }, [uid, token, verifyEmailToken, t]);

  const handleResendVerification = async () => {
    if (!uid || !token) return;

    try {
      setIsResending(true);
      
      const selected_language = i18n.language;
      // Use the same endpoint with resend_verification_email parameter
      await apiService.get(`/accounts/verify-email/?uid=${uid}&token=${token}&resend_verification_email=true&selected_language=${selected_language}`);
      
      toast.success(t('auth:emailVerification.resendSuccess'));
      
      // Update the verification result to show resent state
      setVerificationResult(prev => prev ? { ...prev, isResent: true } : null);
    } catch (error: any) {
      console.error('Resend verification error:', error);
      
      let message = t('auth:emailVerification.resendError');
      if (error?.response?.data?.message) {
        message = error.response.data.message;
      }
      if (error?.response?.data?.new_verification_email_sent) {
        setVerificationResult({
          verified: false,
          alreadyVerified: false,
          expired: false,
          message: message,
          isResent: true,
        });
      }

      toast.error(message);
    } finally {
      setIsResending(false);
    }
  };

  // Show loading while verifying token
  if (isLoading) {
    return (
      <div className="auth-container">
        <div className="auth-card">
          <div className="auth-header">
            <div className="loading-spinner"></div>
            <h1>{t('auth:emailVerification.title')}</h1>
            <p>{t('auth:emailVerification.verifying')}</p>
          </div>
        </div>
      </div>
    );
  }

  // Show resent message if email was resent
  if (verificationResult?.isResent) {
    return (
      <div className="auth-container">
        <div className="auth-card">
          <div className="auth-header">
            <div className="success-icon">
              <svg style={{ width: '48px', height: '48px', color: '#4CAF50' }} fill="currentColor" viewBox="0 0 24 24">
                <path d="M9 16.17l-3.17-3.17-1.42 1.42L9 18.75l9-9-1.42-1.42z"/>
              </svg>
            </div>
            <h1>{t('auth:emailVerification.emailResentTitle')}</h1>
            <p>{verificationResult?.message || t('auth:emailVerification.emailResentTitleMessage')}</p>
          </div>

          <div className="auth-body">
            <div className="text-center">
              <Link to="/auth/login" className="btn btn-primary btn-lg">
                {t('auth:emailVerification.backToLogin')}
              </Link>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Show error if no verification result or invalid link
  if (!verificationResult || (!uid || !token)) {
    return (
      <div className="auth-container">
        <div className="auth-card">
          <div className="auth-header">
            <div className="error-icon">
              <svg style={{ width: '48px', height: '48px', color: '#f44336' }} fill="currentColor" viewBox="0 0 24 24">
                <path d="M19,6.41L17.59,5L12,10.59L6.41,5L5,6.41L10.59,12L5,17.59L6.41,19L12,13.41L17.59,19L19,17.59L13.41,12L19,6.41Z"/>
              </svg>
            </div>
            <h1>{t('auth:emailVerification.invalidLinkTitle')}</h1>
            <p>{verificationResult?.message || t('auth:emailVerification.invalidLinkMessage')}</p>
          </div>

          <div className="auth-body">
            <div className="text-center">
              {process.env.REACT_APP_ENABLE_SIGNUP === 'true' && (
                <Link to="/auth/register" className="btn btn-primary btn-lg me-3">
                  {t('auth:emailVerification.goToRegister')}
                </Link>
              )}
              <Link to="/auth/login" className="btn btn-secondary btn-lg">
                {t('auth:emailVerification.backToLogin')}
              </Link>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Show success message for verified email
  if (verificationResult.verified) {
    return (
      <div className="auth-container">
        <div className="auth-card">
          <div className="auth-header">
            <div className="success-icon">
              <svg style={{ width: '48px', height: '48px', color: '#4CAF50' }} fill="currentColor" viewBox="0 0 24 24">
                <path d="M9 16.17l-3.17-3.17-1.42 1.42L9 18.75l9-9-1.42-1.42z"/>
              </svg>
            </div>
            <h1>
              {verificationResult.alreadyVerified 
                ? t('auth:emailVerification.alreadyVerifiedTitle')
                : t('auth:emailVerification.successTitle')
              }
            </h1>
            <p>{verificationResult.message}</p>
          </div>

          <div className="auth-body">
            <div className="text-center">
              <Link to="/auth/login" className="btn btn-primary btn-lg">
                {t('auth:emailVerification.loginNow')}
              </Link>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Show error with option to resend verification
  return (
    <div className="auth-container">
      <div className="auth-card">
        <div className="auth-header">
          <div className="error-icon">
            <svg style={{ width: '48px', height: '48px', color: '#f44336' }} fill="currentColor" viewBox="0 0 24 24">
              <path d="M19,6.41L17.59,5L12,10.59L6.41,5L5,6.41L10.59,12L5,17.59L6.41,19L12,13.41L17.59,19L19,17.59L13.41,12L19,6.41Z"/>
            </svg>
          </div>
          <h1>
            {verificationResult.expired 
              ? t('auth:emailVerification.expiredTitle')
              : t('auth:emailVerification.errorTitle')
            }
          </h1>
          <p>{verificationResult.message}</p>
        </div>

        <div className="auth-body">
          <div className="text-center">
            <button
              onClick={handleResendVerification}
              disabled={isResending}
              className="btn btn-primary btn-lg me-3"
            >
              {isResending ? (
                <>
                  <div className="loading-spinner"></div>
                  {t('auth:emailVerification.resending')}
                </>
              ) : (
                t('auth:emailVerification.resendButton')
              )}
            </button>
            <Link to="/auth/login" className="btn btn-secondary btn-lg">
              {t('auth:emailVerification.backToLogin')}
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EmailVerificationPage;