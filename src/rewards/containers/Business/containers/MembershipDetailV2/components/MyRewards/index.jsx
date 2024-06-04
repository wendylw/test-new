import React, { useCallback } from 'react';
import { useSelector } from 'react-redux';
import { useTranslation, Trans } from 'react-i18next';
import { useHistory } from 'react-router-dom';
import { PATH_NAME_MAPPING, PROMO_VOUCHER_STATUS } from '../../../../../../../common/utils/constants';
import { getUniquePromoListLength, getUniquePromoListBanners } from '../../../../redux/common/selectors';
import { getLocationSearch } from '../../../../../../redux/modules/common/selectors';
import { getIsMyRewardsSectionShow } from '../../redux/selectors';
import Button from '../../../../../../../common/components/Button';
import Tag from '../../../../../../../common/components/Tag';
import Ticket from '../../../../components/Ticket';
import styles from './MyRewards.module.scss';

const UNIQUE_PROMO_STATUS_I18KEYS = {
  [PROMO_VOUCHER_STATUS.EXPIRED]: 'Expired',
  [PROMO_VOUCHER_STATUS.REDEEMED]: 'Redeemed',
};

const MyRewards = () => {
  const { t } = useTranslation(['Rewards']);
  const history = useHistory();
  const uniquePromoListBanners = useSelector(getUniquePromoListBanners);
  const uniquePromoListLength = useSelector(getUniquePromoListLength);
  const isMyRewardsSectionShow = useSelector(getIsMyRewardsSectionShow);
  const search = useSelector(getLocationSearch);
  const handleClickViewAllButton = useCallback(() => {
    history.push({
      pathname: `${PATH_NAME_MAPPING.REWARDS_BUSINESS}${PATH_NAME_MAPPING.UNIQUE_PROMO}${PATH_NAME_MAPPING.LIST}`,
      search,
    });
  }, [history, search]);

  if (!isMyRewardsSectionShow) {
    return null;
  }

  return (
    <section className={styles.MyRewardsSection}>
      <div className={styles.MyRewardsSectionTopContainer}>
        <h2 className={styles.MyRewardsSectionTitle}>{t('MyRewards')}</h2>
        <Button
          type="text"
          size="small"
          theme="info"
          className={styles.MyRewardsSectionViewAllButton}
          contentClassName={styles.MyRewardsSectionViewAllButtonContent}
          data-test-id="rewards.membership-detail.my-rewards.view-all-button"
          onClick={handleClickViewAllButton}
        >
          {t('ViewAll')} ({uniquePromoListLength})
        </Button>
      </div>

      <ul className={styles.MyRewardsList}>
        {uniquePromoListBanners.map(promo => {
          const { id, name, value, status, conditions, isUnavailable } = promo;
          const { minSpend, expiringDays } = conditions;

          return (
            <li key={id}>
              <Ticket
                className={isUnavailable ? styles.MyRewardsTicketUnavailable : null}
                stubClassName={styles.MyRewardsTicketStub}
                main={
                  <div className={styles.MyRewardsTicketMain}>
                    <h3 className={styles.MyRewardsTicketMainTitle}>{name}</h3>
                    <data className={styles.MyRewardsTicketMainDiscount} value={value}>
                      {t('DiscountValueText', { discount: value })}
                    </data>
                  </div>
                }
                stub={
                  <>
                    {isUnavailable && (
                      <Tag className={styles.MyRewardsTicketStubStatusTag}>
                        {t(UNIQUE_PROMO_STATUS_I18KEYS[status])}
                      </Tag>
                    )}

                    {expiringDays && (
                      <Tag color="red" className={styles.MyRewardsTicketStubRemainingExpiredDaysTag}>
                        {t(expiringDays.i18nKey, expiringDays.params)}
                      </Tag>
                    )}

                    {minSpend && (
                      <data className={styles.MyRewardsTicketStubMinSpend} value={minSpend.value}>
                        <Trans t={t} i18nKey={minSpend.i18nKey} components={[<br />]} values={minSpend.params} />
                      </data>
                    )}
                  </>
                }
              />
            </li>
          );
        })}
      </ul>
    </section>
  );
};

MyRewards.displayName = 'MyRewards';

export default MyRewards;
