/**
 * Modal Manager Component
 * 
 * Centralized component for managing all modals with an alias system
 */

import React, { useState, createContext, useContext, ReactNode } from 'react';
import { 
  PrivacyPolicyModal, 
  TermsOfServiceModal,
  CookiesPolicyModal,
  AboutUsModal,
  FeaturesModal,
  ContactModal,
  HelpCenterModal
} from './index';

type ModalType = 'privacy-policy' | 'terms-of-service' | 'cookies-policy' | 'about-us' | 'features' | 'contact' | 'help-center';

interface ModalContextType {
  openModal: (modalType: ModalType) => void;
  closeModal: () => void;
  isModalOpen: (modalType: ModalType) => boolean;
}

const ModalContext = createContext<ModalContextType | undefined>(undefined);

interface ModalProviderProps {
  children: ReactNode;
}

export const ModalProvider: React.FC<ModalProviderProps> = ({ children }) => {
  const [openModals, setOpenModals] = useState<Set<ModalType>>(new Set());

  const openModal = (modalType: ModalType) => {
    setOpenModals(prev => new Set([...prev, modalType]));
  };

  const closeModal = (modalType?: ModalType) => {
    if (modalType) {
      setOpenModals(prev => {
        const newSet = new Set(prev);
        newSet.delete(modalType);
        return newSet;
      });
    } else {
      // Close all modals if no specific type provided
      setOpenModals(new Set());
    }
  };

  const isModalOpen = (modalType: ModalType) => {
    return openModals.has(modalType);
  };

  const contextValue: ModalContextType = {
    openModal,
    closeModal: () => closeModal(),
    isModalOpen,
  };

  return (
    <ModalContext.Provider value={contextValue}>
      {children}
      
      {/* Render all modals */}
      <PrivacyPolicyModal
        isOpen={isModalOpen('privacy-policy')}
        onClose={() => closeModal('privacy-policy')}
      />
      
      <TermsOfServiceModal
        isOpen={isModalOpen('terms-of-service')}
        onClose={() => closeModal('terms-of-service')}
      />

      <CookiesPolicyModal
        isOpen={isModalOpen('cookies-policy')}
        onClose={() => closeModal('cookies-policy')}
      />
      
      <AboutUsModal
        isOpen={isModalOpen('about-us')}
        onClose={() => closeModal('about-us')}
      />
      
      <FeaturesModal
        isOpen={isModalOpen('features')}
        onClose={() => closeModal('features')}
      />
      
      <ContactModal
        isOpen={isModalOpen('contact')}
        onClose={() => closeModal('contact')}
      />
      
      <HelpCenterModal
        isOpen={isModalOpen('help-center')}
        onClose={() => closeModal('help-center')}
      />
    </ModalContext.Provider>
  );
};

export const useModals = () => {
  const context = useContext(ModalContext);
  if (context === undefined) {
    throw new Error('useModals must be used within a ModalProvider');
  }
  return context;
};

// Convenience hooks for specific modals
export const usePrivacyPolicyModal = () => {
  const { openModal, closeModal, isModalOpen } = useModals();
  return {
    open: () => openModal('privacy-policy'),
    close: () => closeModal(),
    isOpen: isModalOpen('privacy-policy'),
  };
};

export const useTermsOfServiceModal = () => {
  const { openModal, closeModal, isModalOpen } = useModals();
  return {
    open: () => openModal('terms-of-service'),
    close: () => closeModal(),
    isOpen: isModalOpen('terms-of-service'),
  };
};

export const useCookiesPolicyModal = () => {
  const { openModal, closeModal, isModalOpen } = useModals();
  return {
    open: () => openModal('cookies-policy'),
    close: () => closeModal(),
    isOpen: isModalOpen('cookies-policy'),
  };
};

export const useAboutUsModal = () => {
  const { openModal, closeModal, isModalOpen } = useModals();
  return {
    open: () => openModal('about-us'),
    close: () => closeModal(),
    isOpen: isModalOpen('about-us'),
  };
};

export const useFeaturesModal = () => {
  const { openModal, closeModal, isModalOpen } = useModals();
  return {
    open: () => openModal('features'),
    close: () => closeModal(),
    isOpen: isModalOpen('features'),
  };
};

export const useContactModal = () => {
  const { openModal, closeModal, isModalOpen } = useModals();
  return {
    open: () => openModal('contact'),
    close: () => closeModal(),
    isOpen: isModalOpen('contact'),
  };
};

export const useHelpCenterModal = () => {
  const { openModal, closeModal, isModalOpen } = useModals();
  return {
    open: () => openModal('help-center'),
    close: () => closeModal(),
    isOpen: isModalOpen('help-center'),
  };
};

// Export modal types for convenience
export type { ModalType };