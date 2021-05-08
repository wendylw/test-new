import React from 'react';
import { useTranslation } from 'react-i18next';
import Header from '../../../../../../components/Header';

function PromotionDetails({ handleClose }) {
  const { t } = useTranslation('OrderingHome');
  return (
    <aside className="promotions-bar__details aside fixed-wrapper active cover">
      <div className="promotions-bar__details-container aside__content">
        <Header
          className="flex-middle"
          contentClassName="flex-middle"
          isPage={false}
          title={t('PromoDetails')}
          navFunc={handleClose}
        />
        <ul className="promotions-bar__details-content padding-normal">
          <li className="padding-normal text-line-height-base border__bottom-divider">
            15% OFF with BERSAMA code
            <br />
            (capped at MYR 10.00 with min. spend MYR50.00)
          </li>
          <li className="padding-normal text-line-height-base border__bottom-divider">
            MYR 6.00 OFF with promo code FREEDEL
            <br />
            (min. spend MYR 40.00)
          </li>
        </ul>
      </div>
    </aside>
  );
}

export default PromotionDetails;
