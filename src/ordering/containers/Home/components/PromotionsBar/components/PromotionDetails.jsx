import React from 'react';
import { useTranslation } from 'react-i18next';
import Header from '../../../../../../components/Header';
import PromotionContent from './PromotionContent';

function PromotionDetails({ onHide, promotions, show, inApp }) {
  const { t } = useTranslation('OrderingHome');

  return (
    <aside className={`promotions-bar__details aside fixed-wrapper ${show ? 'active' : ''}`}>
      <div className="promotions-bar__details-container aside__content">
        <Header
          className="flex-middle"
          contentClassName="flex-middle"
          isPage={false}
          title={t('PromoDetails')}
          navFunc={onHide}
        />
        <ul className="promotions-bar__details-content">
          {promotions.map(promo => {
            return (
              <li
                key={promo.id}
                className="padding-top-bottom-normal padding-left-right-small text-line-height-base margin-left-right-normal border__bottom-divider"
              >
                <PromotionContent promotion={promo} inApp={inApp} />
              </li>
            );
          })}
        </ul>
      </div>
    </aside>
  );
}

export default PromotionDetails;
