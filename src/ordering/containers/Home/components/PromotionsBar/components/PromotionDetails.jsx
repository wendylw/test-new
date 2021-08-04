import React, { useCallback, useImperativeHandle, useEffect, forwardRef } from 'react';
import { useTranslation } from 'react-i18next';
import WebHeader from '../../../../../../components/WebHeader';
import PromotionContent from './PromotionContent';
import _isFunction from 'lodash/isFunction';
import { withBackButtonSupport } from '../../../../../../utils/modal-back-button-support';

function PromotionDetails({ onHide, promotions, show, inApp, onModalVisibilityChanged }, ref) {
  const { t } = useTranslation('OrderingHome');
  const handleHide = useCallback(() => {
    _isFunction(onHide) && onHide();
  }, [onHide]);
  useImperativeHandle(ref, () => ({
    onHistoryBackReceived: () => {
      handleHide();
    },
  }));
  useEffect(() => {
    if (show) {
      if (show) {
        onModalVisibilityChanged(true);
      } else {
        onModalVisibilityChanged(false);
      }
    }
  }, [show, onModalVisibilityChanged]);

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

export default withBackButtonSupport(forwardRef(PromotionDetails));
