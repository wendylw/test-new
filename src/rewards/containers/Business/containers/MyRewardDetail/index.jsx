import React, { useCallback } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useMount } from 'react-use';
import { Trans, useTranslation } from 'react-i18next';
import { UNIQUE_PROMO_STATUS_I18KEYS } from '../../utils/constants';
import { UNIQUE_PROMO_APPLIED_SOURCE_I18KEYS } from './utils/constants';
import {
  getMyRewardFormatDiscountValue,
  getMyRewardPromotionName,
  getMyRewardLimitations,
  getIsMyRewardUnAvailable,
  getMyRewardStatus,
  getMyRewardExpiringDaysI18n,
  getMyRewardFormatAppliedProductsText,
  getMyRewardFormatAppliedStoresText,
  getMyRewardRedeemOnlineList,
  getIsMyRewardRedeemOnlineShow,
  getIsMyRewardRedeemInStoreShow,
} from './redux/selectors';
import { backButtonClicked, mounted } from './redux/thunks';
import Frame from '../../../../../common/components/Frame';
import PageHeader from '../../../../../common/components/PageHeader';
import Tag from '../../../../../common/components/Tag';
import styles from './MyRewardDetail.module.scss';

const MyRewardDetail = () => {
  const { t } = useTranslation(['Rewards']);
  const dispatch = useDispatch();
  const formatDiscountValue = useSelector(getMyRewardFormatDiscountValue);
  const name = useSelector(getMyRewardPromotionName);
  const limitations = useSelector(getMyRewardLimitations);
  const isMyRewardUnAvailable = useSelector(getIsMyRewardUnAvailable);
  const status = useSelector(getMyRewardStatus);
  const expiringDaysI18n = useSelector(getMyRewardExpiringDaysI18n);
  const formatAppliedProductsText = useSelector(getMyRewardFormatAppliedProductsText);
  const formatAppliedStoresText = useSelector(getMyRewardFormatAppliedStoresText);
  const redeemOnlineList = useSelector(getMyRewardRedeemOnlineList);
  const isMyRewardRedeemOnlineShow = useSelector(getIsMyRewardRedeemOnlineShow);
  const isMyRewardRedeemInStoreShow = useSelector(getIsMyRewardRedeemInStoreShow);
  const handleClickHeaderBackButton = useCallback(() => dispatch(backButtonClicked()), [dispatch]);

  useMount(() => {
    dispatch(mounted());
  });

  return (
    <Frame>
      <PageHeader title={t('MyRewardDetails')} onBackArrowClick={handleClickHeaderBackButton} />
      <section className={styles.MyRewardDetailTicket}>
        <div className={styles.MyRewardDetailTicketMain}>
          <data className={styles.MyRewardDetailDiscountValue} value={formatDiscountValue}>
            {t('DiscountValueText', { discount: formatDiscountValue })}
          </data>
          <h2 className={styles.MyRewardDetailName}>{name}</h2>
        </div>

        <div className={styles.MyRewardDetailTicketStub}>
          <ul className={styles.MyRewardDetailLimitations}>
            {limitations.map(limitation => (
              <li className={styles.MyRewardDetailLimitation} key={limitation.key}>
                {t(limitation.i18nKey, limitation.params)}
              </li>
            ))}
          </ul>

          {isMyRewardUnAvailable ? (
            <Tag className={styles.MyRewardDetailTicketStatusTag}>{t(UNIQUE_PROMO_STATUS_I18KEYS[status])}</Tag>
          ) : (
            expiringDaysI18n && (
              <Tag color="red" className={styles.MyRewardStubRemainingExpiredDaysTag}>
                <Trans
                  t={t}
                  i18nKey={expiringDaysI18n.i18nKey}
                  values={expiringDaysI18n.params}
                  components={[
                    <span
                      className={
                        expiringDaysI18n.value === 1
                          ? styles.MyRewardStubRemainingExpiredDaysTagLetterHidden
                          : styles.MyRewardStubRemainingExpiredDaysTagLetter
                      }
                    />,
                  ]}
                />
              </Tag>
            )
          )}
        </div>
      </section>

      <section className={styles.MyRewardDetailApplicableProducts}>
        <h3 className={styles.MyRewardDetailConditionTitle}>{t('MyRewardApplicableProductsTitle')}</h3>
        {formatAppliedProductsText && (
          <p className={styles.MyRewardDetailConditionContent}>{formatAppliedProductsText}</p>
        )}
      </section>

      <section className={styles.MyRewardDetailApplicableStores}>
        <h3 className={styles.MyRewardDetailConditionTitle}>{t('MyRewardApplicableStoresTitle')}</h3>
        {formatAppliedStoresText && <p className={styles.MyRewardDetailConditionContent}>{formatAppliedStoresText}</p>}
      </section>

      <section className={styles.MyRewardDetailHowToUse}>
        <h3 className={styles.MyRewardDetailHowToUseTitle}>{t('HowToUse')}</h3>

        {isMyRewardRedeemOnlineShow && (
          <div>
            <h4 className={styles.MyRewardDetailHowToUseSubtitle}>{t('MyRewardRedeemOnlineTitle')}</h4>
            <p className={styles.MyRewardDetailHowToUseContentDescription}>{t('MyRewardRedeemOnlineDescription')}</p>
            <ul className={styles.MyRewardDetailHowToUseRedeemOnlineList}>
              {redeemOnlineList.map(redeemOnlineChannel => (
                <li
                  key={`myRewardDetail-redeemOnlineChannel-${redeemOnlineChannel}`}
                  className={styles.MyRewardDetailHowToUseRedeemOnlineItem}
                >
                  {t(UNIQUE_PROMO_APPLIED_SOURCE_I18KEYS[redeemOnlineChannel])}
                </li>
              ))}
            </ul>
          </div>
        )}

        {isMyRewardRedeemInStoreShow && (
          <div>
            <h4 className={styles.MyRewardDetailHowToUseSubtitle}>{t('MyRewardRedeemInStoreTitle')}</h4>
            <p className={styles.MyRewardDetailHowToUseContentDescription}>{t('MyRewardRedeemInStoreDescription')}</p>
          </div>
        )}
      </section>
    </Frame>
  );
};

MyRewardDetail.displayName = 'MyRewardDetail';

export default MyRewardDetail;
