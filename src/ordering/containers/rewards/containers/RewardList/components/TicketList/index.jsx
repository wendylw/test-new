import React, { useCallback } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { useHistory } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { PATH_NAME_MAPPING } from '../../../../../../../common/utils/constants';
import { UNIQUE_PROMO_STATUS_I18KEYS } from '../../../../../../../common/utils/rewards/constants';
import { getClassName } from '../../../../../../../common/utils/ui';
import { getRewardList } from '../../redux/selectors';
import { actions as rewardListActions } from '../../redux';
import Ticket from '../../../../../../../common/components/Ticket';
import Tag from '../../../../../../../common/components/Tag';
import Button from '../../../../../../../common/components/Button';
import styles from './TicketList.module.scss';
import { getLocationSearch } from '../../../../../../redux/modules/app';

const TicketList = () => {
  const { t } = useTranslation(['OrderingPromotion']);
  const history = useHistory();
  const dispatch = useDispatch();
  const search = useSelector(getLocationSearch);
  const rewardList = useSelector(getRewardList);
  const handleClickRewardItemButton = useCallback(
    (event, selectedReward) => {
      event.preventDefault();
      event.stopPropagation();

      const { id, uniquePromotionCodeId, code, type } = selectedReward || {};

      dispatch(rewardListActions.selectedRewardUpdated({ id, uniquePromotionCodeId, code, type }));
    },
    [dispatch]
  );
  const handleClickRewardViewDetailButton = useCallback(
    (event, selectedReward) => {
      event.stopPropagation();

      const { id, uniquePromotionCodeId, type } = selectedReward || {};

      history.push(
        `${PATH_NAME_MAPPING.ORDERING_REWARD_DETAIL}${search}&id=${id}&upid=${uniquePromotionCodeId}&type=${type}`
      );
    },
    [history, search]
  );

  return (
    <section className={styles.RewardTicketListContainer}>
      <h3 className={styles.RewardTicketListTitle}>{t('YourVouchers')}</h3>
      <ul className={styles.RewardTicketList}>
        {rewardList.map(reward => {
          const {
            key,
            isSelected,
            value,
            name,
            isUnavailable,
            status,
            expiringDaysI18n,
            expiringDateI18n,
            minSpendI18n,
          } = reward;

          return (
            <li key={key}>
              <Button
                block
                type="text"
                theme="ghost"
                data-test-id="ordering.reward-list.reward-item"
                className={styles.RewardItemButton}
                contentClassName={styles.RewardItemButtonContent}
                onClick={e => {
                  !isUnavailable && handleClickRewardItemButton(e, reward);
                }}
              >
                <Ticket
                  orientation="vertical"
                  showShadow={false}
                  className={getClassName([
                    styles.RewardTicket,
                    isSelected ? styles.RewardTicket__Selected : null,
                    isUnavailable ? styles.RewardTicket__Unavailable : null,
                  ])}
                  main={
                    <div className={styles.RewardTicketInfoTop}>
                      <div className={styles.RewardTicketDescription}>
                        <data className={styles.RewardTicketDiscount} value={value}>
                          {t('DiscountValueText', { discount: value })}
                        </data>
                        <h5 className={styles.RewardTicketDiscountName}>{name}</h5>
                      </div>
                      {isUnavailable ? (
                        <Tag className={styles.RewardTicketStatusTag}>{t(UNIQUE_PROMO_STATUS_I18KEYS[status])}</Tag>
                      ) : expiringDaysI18n ? (
                        <Tag color="red">{t(expiringDaysI18n.i18nKey, expiringDaysI18n.params)}</Tag>
                      ) : (
                        <Tag className={styles.RewardTicketExpiringTag}>
                          {t(expiringDateI18n.i18nKey, expiringDateI18n.params)}
                        </Tag>
                      )}
                    </div>
                  }
                  stub={
                    <div className={styles.RewardTicketInfoBottom}>
                      <span className={styles.RewardTicketDiscountLimitation}>
                        {t(minSpendI18n.i18nKey, minSpendI18n.params)}
                      </span>
                      <span
                        role="button"
                        tabIndex="0"
                        className={styles.RewardTicketViewDetail}
                        data-test-id="ordering.reward-list.reward-item.view-detail-button"
                        onClick={handleClickRewardViewDetailButton}
                      >
                        {t('ViewDetails')}
                      </span>
                    </div>
                  }
                />
              </Button>
            </li>
          );
        })}
      </ul>
    </section>
  );
};

TicketList.displayName = 'TicketList';

export default TicketList;
