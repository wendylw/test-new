import React, { useCallback } from 'react';
import { useSelector } from 'react-redux';
import { useTranslation, Trans } from 'react-i18next';
import { useHistory } from 'react-router-dom';
import { PATH_NAME_MAPPING, PROMO_VOUCHER_STATUS } from '../../../../../../../common/utils/constants';
import CleverTap from '../../../../../../../utils/clevertap';
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
    CleverTap.pushEvent('Membership Details Page - Click View All (My Rewards)');

    history.push({
      pathname: `${PATH_NAME_MAPPING.REWARDS_BUSINESS}${PATH_NAME_MAPPING.UNIQUE_PROMO}${PATH_NAME_MAPPING.LIST}`,
      search,
    });
  }, [history, search]);
  const handleClickRewardItem = useCallback(() => {
    CleverTap.pushEvent('Membership Details Page - Click Reward (My Rewards)');
  }, []);

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
          data-test-id="rewards.business.membership-detail.my-rewards.view-all-button"
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
            <li // WB-7760 will change inside DOM as a button for go to reward detail page
              // eslint-disable-next-line jsx-a11y/no-noninteractive-element-to-interactive-role
              role="button"
              data-test-id="rewards.business.membership-detail.unique-promo-list.item"
              key={id}
              onClick={handleClickRewardItem}
            >
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
                        <Trans
                          t={t}
                          i18nKey={expiringDays.i18nKey}
                          values={expiringDays.params}
                          components={[
                            <span
                              className={
                                expiringDays.value === 1
                                  ? styles.MyRewardsTicketStubRemainingExpiredDaysTagLetterHidden
                                  : styles.MyRewardsTicketStubRemainingExpiredDaysTagLetter
                              }
                            />,
                          ]}
                        />
                      </Tag>
                    )}

                    {minSpend && (
                      <data className={styles.MyRewardsTicketStubMinSpend} value={minSpend.value}>
                        <Trans
                          t={t}
                          i18nKey={minSpend.i18nKey}
                          values={minSpend.params}
                          components={[<span className={styles.MyRewardsTicketStubMinSpendPrice} />]}
                        />
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
