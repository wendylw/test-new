import _isNumber from 'lodash/isNumber';
import React, { useRef, useState, useCallback, useEffect } from 'react';
import PropTypes from 'prop-types';
import { useTranslation } from 'react-i18next';
import { connect } from 'react-redux';
import { getCashbackInfo } from '../redux/selector';
import IconCelebration from '../../../../../../images/icon-celebration.svg';
import cashbackSuccessImage from '../../../../../../images/succeed-animation.gif';
import CurrencyNumber from '../../../../../components/CurrencyNumber';

const ANIMATION_TIME = 3600;
const GET_CASHBACK_STATUS_LIST = ['Claimed_NotFirstTime', 'Claimed_Repeat', 'Claimed_FirstTime'];

function CashbackInfo({ enableCashback, cashbackInfo }) {
  const timeoutRef = useRef(null);
  const { t } = useTranslation('OrderingThankYou');
  const { cashback: originalCashback, status: cashbackStatus } = cashbackInfo;
  const cashback = _isNumber(originalCashback) ? Number(originalCashback) : 0;
  const [cashbackSuccessImageVisibility, setCashbackSuccessImageVisibility] = useState(true);
  const [imgLoaded, setImageLoaded] = useState(false);
  const handleHideCashbackSuccessImage = useCallback(() => setCashbackSuccessImageVisibility(false), []);

  useEffect(() => {
    if (imgLoaded) {
      timeoutRef.current = timeoutRef.current || setTimeout(handleHideCashbackSuccessImage, ANIMATION_TIME);
    }

    return () => {
      clearTimeout(timeoutRef.current);
    };
  }, [imgLoaded, handleHideCashbackSuccessImage]);

  if (!enableCashback || !cashback) {
    return null;
  }

  return (
    GET_CASHBACK_STATUS_LIST.includes(cashbackStatus) && (
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
        <p className="ordering-thanks__card-prompt-description margin-top-bottom-small text-line-height-base">
          {t('EarnedCashBackDescription')}
        </p>
      </div>
    )
  );
}

CashbackInfo.displayName = 'CashbackInfo';

CashbackInfo.propTypes = {
  enableCashback: PropTypes.bool,
  // eslint-disable-next-line react/forbid-prop-types
  cashbackInfo: PropTypes.object,
};

CashbackInfo.defaultProps = {
  enableCashback: false,
  cashbackInfo: {},
};

export default connect(
  state => ({
    cashbackInfo: getCashbackInfo(state),
  }),
  {}
)(CashbackInfo);
