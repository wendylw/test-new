import React, { useRef, useState, useCallback, useEffect } from 'react';
import PropTypes from 'prop-types';
import { useTranslation } from 'react-i18next';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import { getCashback, getShouldCheckCashbackInfo, getIsCashbackClaimable } from '../redux/selector';
import { loadCashbackInfo, createCashbackInfo } from '../redux/thunks';
import IconCelebration from '../../../../../../images/icon-celebration.svg';
import Utils from '../../../../../../utils/utils';
import cashbackSuccessImage from '../../../../../../images/succeed-animation.gif';
import CurrencyNumber from '../../../../../components/CurrencyNumber';

const ANIMATION_TIME = 3600;

function CashbackInfo({ cashback, isCashbackClaimable, shouldCheckCashbackInfo, checkCashbackInfo, claimCashback }) {
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
        <span className="text-size-big text-weight-bolder">{t('EarnedCashBackTitle')}</span>
        <img src={IconCelebration} className="icon icon__small" alt="Beep Celebration" />
      </h3>
      <p className="margin-left-right-normal margin-top-bottom-small text-line-height-base">
        {t('EarnedCashBackDescription')}
      </p>
    </div>
  );
}

CashbackInfo.displayName = 'CashbackInfo';

CashbackInfo.propTypes = {
  // eslint-disable-next-line react/forbid-prop-types
  cashback: PropTypes.number,
  isCashbackClaimable: PropTypes.bool,
  shouldCheckCashbackInfo: PropTypes.bool,
  checkCashbackInfo: PropTypes.func,
  claimCashback: PropTypes.func,
};

CashbackInfo.defaultProps = {
  cashback: 0,
  isCashbackClaimable: false,
  shouldCheckCashbackInfo: false,
  checkCashbackInfo: () => {},
  claimCashback: () => {},
};

export default connect(
  state => ({
    cashback: getCashback(state),
    isCashbackClaimable: getIsCashbackClaimable(state),
    shouldCheckCashbackInfo: getShouldCheckCashbackInfo(state),
  }),
  dispatch => ({
    checkCashbackInfo: bindActionCreators(loadCashbackInfo, dispatch),
    claimCashback: bindActionCreators(createCashbackInfo, dispatch),
  })
)(CashbackInfo);
