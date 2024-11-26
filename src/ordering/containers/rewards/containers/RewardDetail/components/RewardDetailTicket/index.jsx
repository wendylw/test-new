import React from 'react';
import { useSelector } from 'react-redux';
import { useTranslation } from 'react-i18next';
import { REWARD_STATUS_I18N_KEYS } from '../../../../../../../common/utils/rewards/constants';
import { getRewardDetailName, getRewardDetailStatus } from '../../../../../../../redux/modules/rewards/selectors';
import {
  getRewardFormatDiscountValue,
  getRewardLimitations,
  getIsRewardDetailUnAvailable,
  getRewardDetailExpiringDaysI18n,
} from '../../redux/selectors';
import Ticket from '../../../../../../../common/components/Ticket';
import Tag from '../../../../../../../common/components/Tag';
import styles from './RewardDetailTicket.module.scss';

const RewardDetail = () => {
  const { t } = useTranslation(['OrderingPromotion']);
  const formatDiscountValue = useSelector(getRewardFormatDiscountValue);
  const name = useSelector(getRewardDetailName);
  const limitations = useSelector(getRewardLimitations);
  const isRewardDetailUnAvailable = useSelector(getIsRewardDetailUnAvailable);
  const status = useSelector(getRewardDetailStatus);
  const expiringDaysI18n = useSelector(getRewardDetailExpiringDaysI18n);

  return (
    <Ticket
      orientation="vertical"
      size="large"
      showBorder={false}
      className={styles.RewardDetailTicket}
      mainClassName={styles.RewardDetailTicketMain}
      stubClassName={styles.RewardDetailTicketStub}
      main={
        <div className={styles.RewardDetailTicketMainContent}>
          <data className={styles.RewardDetailTicketDiscountValue} value={formatDiscountValue}>
            {t('DiscountValueText', { discount: formatDiscountValue })}
          </data>
          <h2 className={styles.RewardDetailTicketName}>{name}</h2>
        </div>
      }
      stub={
        <>
          <ul className={styles.RewardDetailTicketLimitations}>
            {limitations.map(limitation => (
              <li className={styles.RewardDetailTicketLimitation} key={limitation.key}>
                {t(limitation.i18nKey, limitation.params)}
              </li>
            ))}
          </ul>

          {isRewardDetailUnAvailable ? (
            <Tag className={styles.RewardDetailTicketStatusTag}>{t(REWARD_STATUS_I18N_KEYS[status])}</Tag>
          ) : (
            expiringDaysI18n && <Tag color="red">{t(expiringDaysI18n.i18nKey, expiringDaysI18n.params)}</Tag>
          )}
        </>
      }
    />
  );
};

RewardDetail.displayName = 'RewardDetail';

export default RewardDetail;
