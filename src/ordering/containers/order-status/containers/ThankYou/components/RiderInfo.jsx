import React, { useState } from 'react';
import PropTypes from 'prop-types';
import { useTranslation } from 'react-i18next';
import { connect } from 'react-redux';
import dayjs from 'dayjs';
import Constants from '../../../../../../utils/constants';
import { isValidUrl, copyDataToClipboard } from '../../../../../../utils/utils';
import logger from '../../../../../../utils/monitoring/logger';
import { formatCompletePhoneNumber } from '../utils';
import { getOrderStoreName, getOrderDeliveryInfo, getIsOrderSelfDelivery } from '../redux/selector';
import { getIsAlipayMiniProgram } from '../../../../../redux/modules/app';
import { getOrderStatus, getIsUseStorehubLogistics, getOrder, getOrderStoreInfo } from '../../../redux/selector';
import Image from '../../../../../../components/Image';
import Modal from '../../../../../../components/Modal';

import logisticsGoget from '../../../../../../images/beep-logistics-goget.jpg';
import logisticsGrab from '../../../../../../images/beep-logistics-grab.jpg';
import logisticsLalamove from '../../../../../../images/beep-logistics-lalamove.jpg';
import logisticBeepOnFleet from '../../../../../../images/beep-logistics-on-fleet.jpg';
import logisticsMrspeedy from '../../../../../../images/beep-logistics-rspeedy.jpg';
import logisticsBorzo from '../../../../../../images/beep-logistics-borzo.svg';
import logisticsPandago from '../../../../../../images/beep-logistics-pamdago.jpg';
import './RiderInfo.scss';

const { ORDER_STATUS, LOGISTICS_RIDER_TYPE } = Constants;
const LOGISTICS_LOGOS_MAPPING = {
  grab: logisticsGrab,
  goget: logisticsGoget,
  lalamove: logisticsLalamove,
  // WB-4715: mrspeedy & borzo are same logistics provider
  // new orders use borzo, old orders keep mrspeddy
  mrspeedy: logisticsMrspeedy,
  borzo: logisticsBorzo,
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
  } catch (error) {
    logger.error('Ordering_ThankYou_BestLastMileTimeOrWorstLastMileTimeIsInvalid', { message: error?.message || '' });

    return null;
  }
}

function getDeliveredTime(deliveredTime) {
  if (!deliveredTime) {
    return null;
  }

  try {
    return dayjs(deliveredTime).format('hh:mm A');
  } catch (error) {
    logger.error('Ordering_ThankYou_GetDeliveredTimeFailed', { message: error?.message || '' });

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
      data-test-id="ordering.order-status.thank-you.call-btn"
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
  isAlipayMiniProgram,
  isOrderSelfDelivery,
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

  // eslint-disable-next-line consistent-return
  const logisticName = () => {
    switch (courier) {
      case LOGISTICS_RIDER_TYPE.GRAB:
        return t('Grab');
      case LOGISTICS_RIDER_TYPE.GO_GET:
        return t('GoGet');
      case LOGISTICS_RIDER_TYPE.LA_LA_MOVE:
        return t('LaLaMove');
      // WB-4715: mrspeedy & borzo are same logistics provider
      // new orders use borzo, old orders keep mrspeddy
      case LOGISTICS_RIDER_TYPE.MR_SPEEDY:
        return t('MrSpeedy');
      case LOGISTICS_RIDER_TYPE.BORZO:
        return t('Borzo');
      case LOGISTICS_RIDER_TYPE.ON_FLEET:
        return 'BeepFleet';
      case LOGISTICS_RIDER_TYPE.PAN_DAGO:
        return t('PanDaGo');
      default:
        courier;
    }
  };

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
  const callStoreDisplayState = !isUseStorehubLogistics || inApp || isAlipayMiniProgram;
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
        data-test-id="ordering.thank-you.logistics-tracking-link"
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
                {isUseStorehubLogistics && logisticName() ? logisticName() : t('DeliveryBy', { name: storeName })}
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
              data-test-id="ordering.need-help.report-driver-btn"
            >
              {t('ReportIssue')}
            </button>
          ) : null}

          {startedDeliveryStates ? (
            <>
              {callStoreDisplayState ? callStoreButtonEl : trackingOrderButtonEl}
              {isOrderSelfDelivery ? null : callRiderButtonEl}
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
            data-test-id="ordering.order-status.thank-you.ok-btn"
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
  isAlipayMiniProgram: PropTypes.bool,
  isOrderSelfDelivery: PropTypes.bool,
  visitReportPage: PropTypes.func,
};

RiderInfo.defaultProps = {
  orderStatus: null,
  storeLogo: null,
  storeName: null,
  inApp: false,
  isAlipayMiniProgram: false,
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
  isOrderSelfDelivery: false,
  visitReportPage: () => {},
};

export default connect(state => ({
  order: getOrder(state),
  storeInfo: getOrderStoreInfo(state),
  orderStatus: getOrderStatus(state),
  storeName: getOrderStoreName(state),
  isUseStorehubLogistics: getIsUseStorehubLogistics(state),
  orderDeliveryInfo: getOrderDeliveryInfo(state),
  isAlipayMiniProgram: getIsAlipayMiniProgram(state),
  isOrderSelfDelivery: getIsOrderSelfDelivery(state),
}))(RiderInfo);
