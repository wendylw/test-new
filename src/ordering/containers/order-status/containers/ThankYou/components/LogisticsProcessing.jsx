import React from 'react';
import PropTypes from 'prop-types';
import { withTranslation } from 'react-i18next';
import { compose } from 'redux';
import { IconAccessTime } from '../../../../../../components/Icons';
import Constants from '../../../../../../utils/constants';
import './LogisticsProcessing.scss';

const { ORDER_STATUS } = Constants;
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
  },
  [ORDER_STATUS.CONFIRMED]: {
    activeTitleKey: 'PendingPickUp',
    descriptionKey: 'RiderAssigned',
  },
  [ORDER_STATUS.LOGISTIC_CONFIRMED]: {
    activeTitleKey: 'PendingPickUp',
    descriptionKey: 'RiderAssigned',
  },
};

function LogisticsProcessing({ t, useStorehubLogistics, orderStatus }) {
  if (!LOGISTIC_PROCESSING_MAPPING[orderStatus] || (!useStorehubLogistics && orderStatus !== ORDER_STATUS.PAID)) {
    return null;
  }

  const processingList = Object.keys(LOGISTIC_PROCESSING_MAPPING);
  const currentStatusIndex = processingList.findIndex(step => step === orderStatus);
  const currentStepIndex = currentStatusIndex > 2 ? 2 : currentStatusIndex;

  return (
    <div className="card padding-normal margin-normal">
      <ul>
        {processingList.map((step, index) => {
          if (index === processingList.length - 1) {
            return null;
          }

          const itemClassList = ['logistics-processing__step padding-left-right-normal'];
          const titleClassList = ['logistics-processing__step-title padding-left-right-normal text-line-height-base'];

          if (index < currentStepIndex) {
            itemClassList.push('logistics-processing__step--complete');
          } else if (index === currentStepIndex) {
            itemClassList.push('logistics-processing__step--active');
            titleClassList.push('text-weight-bolder');
          }

          return (
            <li className={itemClassList.join(' ')} key={`beep-logistics-${step}-status`}>
              <i className="logistics-processing__icon" />
              <h4 className={titleClassList.join(' ')}>
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
            </li>
          );
        })}
      </ul>
    </div>
  );
}

LogisticsProcessing.propTypes = {
  useStorehubLogistics: PropTypes.bool,
  orderStatus: PropTypes.string,
};

LogisticsProcessing.defaultProps = {
  useStorehubLogistics: false,
  orderStatus: null,
};

export default compose(withTranslation('OrderingThankYou'))(LogisticsProcessing);
