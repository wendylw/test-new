import React, { useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import WebHeader from '../../../../../../components/WebHeader';
import PromotionContent from './PromotionContent';
import _isFunction from 'lodash/isFunction';

function PromotionDetails({ onHide, promotions, show, inApp }) {
  const { t } = useTranslation('OrderingHome');
  const handleHide = useCallback(() => {
    _isFunction(onHide) && onHide();
  }, [onHide]);

  return (
    <aside className={`promotions-bar__details aside fixed-wrapper ${show ? 'active' : ''}`}>
      <div className="promotions-bar__details-container aside__content">
        <WebHeader
          className="flex-middle"
          contentClassName="flex-middle"
          isPage={false}
          title={t('PromoDetails')}
          navFunc={handleHide}
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
PromotionDetails.displayName = 'PromotionDetails';

export default PromotionDetails;
