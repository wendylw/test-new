import React, { useState } from 'react';
import PropTypes from 'prop-types';
import { useTranslation } from 'react-i18next';
import { connect } from 'react-redux';
import dayjs from 'dayjs';
import Constants from '../../../../../../utils/constants';
import Utils, { isValidUrl, copyDataToClipboard } from '../../../../../../utils/utils';
import { formatCompletePhoneNumber } from '../utils';
import { getOrderStoreName, getOrderDeliveryInfo } from '../redux/selector';
import { getOrderStatus, getIsUseStorehubLogistics, getOrder, getOrderStoreInfo } from '../../../redux/selector';
import Image from '../../../../../../components/Image';
import Modal from '../../../../../../components/Modal';

import logisticsGoget from '../../../../../../images/beep-logistics-goget.jpg';
import logisticsGrab from '../../../../../../images/beep-logistics-grab.jpg';
import logisticsLalamove from '../../../../../../images/beep-logistics-lalamove.jpg';
import logisticBeepOnFleet from '../../../../../../images/beep-logistics-on-fleet.jpg';
import logisticsMrspeedy from '../../../../../../images/beep-logistics-rspeedy.jpg';
import logisticsPandago from '../../../../../../images/beep-logistics-pamdago.jpg';
import './RiderInfo.scss';

const { ORDER_STATUS } = Constants;
const LOGISTICS_LOGOS_MAPPING = {
  grab: logisticsGrab,
  goget: logisticsGoget,
  lalamove: logisticsLalamove,
  mrspeedy: logisticsMrspeedy,
  onfleet: logisticBeepOnFleet,
  pandago: logisticsPandago,
};

function getDeliveredTimeRange(bestLastMileETA, worstLastMileETA) {
  if (!bestLastMileETA || !worstLastMileETA) {
    return null;
  }

  try {
    const bestLastMileTime = dayjs(bestLastMileETA).format('hh:mm');
    const worstLastMileTime = dayjs(worstLastMileETA).format('hh:mm A');

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
    return dayjs(deliveredTime).format('hh:mm A');
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
      href={`tel:${phone}`}
      className="rider-info__button button button__link flex__fluid-content text-center padding-normal text-weight-bolder text-uppercase"
    >
      {buttonText}
    </a>
  ) : (
    <button
      onClick={buttonClickEvent}
      className="rider-info__button button button__link flex__fluid-content padding-normal text-weight-bolder text-uppercase"
    >
      {buttonText}
    </button>
  );
};

RenderRiderInfoButton.displayName = 'RenderRiderInfoButton';

RenderRiderInfoButton.propTypes = {
  phone: PropTypes.string,
  supportCallPhone: PropTypes.bool,
  buttonText: PropTypes.string,
  buttonClickEvent: PropTypes.func,
};

RenderRiderInfoButton.defaultProps = {
  phone: null,
  supportCallPhone: false,
  buttonText: null,
  buttonClickEvent: () => {},
};

function RiderInfo({
  orderStatus,
  isUseStorehubLogistics,
  orderDeliveryInfo,
  storeLogo,
  storeName,
  order,
  storeInfo,
  inApp,
  visitReportPage,
}) {
  const { t } = useTranslation('OrderingThankYou');
  const { trackingUrl, courier, driverPhone, bestLastMileETA, worstLastMileETA } = orderDeliveryInfo || {};
  const { deliveredTime } = order || {};
  const { phone: storePhone } = storeInfo;
  const validDriverPhone = formatCompletePhoneNumber(driverPhone);
  const validStorePhone = formatCompletePhoneNumber(storePhone);
  const [displayCopyPhoneModalStatus, setDisplayCopyPhoneModalStatus] = useState(false);
  const [copyPhoneModalDescription, setCopyPhoneModalDescription] = useState(null);
  const logisticStatus = !isUseStorehubLogistics ? 'merchantDelivery' : orderStatus;
  const startedDeliveryStatusList = [ORDER_STATUS.CONFIRMED, ORDER_STATUS.LOGISTICS_CONFIRMED, ORDER_STATUS.PICKED_UP];
  const startedDeliveryStates = startedDeliveryStatusList.includes(orderStatus);
  const notStartedDeliveryStates = [
    ORDER_STATUS.CREATED,
    ORDER_STATUS.PENDING_PAYMENT,
    ORDER_STATUS.PENDING_VERIFICATION,
    ORDER_STATUS.PAID,
  ].includes(orderStatus);

  if (
    ![...startedDeliveryStatusList, ORDER_STATUS.DELIVERED].includes(orderStatus) ||
    (!isUseStorehubLogistics && notStartedDeliveryStates)
  ) {
    return null;
  }

  const logisticName = courier === 'onfleet' ? t('BeepFleet') : courier;
  const logisticPhone = isUseStorehubLogistics ? validDriverPhone : validStorePhone;
  const estimationInfo = {
    [ORDER_STATUS.PICKED_UP]: {
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
  const callStoreDisplayState = !isUseStorehubLogistics || inApp || Utils.isTNGMiniProgram();
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
      phone={validStorePhone}
      supportCallPhone={inApp}
      buttonText={t('CallStore')}
      buttonClickEvent={() =>
        handleCopyPhoneNumber(validStorePhone, logisticStatus === ORDER_STATUS.PICKED_UP ? 'drive' : 'store')
      }
    />
  );
  const callRiderButtonEl = (
    <RenderRiderInfoButton
      phone={validDriverPhone}
      supportCallPhone={inApp}
      buttonText={t('CallRider')}
      buttonClickEvent={() => handleCopyPhoneNumber(validDriverPhone, 'drive')}
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
    <>
      <div className="card margin-small flex ordering-thanks__rider flex-column">
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
          <div className="flex flex-middle">
            <div className="rider-info__logo-container">
              {isUseStorehubLogistics && courier ? (
                <figure className="rider-info__logo logo">
                  <img src={LOGISTICS_LOGOS_MAPPING[courier.toLowerCase()]} alt="Beep logistics provider" />
                </figure>
              ) : (
                <Image src={storeLogo} alt="Beep store logo" className="rider-info__logo logo" />
              )}
            </div>
            <div className="padding-left-right-normal margin-top-bottom-smaller text-left flex flex-column flex-space-between">
              <p className="line-height-normal text-weight-bolder">
                {isUseStorehubLogistics && logisticName ? logisticName : t('DeliveryBy', { name: storeName })}
              </p>
              {logisticPhone ? <span className="text-gray line-height-normal">{logisticPhone}</span> : null}
            </div>
          </div>
        </div>
        <div className="flex flex-bottom">
          {logisticStatus === ORDER_STATUS.DELIVERED ? (
            <button
              className="rider-info__button button button__link flex__fluid-content padding-normal text-weight-bolder text-uppercase"
              onClick={() => visitReportPage()}
              data-heap-name="ordering.need-help.report-driver-btn"
            >
              {t('ReportIssue')}
            </button>
          ) : null}

          {startedDeliveryStates ? (
            <>
              {callStoreDisplayState ? callStoreButtonEl : trackingOrderButtonEl}
              {callRiderButtonEl}
            </>
          ) : null}
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
    </>
  );
}

RiderInfo.displayName = 'RiderInfo';

RiderInfo.propTypes = {
  orderStatus: PropTypes.string,
  isUseStorehubLogistics: PropTypes.bool,
  orderDeliveryInfo: PropTypes.shape({
    courier: PropTypes.string,
    bestLastMileETA: PropTypes.string,
    worstLastMileETA: PropTypes.string,
    driverPhone: PropTypes.string,
    trackingUrl: PropTypes.string,
  }),
  storeLogo: PropTypes.string,
  storeName: PropTypes.string,
  // eslint-disable-next-line react/forbid-prop-types
  order: PropTypes.object,
  storeInfo: PropTypes.shape({
    phone: PropTypes.string,
  }),
  inApp: PropTypes.bool,
  visitReportPage: PropTypes.func,
};

RiderInfo.defaultProps = {
  orderStatus: null,
  storeLogo: null,
  storeName: null,
  inApp: false,
  order: {},
  storeInfo: {
    phone: null,
  },
  orderDeliveryInfo: {
    courier: null,
    bestLastMileETA: null,
    worstLastMileETA: null,
    driverPhone: null,
    trackingUrl: null,
  },
  isUseStorehubLogistics: true,
  visitReportPage: () => {},
};

export default connect(state => ({
  order: getOrder(state),
  storeInfo: getOrderStoreInfo(state),
  orderStatus: getOrderStatus(state),
  storeName: getOrderStoreName(state),
  isUseStorehubLogistics: getIsUseStorehubLogistics(state),
  orderDeliveryInfo: getOrderDeliveryInfo(state),
}))(RiderInfo);
