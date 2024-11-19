import React, { useCallback } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useMount } from 'react-use';
import { useTranslation } from 'react-i18next';
import { UNIQUE_PROMO_STATUS_I18KEYS, REWARDS_APPLIED_SOURCE_I18KEYS } from '../../utils/constants';
import {
  getUniquePromoFormatDiscountValue,
  getUniquePromoPromotionName,
  getUniquePromoLimitations,
  getIsUniquePromoUnAvailable,
  getUniquePromoStatus,
  getUniquePromoExpiringDaysI18n,
  getUniquePromoFormatAppliedProductsText,
  getUniquePromoFormatAppliedStoresText,
  getUniquePromoRedeemOnlineList,
  getIsUniquePromoRedeemOnlineShow,
  getIsUniquePromoRedeemInStoreShow,
} from './redux/selectors';
import { backButtonClicked, mounted } from './redux/thunks';
import Frame from '../../../../../common/components/Frame';
import PageHeader from '../../../../../common/components/PageHeader';
import Tag from '../../../../../common/components/Tag';
import RewardDetailTicket from '../../../../../common/components/RewardDetailTicket';
import styles from './UniquePromoDetail.module.scss';

const UniquePromoDetail = () => {
  const { t } = useTranslation(['Rewards']);
  const dispatch = useDispatch();
  const formatDiscountValue = useSelector(getUniquePromoFormatDiscountValue);
  const name = useSelector(getUniquePromoPromotionName);
  const limitations = useSelector(getUniquePromoLimitations);
  const isUniquePromoUnAvailable = useSelector(getIsUniquePromoUnAvailable);
  const status = useSelector(getUniquePromoStatus);
  const expiringDaysI18n = useSelector(getUniquePromoExpiringDaysI18n);
  const formatAppliedProductsText = useSelector(getUniquePromoFormatAppliedProductsText);
  const formatAppliedStoresText = useSelector(getUniquePromoFormatAppliedStoresText);
  const redeemOnlineList = useSelector(getUniquePromoRedeemOnlineList);
  const isUniquePromoRedeemOnlineShow = useSelector(getIsUniquePromoRedeemOnlineShow);
  const isUniquePromoRedeemInStoreShow = useSelector(getIsUniquePromoRedeemInStoreShow);
  const handleClickHeaderBackButton = useCallback(() => dispatch(backButtonClicked()), [dispatch]);

  useMount(() => {
    dispatch(mounted());
  });

  return (
    <Frame>
      <PageHeader title={t('UniquePromoDetails')} onBackArrowClick={handleClickHeaderBackButton} />

      <RewardDetailTicket
        discount={formatDiscountValue}
        discountText={t('DiscountValueText', { discount: formatDiscountValue })}
        name={name}
        stub={
          <>
            <ul className={styles.UniquePromoDetailLimitations}>
              {limitations.map(limitation => (
                <li className={styles.UniquePromoDetailLimitation} key={limitation.key}>
                  {t(limitation.i18nKey, limitation.params)}
                </li>
              ))}
            </ul>

            {isUniquePromoUnAvailable ? (
              <Tag className={styles.UniquePromoDetailTicketStatusTag}>{t(UNIQUE_PROMO_STATUS_I18KEYS[status])}</Tag>
            ) : (
              expiringDaysI18n && <Tag color="red">{t(expiringDaysI18n.i18nKey, expiringDaysI18n.params)}</Tag>
            )}
          </>
        }
      />

      <section className={styles.UniquePromoDetailApplicableProducts}>
        <h3 className={styles.UniquePromoDetailConditionTitle}>{t('UniquePromoApplicableProductsTitle')}</h3>
        {formatAppliedProductsText && (
          <p className={styles.UniquePromoDetailConditionContent}>{formatAppliedProductsText}</p>
        )}
      </section>

      <section className={styles.UniquePromoDetailApplicableStores}>
        <h3 className={styles.UniquePromoDetailConditionTitle}>{t('UniquePromoApplicableStoresTitle')}</h3>
        {formatAppliedStoresText && (
          <p className={styles.UniquePromoDetailConditionContent}>{formatAppliedStoresText}</p>
        )}
      </section>

      <section className={styles.UniquePromoDetailHowToUse}>
        <h3 className={styles.UniquePromoDetailHowToUseTitle}>{t('HowToUse')}</h3>

        {isUniquePromoRedeemOnlineShow && (
          <div>
            <h4 className={styles.UniquePromoDetailHowToUseSubtitle}>{t('UniquePromoRedeemOnlineTitle')}</h4>
            <p className={styles.UniquePromoDetailHowToUseContentDescription}>
              {t('UniquePromoRedeemOnlineDescription')}
            </p>
            <ul className={styles.UniquePromoDetailHowToUseRedeemOnlineList}>
              {redeemOnlineList.map(redeemOnlineChannel => (
                <li
                  key={`myRewardDetail-redeemOnlineChannel-${redeemOnlineChannel}`}
                  className={styles.UniquePromoDetailHowToUseRedeemOnlineItem}
                >
                  {t(REWARDS_APPLIED_SOURCE_I18KEYS[redeemOnlineChannel])}
                </li>
              ))}
            </ul>
          </div>
        )}

        {isUniquePromoRedeemInStoreShow && (
          <div>
            <h4 className={styles.UniquePromoDetailHowToUseSubtitle}>{t('UniquePromoRedeemInStoreTitle')}</h4>
            <p className={styles.UniquePromoDetailHowToUseContentDescription}>
              {t('UniquePromoRedeemInStoreDescription')}
            </p>
          </div>
        )}
      </section>
    </Frame>
  );
};

UniquePromoDetail.displayName = 'UniquePromoDetail';

export default UniquePromoDetail;
