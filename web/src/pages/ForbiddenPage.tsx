import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import './ForbiddenPage.css';

const ForbiddenPage: React.FC = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();

  return (
    <div className="forbidden-page">
      <div className="forbidden-page__content">
        <div className="forbidden-page__code">403</div>
        <h1 className="forbidden-page__title">{t('errors:forbidden.title', 'Access Denied')}</h1>
        <p className="forbidden-page__message">
          {t('errors:forbidden.message', 'You do not have permission to view this page.')}
        </p>
        <button className="forbidden-page__btn" onClick={() => navigate('/')}>
          {t('common:goHome', 'Go Home')}
        </button>
      </div>
    </div>
  );
};

export default ForbiddenPage;
