import React, { useState } from 'react';
import PropTypes from 'prop-types';
import { withTranslation } from 'react-i18next';
import { compose } from 'redux';
import { IconAccessTime, IconExpandMore } from '../../../../../../components/Icons';
import Constants from '../../../../../../utils/constants';
import { ORDER_DELAY_REASON_CODES } from '../constants';
import './LogisticsProcessing.scss';

const { ORDER_STATUS } = Constants;
const RAINY_DESCRIPTION_MAPPING = {
  badWeatherDescriptionKey: 'BadWeatherDescriptionKey',
  badWeatherImage: (
    <span className="margin-left-right-smaller" role="img" aria-label="Cloud with Rain">
      🌧️
    </span>
  ),
};
const LOGISTIC_PROCESSING_MAPPING = {
  [ORDER_STATUS.PAID]: {
    activeTitleKey: 'OrderReceived',
    completeTitleKey: 'Confirmed',
    descriptionKey: 'OrderReceivedDescription',
    descriptionImage: (
      <span className="margin-left-right-smaller" role="img" aria-label="Goofy">
        😋
      </span>
    ),
  },
  [ORDER_STATUS.ACCEPTED]: {
    activeTitleKey: 'MerchantAccepted',
    completeTitleKey: 'RiderFound',
    descriptionKey: 'FindingRider',
    descriptionIcon: <IconAccessTime className="icon icon__smaller icon__default" />,
    checkBadWeather: true,
  },
  [ORDER_STATUS.CONFIRMED]: {
    activeTitleKey: 'PendingPickUp',
    descriptionKey: 'RiderAssigned',
    checkBadWeather: true,
  },
  [ORDER_STATUS.LOGISTIC_CONFIRMED]: {
    activeTitleKey: 'PendingPickUp',
    descriptionKey: 'RiderAssigned',
    checkBadWeather: true,
  },
};

function getBadWeatherStatus({ currentStepIndex, index, delayReason, checkBadWeather }) {
  return delayReason === ORDER_DELAY_REASON_CODES.BAD_WEATHER && currentStepIndex === index && checkBadWeather;
}

function LogisticsProcessing({ t, useStorehubLogistics, orderStatus, orderDelayReason }) {
  const [expandProcessingList, setExpandProcessingList] = useState(false);

  if (!LOGISTIC_PROCESSING_MAPPING[orderStatus] || (!useStorehubLogistics && orderStatus !== ORDER_STATUS.PAID)) {
    return null;
  }

  const processingList = Object.keys(LOGISTIC_PROCESSING_MAPPING);
  const currentStatusIndex = processingList.findIndex(step => step === orderStatus);
  const currentStepIndex = currentStatusIndex > 2 ? 2 : currentStatusIndex;

  return (
    <div className="card padding-small margin-normal flex flex-top flex-space-between">
      <ul
        className={`logistics-processing__list${
          expandProcessingList ? '--expand' : ''
        } padding-smaller flex__fluid-content`}
      >
        {processingList.map((step, index) => {
          if (index === processingList.length - 1) {
            return null;
          }

          const itemClassList = ['logistics-processing__step padding-left-right-normal'];

          if (index < currentStepIndex) {
            itemClassList.push('logistics-processing__step--complete');
          } else if (index === currentStepIndex) {
            itemClassList.push('logistics-processing__step--active');
          }

          return (
            <li className={itemClassList.join(' ')} key={`beep-logistics-${step}-status`}>
              <i className="logistics-processing__icon" />
              <h4 className="logistics-processing__step-title padding-left-right-normal text-line-height-base">
                {currentStepIndex <= index
                  ? t(LOGISTIC_PROCESSING_MAPPING[step].activeTitleKey)
                  : t(LOGISTIC_PROCESSING_MAPPING[step].completeTitleKey)}
              </h4>
              {currentStepIndex === index ? (
                <div className="logistics-processing__step-description flex flex-middle padding-left-right-normal">
                  {LOGISTIC_PROCESSING_MAPPING[step].descriptionIcon || null}
                  <span>{t(LOGISTIC_PROCESSING_MAPPING[step].descriptionKey)}</span>
                  {LOGISTIC_PROCESSING_MAPPING[step].descriptionImage || null}
                </div>
              ) : null}
              {getBadWeatherStatus({
                currentStepIndex,
                index,
                orderDelayReason,
                checkBadWeather: LOGISTIC_PROCESSING_MAPPING[step].checkBadWeather,
              }) ? (
                <div className="logistics-processing__step-description flex flex-middle padding-left-right-normal">
                  <span>{t(RAINY_DESCRIPTION_MAPPING.badWeatherDescriptionKey)}</span>
                  {RAINY_DESCRIPTION_MAPPING.badWeatherImage}
                </div>
              ) : null}
            </li>
          );
        })}
      </ul>
      <IconExpandMore
        className="logistics-processing__icon-expand-more icon icon__small icon__default flex__shrink-fixed"
        onClick={() => setExpandProcessingList(!expandProcessingList)}
      />
    </div>
  );
}

LogisticsProcessing.propTypes = {
  useStorehubLogistics: PropTypes.bool,
  orderStatus: PropTypes.oneOf(Object.values(ORDER_STATUS)),
  orderDelayReason: PropTypes.oneOf(Object.values(ORDER_DELAY_REASON_CODES)),
};

LogisticsProcessing.defaultProps = {
  useStorehubLogistics: false,
  orderStatus: null,
  orderDelayReason: null,
};

export default compose(withTranslation('OrderingThankYou'))(LogisticsProcessing);
