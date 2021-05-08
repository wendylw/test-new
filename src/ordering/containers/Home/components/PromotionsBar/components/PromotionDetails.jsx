import React from 'react';
import { useTranslation } from 'react-i18next';
import Header from '../../../../../../components/Header';
import PromotionText from './PromotionText';
import PromotionPrompt from './PromotionPrompt';

function PromotionDetails({ onHide, promotions, show }) {
  const { t } = useTranslation('OrderingHome');

  return (
    <aside className={`promotions-bar__details aside fixed-wrapper ${show ? 'active cover' : ''}`}>
      <div className="promotions-bar__details-container aside__content">
        <Header
          className="flex-middle"
          contentClassName="flex-middle"
          isPage={false}
          title={t('PromoDetails')}
          navFunc={onHide}
        />
        <ul className="promotions-bar__details-content padding-normal">
          {promotions.map(promo => {
            const prompt = <PromotionPrompt promotion={promo} />;

            return (
              <li key={promo.id} className="padding-normal text-line-height-base">
                <PromotionText promotion={promo} />
                {prompt && (
                  <>
                    <br /> ({prompt})
                  </>
                )}
              </li>
            );
          })}
        </ul>
      </div>
    </aside>
  );
}

export default PromotionDetails;
