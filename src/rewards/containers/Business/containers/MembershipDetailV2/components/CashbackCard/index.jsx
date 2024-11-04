import React, { useCallback } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useHistory } from 'react-router-dom';
import { Trans, useTranslation } from 'react-i18next';
import CashbackHistoryButtonIcon from '../../../../../../../images/membership-history.svg';
import { PATH_NAME_MAPPING } from '../../../../../../../common/utils/constants';
import { formatTimeToDateString } from '../../../../../../../utils/datetime-lib';
import { getMerchantCountry } from '../../../../../../../redux/modules/merchant/selectors';
import { getLocationSearch } from '../../../../../../redux/modules/common/selectors';
import {
  getIsCashbackExpired,
  getDisplayCashbackExpiredDate,
  getCustomerCashback,
} from '../../../../../../redux/modules/customer/selectors';
import {
  getIsExpiringTagShown,
  getIsTodayExpired,
  getRemainingCashbackExpiredDays,
  getCustomerCashbackPrice,
} from '../../../../redux/common/selectors';
import { getIsCashbackPromptDrawerShow } from '../../redux/selectors';
import { actions as membershipDetailActions } from '../../redux';
import Tag from '../../../../../../../common/components/Tag';
import Button from '../../../../../../../common/components/Button';
import { CashbackStoreCredits } from '../../../../../../../common/components/Icons';
import HistoryBanner from '../../../../components/Histories/HistoryBanner';
import EarnedCashbackPromptDrawer from '../../../../components/EarnedCashbackPromptDrawer';
import styles from './CashbackCard.module.scss';

const CashbackCard = () => {
  const { t } = useTranslation(['Rewards']);
  const history = useHistory();
  const dispatch = useDispatch();
  const merchantCountry = useSelector(getMerchantCountry);
  const search = useSelector(getLocationSearch);
  const isCashbackExpired = useSelector(getIsCashbackExpired);
  const isExpiringTagShown = useSelector(getIsExpiringTagShown);
  const isTodayExpired = useSelector(getIsTodayExpired);
  const remainingCashbackExpiredDays = useSelector(getRemainingCashbackExpiredDays);
  const customerCashbackPrice = useSelector(getCustomerCashbackPrice);
  const displayCashbackExpiredDate = useSelector(getDisplayCashbackExpiredDate);
  const customerCashback = useSelector(getCustomerCashback);
  const isCashbackPromptDrawerShow = useSelector(getIsCashbackPromptDrawerShow);
  const handleClickHowToUseButton = useCallback(() => {
    dispatch(membershipDetailActions.cashbackPromptDrawerShown());
  }, [dispatch]);
  const handleCloseHowToUserDrawer = useCallback(() => {
    dispatch(membershipDetailActions.cashbackPromptDrawerHidden());
  }, [dispatch]);
  const handleHistoryButtonClick = useCallback(() => {
    history.push({
      pathname: `${PATH_NAME_MAPPING.REWARDS_BUSINESS}${PATH_NAME_MAPPING.REWARDS_MEMBERSHIP}${PATH_NAME_MAPPING.CASHBACK_CREDITS_HISTORY}`,
      search,
    });
  }, [history, search]);

  return (
    <>
      <section className={styles.CashbackCardSection}>
        <div className={styles.CashbackCard}>
          <HistoryBanner
            title={t('CashbackBalance')}
            value={customerCashbackPrice}
            valueText={customerCashbackPrice}
            promptClassName={styles.CashbackCardPromptClassName}
            prompt={
              customerCashback > 0 && (
                <>
                  {t('ValidUntil', {
                    date: formatTimeToDateString(merchantCountry, displayCashbackExpiredDate),
                  })}
                  {isCashbackExpired && <Tag className={styles.CashbackCardExpiredTag}>{t('Expired')}</Tag>}
                  {isExpiringTagShown ? (
                    <Tag color="red" className={styles.CashbackCardRemainingExpiredDaysTag}>
                      {isTodayExpired ? (
                        t('ExpiringToday')
                      ) : (
                        <Trans
                          t={t}
                          i18nKey="ExpiringInDays"
                          values={{ remainingExpiredDays: remainingCashbackExpiredDays }}
                          components={[
                            <span
                              className={
                                remainingCashbackExpiredDays <= 1
                                  ? styles.CashbackCardRemainingExpiredDaysTagExtraTextHide
                                  : ''
                              }
                            />,
                          ]}
                        />
                      )}
                    </Tag>
                  ) : null}
                </>
              )
            }
            infoButtonText={t('HowToUse')}
            historyBannerRightClassName={styles.CashbackCardRight}
            historyButton={
              <Button
                className={styles.CashbackCardHistoryLink}
                data-test-id="rewards.membership-detail.cashback-card.cashback-history-link"
                type="text"
                size="small"
                onClick={handleHistoryButtonClick}
              >
                <img
                  className={styles.CashbackCardHistoryLinkImage}
                  src={CashbackHistoryButtonIcon}
                  alt="Store cashback history in StoreHub"
                />
              </Button>
            }
            historyBannerImage={
              <i className={styles.CashbackCardHistoryBannerIcon}>
                <CashbackStoreCredits />
              </i>
            }
            onClickInfoButton={handleClickHowToUseButton}
            infoButtonTestId="rewards.business.membership-detail.cashback.how-to-use-button"
          />
        </div>
      </section>
      <EarnedCashbackPromptDrawer show={isCashbackPromptDrawerShow} onCloseDrawer={handleCloseHowToUserDrawer} />
    </>
  );
};

CashbackCard.displayName = 'CashbackCard';

export default CashbackCard;
