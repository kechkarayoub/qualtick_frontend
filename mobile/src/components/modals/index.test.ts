jest.mock('./BaseModal', () => ({ __esModule: true, default: 'BaseModalMock' }));
jest.mock('./PrivacyPolicyModal', () => ({ __esModule: true, default: 'PrivacyPolicyModalMock' }));
jest.mock('./TermsOfServiceModal', () => ({ __esModule: true, default: 'TermsOfServiceModalMock' }));
jest.mock('./AboutUsModal', () => ({ __esModule: true, default: 'AboutUsModalMock' }));
jest.mock('./ContactModal', () => ({ __esModule: true, default: 'ContactModalMock' }));
jest.mock('./CookiesPolicyModal', () => ({ __esModule: true, default: 'CookiesPolicyModalMock' }));
jest.mock('./FeaturesModal', () => ({ __esModule: true, default: 'FeaturesModalMock' }));
jest.mock('./HelpCenterModal', () => ({ __esModule: true, default: 'HelpCenterModalMock' }));

import * as ModalExports from './index';

describe('modals index exports', () => {
  it('exports all expected modal components', () => {
    expect(ModalExports.BaseModal).toBeDefined();
    expect(ModalExports.PrivacyPolicyModal).toBeDefined();
    expect(ModalExports.TermsOfServiceModal).toBeDefined();
    expect(ModalExports.AboutUsModal).toBeDefined();
    expect(ModalExports.ContactModal).toBeDefined();
    expect(ModalExports.CookiesPolicyModal).toBeDefined();
    expect(ModalExports.FeaturesModal).toBeDefined();
    expect(ModalExports.HelpCenterModal).toBeDefined();
  });
});
