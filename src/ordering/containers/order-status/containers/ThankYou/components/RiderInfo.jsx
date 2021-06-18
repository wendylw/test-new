import React, { useState } from 'react';
import PropTypes from 'prop-types';
import { withTranslation } from 'react-i18next';
import { compose } from 'redux';
import Constants from '../../../../../../utils/constants';
import { isValidUrl, copyDataToClipboard } from '../../../../../../utils/utils';
import { formatTo12hour } from '../../../../../../utils/time-lib';
import Image from '../../../../../../components/Image';
import Modal from '../../../../../../components/Modal';

import logisticsGoget from '../../../../../../images/beep-logistics-goget.jpg';
import logisticsGrab from '../../../../../../images/beep-logistics-grab.jpg';
import logisticsLalamove from '../../../../../../images/beep-logistics-lalamove.jpg';
import logisticBeepOnFleet from '../../../../../../images/beep-logistics-on-fleet.jpg';
import logisticsMrspeedy from '../../../../../../images/beep-logistics-rspeedy.jpg';
import './RiderInfo.scss';

const { ORDER_STATUS } = Constants;
const LOGISTICS_LOGOS_MAPPING = {
  grab: logisticsGrab,
  goget: logisticsGoget,
  lalamove: logisticsLalamove,
  mrspeedy: logisticsMrspeedy,
  onfleet: logisticBeepOnFleet,
};

function getDeliveredTimeRange(bestLastMileETA, worstLastMileETA) {
  if (!bestLastMileETA || !worstLastMileETA) {
    return null;
  }

  try {
    const bestLastMileTime = formatTo12hour(bestLastMileETA, false);
    const worstLastMileTime = formatTo12hour(bestLastMileETA);

    return `${bestLastMileTime} - ${worstLastMileTime}`;
  } catch (e) {
    console.error('bestLastMileTime or worstLastMileTime is invalid');

    return null;
  }
}

function getDeliveredTime(deliveredTime) {
  if (!deliveredTime) {
    return null;
  }

  try {
    return formatTo12hour(deliveredTime);
  } catch (e) {
    console.error('deliveredTime is invalid');

    return null;
  }
}

const RenderRiderInfoButton = ({ phone, supportCallPhone, buttonText, buttonClickEvent }) => {
  if (!phone) {
    return null;
  }

  return supportCallPhone ? (
    <a
      href={`tel:+${phone}`}
      className="rider-info__button button button__link flex__fluid-content text-center padding-normal text-weight-bolder text-uppercase"
    >
      {buttonText}
    </a>
  ) : (
    <button
      onClick={() => buttonClickEvent}
      className="rider-info__button button button__link flex__fluid-content padding-normal text-weight-bolder text-uppercase"
    >
      {buttonText}
    </button>
  );
};

function RiderInfo({
  t,
  status,
  useStorehubLogistics,
  courier,
  storeLogo,
  storeName,
  bestLastMileETA,
  worstLastMileETA,
  deliveredTime,
  storePhone,
  driverPhone,
  trackingUrl,
  inApp,
  supportCallPhone,
  visitReportPage,
}) {
  const [displayCopyPhoneModalStatus, setDisplayCopyPhoneModalStatus] = useState(false);
  const [copyPhoneModalDescription, setCopyPhoneModalDescription] = useState(null);
  const logisticStatus = !useStorehubLogistics ? 'merchantDelivery' : status;
  const startedDeliveryStates = [
    ORDER_STATUS.CONFIRMED,
    ORDER_STATUS.LOGISTICS_CONFIRMED,
    ORDER_STATUS.LOGISTICS_PICKED_UP,
  ].includes(logisticStatus);
  const notStartedDeliveryStates = [
    ORDER_STATUS.CREATED,
    ORDER_STATUS.PENDING_PAYMENT,
    ORDER_STATUS.PENDING_VERIFICATION,
    ORDER_STATUS.PAID,
  ];

  if (!startedDeliveryStates || (!useStorehubLogistics && notStartedDeliveryStates.includes(status))) {
    return null;
  }

  const logisticName = courier === 'onfleet' ? t('BeepFleet') : courier;
  const logisticPhone = useStorehubLogistics ? driverPhone && `+${driverPhone}` : storePhone;
  const estimationInfo = {
    [ORDER_STATUS.LOGISTICS_PICKED_UP]: {
      title: t('OrderStatusPickedUp'),
      deliveredTime: getDeliveredTimeRange(bestLastMileETA, worstLastMileETA),
    },
    [ORDER_STATUS.DELIVERED]: {
      title: t('OrderStatusDelivered'),
      deliveredTime: getDeliveredTime(deliveredTime),
    },
    merchantDelivery: {
      title: t('SelfDeliveryDescription'),
    },
  };
  const callStoreDisplayState = !useStorehubLogistics || (useStorehubLogistics && startedDeliveryStates && inApp);
  const handleCopyPhoneNumber = (phone, phoneName) => {
    const result = copyDataToClipboard(phone);

    if (result) {
      setDisplayCopyPhoneModalStatus(true);
      setCopyPhoneModalDescription(
        phoneName === 'store' ? t('CopyStoreDescription', { phone }) : t('CopyDriverDescription', { phone })
      );
    } else {
      console.error('can not copy phone number');
    }
  };
  const callStoreButtonEl = (
    <RenderRiderInfoButton
      phone={storePhone}
      supportCallPhone={supportCallPhone}
      buttonText={t('CallStore')}
      buttonClickEvent={handleCopyPhoneNumber(
        storePhone,
        logisticStatus === ORDER_STATUS.LOGISTICS_PICKED_UP ? 'drive' : 'store'
      )}
    />
  );
  const callRiderButtonEl = (
    <RenderRiderInfoButton
      phone={driverPhone}
      supportCallPhone={supportCallPhone}
      buttonText={t('CallRider')}
      buttonClickEvent={handleCopyPhoneNumber(`+${driverPhone}`, 'drive')}
    />
  );
  const trackingOrderButtonEl =
    trackingUrl && isValidUrl(trackingUrl) ? (
      <a
        href={trackingUrl}
        className="rider-info__button button button__link flex__fluid-content text-center padding-normal text-weight-bolder text-uppercase"
        target="__blank"
        data-heap-name="ordering.thank-you.logistics-tracking-link"
      >
        {t('TrackOrder')}
      </a>
    ) : null;

  return (
    <React.Fragment>
      <div className="card margin-normal flex ordering-thanks__rider flex-column">
        <div className="padding-normal">
          {estimationInfo[logisticStatus] ? (
            <div className="rider-info__time-container padding-top-bottom-normal">
              <h3 className="rider-info__time-title margin-top-bottom-small text-size-big text-line-height-base">
                {t(estimationInfo[logisticStatus].title)}
              </h3>
              {estimationInfo[logisticStatus].deliveredTime ? (
                <span className="rider-info__time margin-top-bottom-small text-size-huge text-weight-bolder">
                  {estimationInfo[logisticStatus].deliveredTime}
                </span>
              ) : null}
            </div>
          ) : null}
          <div className={`flex  flex-middle`}>
            <div className="rider-info__logo-container">
              {useStorehubLogistics && courier ? (
                <figure className="rider-info__logo logo">
                  <img src={LOGISTICS_LOGOS_MAPPING[courier.toLowerCase()]} alt="Beep logistics provider" />
                </figure>
              ) : (
                <Image src={storeLogo} alt="Beep store logo" className="rider-info__logo logo" />
              )}
            </div>
            <div className="padding-left-right-normal margin-top-bottom-smaller text-left flex flex-column flex-space-between">
              <p className="line-height-normal text-weight-bolder">
                {useStorehubLogistics && logisticName ? logisticName : t('DeliveryBy', { name: storeName })}
              </p>
              {logisticPhone ? <span className="text-gray line-height-normal">{logisticPhone}</span> : null}
            </div>
          </div>
        </div>
        <div className="flex flex-bottom">
          {logisticStatus === ORDER_STATUS.DELIVERED ? (
            <button
              className="rider-info__button button button__link flex__fluid-content padding-normal text-weight-bolder text-uppercase"
              onClick={() => {
                if (![ORDER_STATUS.DELIVERED, ORDER_STATUS.LOGISTICS_PICKED_UP].includes(status)) {
                  return;
                }

                visitReportPage();
              }}
              data-heap-name="ordering.need-help.report-driver-btn"
            >
              {t('ReportIssue')}
            </button>
          ) : null}

          {callStoreDisplayState ? callStoreButtonEl : trackingOrderButtonEl}
          {startedDeliveryStates ? callRiderButtonEl : null}
        </div>
      </div>
      <Modal show={displayCopyPhoneModalStatus} className="rider-info__modal modal">
        <Modal.Body className="padding-normal text-center">
          <h2 className="padding-small text-size-biggest text-weight-bolder">{t('CopyTitle')}</h2>
          <p className="modal__text padding-top-bottom-small">{copyPhoneModalDescription}</p>
        </Modal.Body>
        <Modal.Footer className="padding-normal">
          <button
            className="button button__fill button__block text-weight-bolder text-uppercase"
            onClick={() => {
              setDisplayCopyPhoneModalStatus(false);
              setCopyPhoneModalDescription(null);
            }}
          >
            {t('OK')}
          </button>
        </Modal.Footer>
      </Modal>
    </React.Fragment>
  );
}

RiderInfo.propTypes = {
  status: PropTypes.string,
  useStorehubLogistics: PropTypes.bool,
  courier: PropTypes.string,
  storeLogo: PropTypes.string,
  storeName: PropTypes.string,
  bestLastMileETA: PropTypes.string,
  worstLastMileETA: PropTypes.string,
  deliveredTime: PropTypes.string,
  storePhone: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
  driverPhone: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
  trackingUrl: PropTypes.string,
  inApp: PropTypes.bool,
  supportCallPhone: PropTypes.bool,
  visitReportPage: PropTypes.func,
};

RiderInfo.defaultProps = {
  useStorehubLogistics: true,
  supportCallPhone: false,
  visitReportPage: () => {},
};

export default compose(withTranslation('OrderingThankYou'))(RiderInfo);
