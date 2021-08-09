import React, { useState, useCallback } from 'react';
import PropTypes from 'prop-types';
import { withTranslation } from 'react-i18next';
import { compose } from 'redux';
import IconCelebration from '../../../../../../images/icon-celebration.svg';
import cashbackSuccessImage from '../../../../../../images/succeed-animation.gif';
import CurrencyNumber from '../../../../../components/CurrencyNumber';

const ANIMATION_TIME = 3600;
const GET_CASHBACK_STATUS_LIST = ['Claimed_NotFirstTime', 'Claimed_Repeat', 'Claimed_FirstTime'];

function CashbackInfo(props) {
  const { t, enableCashback, cashback, cashbackStatus } = props;
  const [cashbackInfoLoaded, setCashbackInfoLoaded] = useState(false);
  const handleHideCashbackSuccessImage = useCallback(() => {
    const timer = setTimeout(() => {
      setCashbackInfoLoaded(false);
      clearTimeout(timer);
    }, ANIMATION_TIME);
  }, []);

  if (!enableCashback || !cashback) {
    return null;
  }

  return (
    GET_CASHBACK_STATUS_LIST.includes(cashbackStatus) && (
      <div className="ordering-thanks__card-prompt card text-center padding-small margin-normal">
        {cashbackInfoLoaded ? null : (
          <img
            src={cashbackSuccessImage}
            alt="cashback Earned"
            onLoad={() => handleHideCashbackSuccessImage()}
            className="ordering-thanks__card-prompt-congratulation absolute-wrapper"
          />
        )}
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
  cashback: PropTypes.number,
  cashbackStatus: PropTypes.oneOf(GET_CASHBACK_STATUS_LIST),
};

CashbackInfo.defaultProps = {
  enableCashback: false,
  cashback: 0,
  cashbackStatus: GET_CASHBACK_STATUS_LIST[0],
};

export default compose(withTranslation('OrderingThankYou'))(CashbackInfo);
