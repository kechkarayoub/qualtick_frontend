/**
 * Hook for accessing shared modal content in React Native
 */

import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { modalContentProvider, ModalContent } from '../shared/content';

export const useModalContent = (modalId: string, version?: string) => {
  const { t } = useTranslation();
  const [content, setContent] = useState<ModalContent | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    try {
      setLoading(true);
      setError(null);
      
      // Pass translation function to content provider
      const modalContent = modalContentProvider.getModalContent(modalId, version, t);
      
      if (!modalContent) {
        setError(`Content not found for modal: ${modalId}`);
        setContent(null);
      } else {
        setContent(modalContent);
      }
    } catch (err) {
      console.error(`Error loading modal content for ${modalId}:`, err);
      setError(err instanceof Error ? err.message : 'Unknown error');
      setContent(null);
    } finally {
      setLoading(false);
    }
  }, [modalId, version, t]);

  return {
    content,
    loading,
    error,
    hasContent: !!content,
    refresh: () => {
      const modalContent = modalContentProvider.getModalContent(modalId, version, t);
      setContent(modalContent);
    },
  };
};

export const useCompanyInfo = () => {
  return modalContentProvider.getCompanyInfo();
};

export const useContentVersions = (modalId: string) => {
  const [versions, setVersions] = useState<Array<{ version: string; lastUpdated: Date; title: string }>>([]);

  useEffect(() => {
    const allVersions = modalContentProvider.getAllVersions(modalId);
    setVersions(allVersions);
  }, [modalId]);

  return versions;
};

export const useContentChangeDetection = (modalId: string, lastKnownVersion?: string) => {
  const [hasChanged, setHasChanged] = useState(false);

  useEffect(() => {
    if (lastKnownVersion) {
      const changed = modalContentProvider.hasContentChanged(modalId, lastKnownVersion);
      setHasChanged(changed);
    }
  }, [modalId, lastKnownVersion]);

  return {
    hasChanged,
    latestVersion: modalContentProvider.getLatestVersion(modalId),
  };
};