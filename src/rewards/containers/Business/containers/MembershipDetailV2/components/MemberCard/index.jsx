import _isEmpty from 'lodash/isEmpty';
import React from 'react';
import { useSelector } from 'react-redux';
import { useTranslation, Trans } from 'react-i18next';
import { MEMBERSHIP_TIER_I18N_KEYS } from '../../utils/constants';
import { getCustomerTierLevelName } from '../../../../../../redux/modules/customer/selectors';
import {
  getMemberCardStyles,
  getMerchantMembershipTierList,
  getCustomerMemberTierProgressStyles,
  getCustomerMemberTierStatus,
  getCustomerCurrentStatusParams,
} from '../../redux/selectors';
import MemberIcon from '../../../../components/MemberIcon';
import styles from './MemberCard.module.scss';

const MemberCard = () => {
  const { t } = useTranslation(['Rewards']);
  const customerTierLevelName = useSelector(getCustomerTierLevelName);
  const memberCardStyles = useSelector(getMemberCardStyles);
  const merchantMembershipTierList = useSelector(getMerchantMembershipTierList);
  const customerMemberTierProgressStyles = useSelector(getCustomerMemberTierProgressStyles);
  const customerMemberTierStatus = useSelector(getCustomerMemberTierStatus);
  const customerCurrentStatusParams = useSelector(getCustomerCurrentStatusParams);
  const { messageI18nKey } = MEMBERSHIP_TIER_I18N_KEYS[customerMemberTierStatus];

  return (
    <section className={styles.MemberCardSection}>
      <div className={styles.MemberCard} style={memberCardStyles}>
        <h2 className={styles.MemberCardCustomerTierLevelName}>{customerTierLevelName}</h2>
        <div className={styles.MemberCardLevelsProgress}>
          {customerMemberTierProgressStyles && (
            <div role="progressbar" className={styles.MemberCardProgress}>
              <div className={styles.MemberCardProgressBar} style={customerMemberTierProgressStyles} />
            </div>
          )}

          <ul className={styles.MemberCardLevels}>
            {merchantMembershipTierList.map(merchantMembershipTier => {
              const { level, iconColorPalettes } = merchantMembershipTier;

              return (
                <li key={`member-card-level-${level}`}>
                  <MemberIcon
                    className={styles.MemberCardLevelIcon}
                    id={`member-level-icon-${level}`}
                    crownStartColor={iconColorPalettes.crown.startColor}
                    crownEndColor={iconColorPalettes.crown.endColor}
                    backgroundStartColor={iconColorPalettes.background.startColor}
                    backgroundEndColor={iconColorPalettes.background.endColor}
                    strokeColor={iconColorPalettes.strokeColor}
                  />
                </li>
              );
            })}
          </ul>
        </div>
        <p>
          {_isEmpty(customerCurrentStatusParams) ? (
            t(messageI18nKey)
          ) : (
            <Trans t={t} i18nKey={messageI18nKey} values={customerCurrentStatusParams} components={<strong />} />
          )}
        </p>
      </div>
    </section>
  );
};

MemberCard.displayName = 'MemberCard';

export default MemberCard;
