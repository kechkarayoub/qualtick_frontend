/**
 * Shared Content Types
 * 
 * Types for shared content system between web and mobile
 */

export interface ContentVersion {
  version: string;
  lastUpdated: Date;
  title: string;
  description?: string;
}

export interface VersionedContent {
  id: string;
  currentVersion: string;
  versions: Record<string, ContentVersion>;
  content: Record<string, any>;
}

export interface ModalContent {
  id: string;
  title: string;
  version: string;
  lastUpdated: Date;
  content: any;
}

export interface CompanyInfo {
  name: string;
  supportEmail: string;
  address?: string;
  website?: string;
}

export interface ModalContentProvider {
  getModalContent(modalId: string, version?: string): ModalContent | null;
  getLatestVersion(modalId: string): string | null;
  getAllVersions(modalId: string): ContentVersion[];
  hasContentChanged(modalId: string, lastKnownVersion: string): boolean;
  getCompanyInfo(): CompanyInfo;
}