import React, { useRef, useState, useCallback, useEffect } from 'react';
import PropTypes from 'prop-types';
import { useTranslation } from 'react-i18next';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import { getUserIsLogin } from '../../../../../redux/modules/app';
import {
  getCashback,
  getShouldCheckCashbackInfo,
  getIsCashbackAvailable,
  getIsCashbackClaimable,
} from '../redux/selector';
import { loadCashbackInfo, createCashbackInfo } from '../redux/thunks';
import IconCelebration from '../../../../../../images/icon-celebration.svg';
import Utils from '../../../../../../utils/utils';
import cashbackSuccessImage from '../../../../../../images/succeed-animation.gif';
import CurrencyNumber from '../../../../../components/CurrencyNumber';

const ANIMATION_TIME = 3600;

function CashbackInfo({
  cashback,
  hasUserLoggedIn,
  isCashbackClaimable,
  shouldCheckCashbackInfo,
  isCashbackAvailable,
  checkCashbackInfo,
  claimCashback,
  onLoginButtonClick,
}) {
  const timeoutRef = useRef(null);
  const { t } = useTranslation('OrderingThankYou');
  const [cashbackSuccessImageVisibility, setCashbackSuccessImageVisibility] = useState(true);
  const [imgLoaded, setImageLoaded] = useState(false);
  const handleHideCashbackSuccessImage = useCallback(() => setCashbackSuccessImageVisibility(false), []);
  const phone = Utils.getLocalStorageVariable('user.p');
  const receiptNumber = Utils.getQueryString('receiptNumber') || '';

  useEffect(() => {
    if (shouldCheckCashbackInfo) {
      checkCashbackInfo(receiptNumber);
    }
  }, [receiptNumber, shouldCheckCashbackInfo, checkCashbackInfo]);

  useEffect(() => {
    if (isCashbackClaimable) {
      claimCashback({ phone, receiptNumber });
    }
  }, [phone, receiptNumber, isCashbackClaimable, claimCashback]);

  useEffect(() => {
    if (imgLoaded) {
      timeoutRef.current = timeoutRef.current || setTimeout(handleHideCashbackSuccessImage, ANIMATION_TIME);
    }

    return () => {
      clearTimeout(timeoutRef.current);
    };
  }, [imgLoaded, handleHideCashbackSuccessImage]);

  if (!isCashbackAvailable) {
    return null;
  }

  const { title, description } = hasUserLoggedIn
    ? {
        title: t('EarnedCashBackTitle'),
        description: t('EarnedCashBackDescription'),
      }
    : {
        title: t('GotCashBackTitle'),
        description: t('GotCashBackDescription'),
      };

  return (
    <div className="ordering-thanks__card-prompt card text-center padding-small margin-small">
      {cashbackSuccessImageVisibility ? (
        <img
          src={cashbackSuccessImage}
          alt="cashback Earned"
          onLoad={() => setImageLoaded(true)}
          className="ordering-thanks__card-prompt-congratulation absolute-wrapper"
        />
      ) : null}
      <CurrencyNumber
        className="ordering-thanks__card-prompt-total padding-top-bottom-normal text-size-huge text-weight-bolder"
        money={cashback}
      />
      <h3 className="flex flex-middle flex-center">
        <span className="text-size-big text-weight-bolder">{title}</span>
        <img src={IconCelebration} className="icon icon__small" alt="Beep Celebration" />
      </h3>
      <p className="margin-left-right-normal margin-top-bottom-small text-line-height-base">{description}</p>
      {!hasUserLoggedIn && (
        <button
          className="button button__fill ordering-thanks__card-prompt-button text-size-small text-weight-bolder text-uppercase margin-top-bottom-small padding-left-right-normal"
          onClick={onLoginButtonClick}
        >
          {t('WantCashBackTitle')}
        </button>
      )}
    </div>
  );
}

CashbackInfo.displayName = 'CashbackInfo';

CashbackInfo.propTypes = {
  // eslint-disable-next-line react/forbid-prop-types
  cashback: PropTypes.number,
  hasUserLoggedIn: PropTypes.bool,
  isCashbackClaimable: PropTypes.bool,
  shouldCheckCashbackInfo: PropTypes.bool,
  isCashbackAvailable: PropTypes.bool,
  checkCashbackInfo: PropTypes.func,
  claimCashback: PropTypes.func,
  onLoginButtonClick: PropTypes.func,
};

CashbackInfo.defaultProps = {
  cashback: 0,
  hasUserLoggedIn: false,
  isCashbackClaimable: false,
  shouldCheckCashbackInfo: false,
  isCashbackAvailable: false,
  checkCashbackInfo: () => {},
  claimCashback: () => {},
  onLoginButtonClick: () => {},
};

export default connect(
  state => ({
    cashback: getCashback(state),
    hasUserLoggedIn: getUserIsLogin(state),
    isCashbackAvailable: getIsCashbackAvailable(state),
    isCashbackClaimable: getIsCashbackClaimable(state),
    shouldCheckCashbackInfo: getShouldCheckCashbackInfo(state),
  }),
  dispatch => ({
    checkCashbackInfo: bindActionCreators(loadCashbackInfo, dispatch),
    claimCashback: bindActionCreators(createCashbackInfo, dispatch),
  })
)(CashbackInfo);
