import React, { useCallback } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useHistory } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import CashbackHistoryButtonIcon from '../../../../../../../images/membership-history.svg';
import { PATH_NAME_MAPPING } from '../../../../../../../common/utils/constants';
import { getLocationSearch } from '../../../../../../redux/modules/common/selectors';
import { getCustomerCashbackPrice } from '../../../../redux/common/selectors';
import { getIsStoreCreditsPromptDrawerShow } from '../../redux/selectors';
import { actions as membershipDetailActions } from '../../redux';
import Button from '../../../../../../../common/components/Button';
import { CashbackStoreCredits } from '../../../../../../../common/components/Icons';
import HistoryBanner from '../../../../components/Histories/HistoryBanner';
import EarnedStoreCreditsPromptDrawer from '../../../../components/EarnedStoreCreditsPromptDrawer';
import styles from './StoreCreditsCard.module.scss';

const StoreCreditsCard = () => {
  const { t } = useTranslation(['Rewards']);
  const history = useHistory();
  const dispatch = useDispatch();
  const search = useSelector(getLocationSearch);
  const customerCashbackPrice = useSelector(getCustomerCashbackPrice);
  const isStoreCreditsPromptDrawerShow = useSelector(getIsStoreCreditsPromptDrawerShow);
  const handleClickHowToUseButton = useCallback(() => {
    dispatch(membershipDetailActions.storeCreditsPromptDrawerShown());
  }, [dispatch]);
  const handleCloseHowToUserDrawer = useCallback(() => {
    dispatch(membershipDetailActions.storeCreditsPromptDrawerHidden());
  }, [dispatch]);
  const handleHistoryButtonClick = useCallback(() => {
    history.push({
      pathname: `${PATH_NAME_MAPPING.REWARDS_BUSINESS}${PATH_NAME_MAPPING.REWARDS_MEMBERSHIP}${PATH_NAME_MAPPING.CASHBACK_CREDITS_HISTORY}`,
      search,
    });
  }, [history, search]);

  return (
    <>
      <section className={styles.StoreCreditsCardSection}>
        <div className={styles.StoreCreditsCard}>
          <HistoryBanner
            className={styles.StoreCreditsCard}
            title={t('StoreCreditsBalance')}
            value={customerCashbackPrice}
            valueText={customerCashbackPrice}
            prompt=""
            infoButtonText={t('HowToUse')}
            historyBannerRightClassName={styles.StoreCreditsCardRight}
            historyButton={
              <Button
                className={styles.StoreCreditsCardHistoryLink}
                data-test-id="rewards.membership-detail.cashback-card.cashback-history-link"
                type="text"
                size="small"
                onClick={handleHistoryButtonClick}
              >
                <img
                  className={styles.StoreCreditsCardHistoryLinkImage}
                  src={CashbackHistoryButtonIcon}
                  alt="Store cashback history in StoreHub"
                />
              </Button>
            }
            historyBannerImage={
              <i className={styles.StoreCreditsCardHistoryBannerIcon}>
                <CashbackStoreCredits color="#FC7118" />
              </i>
            }
            onClickInfoButton={handleClickHowToUseButton}
            infoButtonTestId="rewards.business.membership-detail.store-credits-card.how-to-use-button"
          />
        </div>
      </section>
      <EarnedStoreCreditsPromptDrawer
        show={isStoreCreditsPromptDrawerShow}
        onCloseDrawer={handleCloseHowToUserDrawer}
      />
    </>
  );
};

StoreCreditsCard.displayName = 'StoreCreditsCard';

export default StoreCreditsCard;
