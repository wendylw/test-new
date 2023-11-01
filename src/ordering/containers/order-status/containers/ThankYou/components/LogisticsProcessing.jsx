import React, { useState } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { useTranslation } from 'react-i18next';
import Constants from '../../../../../../utils/constants';
import { ORDER_DELAY_REASON_CODES } from '../constants';
import { getOrderStatus, getOrderDelayReason, getIsUseStorehubLogistics, getIsPreOrder } from '../../../redux/selector';
import { IconAccessTime, IconExpandMore } from '../../../../../../components/Icons';
import './LogisticsProcessing.scss';

const { ORDER_STATUS } = Constants;
const RAINY_DESCRIPTION_MAPPING = {
  badWeatherDescriptionKey: 'BadWeatherDescriptionKey',
  badWeatherImage: (
    <span className="margin-left-right-smaller text-line-height-base" role="img" aria-label="Cloud with Rain">
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
      <span className="margin-left-right-smaller text-line-height-base text-middle" role="img" aria-label="Goofy">
        😋
      </span>
    ),
  },
  [ORDER_STATUS.ACCEPTED]: {
    activeTitleKey: 'MerchantAccepted',
    completeTitleKey: 'RiderFound',
    descriptionKey: 'FindingRider',
    descriptionIcon: <IconAccessTime className="icon icon__smaller icon__default text-middle" />,
    checkBadWeather: true,
  },
  [ORDER_STATUS.CONFIRMED]: {
    activeTitleKey: 'PendingPickUp',
    descriptionKey: 'RiderAssigned',
    checkBadWeather: true,
  },
  [ORDER_STATUS.LOGISTICS_CONFIRMED]: {
    activeTitleKey: 'PendingPickUp',
    descriptionKey: 'RiderAssigned',
    checkBadWeather: true,
  },
};

function LogisticsProcessing({ isUseStorehubLogistics, isPreOrder, orderStatus, orderDelayReason }) {
  const { t } = useTranslation('OrderingThankYou');
  const [expandProcessingList, setExpandProcessingList] = useState(false);
  const preOrderPendingRiderConfirm = isPreOrder && [ORDER_STATUS.PAID, ORDER_STATUS.ACCEPTED].includes(orderStatus);

  if (
    !LOGISTIC_PROCESSING_MAPPING[orderStatus] ||
    preOrderPendingRiderConfirm ||
    (!isUseStorehubLogistics && orderStatus !== ORDER_STATUS.PAID)
  ) {
    return null;
  }

  const processingList = Object.keys(LOGISTIC_PROCESSING_MAPPING);
  const currentStatusIndex = processingList.findIndex(step => step === orderStatus);
  const currentStepIndex = currentStatusIndex > 2 ? 2 : currentStatusIndex;
  const rainyWeather = orderDelayReason === ORDER_DELAY_REASON_CODES.BAD_WEATHER;

  return (
    <div className="card padding-small margin-small flex flex-top flex-space-between">
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
                <>
                  {rainyWeather && currentStatusIndex > 1 ? null : (
                    <div className="logistics-processing__step-description flex flex-middle padding-left-right-normal">
                      <p>
                        {LOGISTIC_PROCESSING_MAPPING[step].descriptionIcon || null}
                        <span className="text-line-height-base text-middle">
                          {t(LOGISTIC_PROCESSING_MAPPING[step].descriptionKey)}
                        </span>
                        {LOGISTIC_PROCESSING_MAPPING[step].descriptionImage || null}
                      </p>
                    </div>
                  )}

                  {rainyWeather && LOGISTIC_PROCESSING_MAPPING[step].checkBadWeather ? (
                    <div className="logistics-processing__step-description flex flex-middle padding-left-right-normal">
                      <p>
                        <span className="text-line-height-base">
                          {t(RAINY_DESCRIPTION_MAPPING.badWeatherDescriptionKey)}
                        </span>
                        {RAINY_DESCRIPTION_MAPPING.badWeatherImage}
                      </p>
                    </div>
                  ) : null}
                </>
              ) : null}
            </li>
          );
        })}
      </ul>
      <IconExpandMore
        className="logistics-processing__icon-expand-more icon icon__small icon__default flex__shrink-fixed"
        data-test-id="ordering.order-status.thank-you.logistics-processing.expand-button"
        onClick={() => setExpandProcessingList(!expandProcessingList)}
      />
    </div>
  );
}

LogisticsProcessing.displayName = 'LogisticsProcessing';

LogisticsProcessing.propTypes = {
  isUseStorehubLogistics: PropTypes.bool,
  isPreOrder: PropTypes.bool,
  orderStatus: PropTypes.oneOf(Object.values(ORDER_STATUS)),
  orderDelayReason: PropTypes.oneOf(Object.values(ORDER_DELAY_REASON_CODES)),
};

LogisticsProcessing.defaultProps = {
  isUseStorehubLogistics: false,
  isPreOrder: false,
  orderStatus: null,
  orderDelayReason: null,
};

export default connect(state => ({
  isUseStorehubLogistics: getIsUseStorehubLogistics(state),
  isPreOrder: getIsPreOrder(state),
  orderStatus: getOrderStatus(state),
  orderDelayReason: getOrderDelayReason(state),
}))(LogisticsProcessing);
