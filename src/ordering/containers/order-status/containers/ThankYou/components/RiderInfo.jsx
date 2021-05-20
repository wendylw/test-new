import qs from 'qs';
import React from 'react';
import PropTypes from 'prop-types';
import { withTranslation } from 'react-i18next';
import { compose } from 'redux';
import Constants from '../../../../../../utils/constants';
import Utils from '../../../../../../utils/utils';
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

function getDeliveredTimeRange(bestLastMileETA, worstLastMileETA, timeUnit) {
  if (!bestLastMileETA || !worstLastMileETA) {
    return null;
  }

  try {
    const bestTime = new Date(bestLastMileETA);
    const worstTime = new Date(worstLastMileETA);
    const bestLastMileTime = `${Utils.zero(bestTime.getHours())}:${Utils.zero(bestTime.getMinutes())}`;
    const worstLastMileTime = `${Utils.zero(worstTime.getHours())}:${Utils.zero(worstTime.getMinutes())}`;

    return `${bestLastMileTime} - ${worstLastMileTime} ${timeUnit}`;
  } catch (e) {
    return null;
  }
}

function getDeliveredTime(deliveredTime, timeUnit) {
  if (!deliveredTime) {
    return null;
  }

  try {
    const time = new Date(deliveredTime);

    return `${Utils.zero(time.getHours())}:${Utils.zero(time.getMinutes())} ${timeUnit}`;
  } catch (e) {
    return null;
  }
}

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
}) {
  const handleReportUnsafeDriver = () => {
    if (![ORDER_STATUS.DELIVERED, ORDER_STATUS.LOGISTICS_PICKED_UP].includes(status)) {
      return;
    }

    const queryParams = {
      receiptNumber: Utils.getQueryString('receiptNumber'),
    };

    this.props.history.push({
      pathname: Constants.ROUTER_PATHS.REPORT_DRIVER,
      search: qs.stringify(queryParams, { addQueryPrefix: true }),
    });
  };
  const copyPhoneNumber = (phone, PhoneName) => {
    const input = document.createElement('input');
    const title = t('CopyTitle');
    const content =
      PhoneName === 'store' ? t('CopyStoreDescription', { phone }) : t('CopyDriverDescription', { phone });

    input.setAttribute('readonly', 'readonly');
    input.setAttribute('value', '+' + phone);
    document.body.appendChild(input);
    input.setSelectionRange(0, 9999);
    if (document.execCommand('copy')) {
      input.select();
      document.execCommand('copy');
      this.setState({
        showPhoneCopy: true,
        phoneCopyTitle: title,
        phoneCopyContent: content,
      });
    }
    document.body.removeChild(input);
  };

  const logisticStatus = !useStorehubLogistics ? 'merchantDelivery' : status;
  const logisticName = courier === 'onfleet' ? t('BeepFleet') : courier;
  const logisticPhone = useStorehubLogistics ? driverPhone && `+${driverPhone}` : storePhone;
  const estimationInfo = {
    [ORDER_STATUS.LOGISTICS_PICKED_UP]: {
      title: t('OrderStatusPickedUp'),
      deliveredTime: getDeliveredTimeRange(bestLastMileETA, worstLastMileETA, Utils.getTimeUnit(bestLastMileETA)),
    },
    [ORDER_STATUS.DELIVERED]: {
      title: t('OrderStatusDelivered'),
      deliveredTime: getDeliveredTime(deliveredTime, Utils.getTimeUnit(deliveredTime)),
    },
    merchantDelivery: {
      title: t('SelfDeliveryDescription'),
    },
  };
  const beginningDeliveryStates = [
    ORDER_STATUS.CONFIRMED,
    ORDER_STATUS.LOGISTICS_CONFIRMED,
    ORDER_STATUS.LOGISTICS_PICKED_UP,
  ].includes(logisticStatus);
  const callStoreDisplayState = !useStorehubLogistics || (useStorehubLogistics && beginningDeliveryStates && inApp);
  let callStoreButtonEl = null;
  let callRiderButtonEl = null;
  const trackingOrderButtonEl =
    trackingUrl && Utils.isValidUrl(trackingUrl) ? (
      <a
        href={trackingUrl}
        className="rider-info__button button button__link flex__fluid-content text-center padding-normal text-weight-bolder text-uppercase"
        target="__blank"
        data-heap-name="ordering.thank-you.logistics-tracking-link"
      >
        {t('TrackOrder')}
      </a>
    ) : null;

  if (storePhone) {
    callStoreButtonEl = supportCallPhone ? (
      <a
        href={`tel:+${storePhone}`}
        className="rider-info__button button button__link flex__fluid-content text-center padding-normal text-weight-bolder text-uppercase"
      >
        {t('CallStore')}
      </a>
    ) : (
      <button
        onClick={() =>
          copyPhoneNumber(storePhone, logisticStatus === ORDER_STATUS.LOGISTICS_PICKED_UP ? 'drive' : 'store')
        }
        className="rider-info__button button button__link flex__fluid-content padding-normal text-weight-bolder text-uppercase"
      >
        {t('CallStore')}
      </button>
    );
  }

  if (driverPhone) {
    callRiderButtonEl = supportCallPhone ? (
      <a
        href={`tel:+${driverPhone}`}
        className="rider-info__button button button__link flex__fluid-content text-center padding-normal text-weight-bolder text-uppercase"
      >
        {t('CallStore')}
      </a>
    ) : (
      <button
        onClick={() => copyPhoneNumber(driverPhone, 'drive')}
        className="rider-info__button button button__link flex__fluid-content padding-normal text-weight-bolder text-uppercase"
      >
        {t('CallStore')}
      </button>
    );
  }

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
              onClick={handleReportUnsafeDriver}
              data-heap-name="ordering.need-help.report-driver-btn"
            >
              {t('ReportIssue')}
            </button>
          ) : null}

          {callStoreDisplayState ? callStoreButtonEl : trackingOrderButtonEl}
          {beginningDeliveryStates ? callRiderButtonEl : null}
        </div>
      </div>
      <Modal show={true} className="rider-info__modal modal">
        <Modal.Body className="padding-normal text-center">
          <h2 className="padding-small text-size-biggest text-weight-bolder">{'this.state.phoneCopyTitle'}</h2>
          <p className="modal__text padding-top-bottom-small">{'this.state.phoneCopyContent'}</p>
        </Modal.Body>
        <Modal.Footer className="padding-normal">
          <button
            className="button button__fill button__block text-weight-bolder text-uppercase"
            onClick={() => {
              this.setState({
                showPhoneCopy: false,
                phoneCopyTitle: '',
                phoneCopyContent: '',
              });
            }}
          >
            {t('OK')}
          </button>
        </Modal.Footer>
      </Modal>
    </React.Fragment>
  );
}

RiderInfo.propTypes = {};

RiderInfo.defaultProps = {};

export default compose(withTranslation('OrderingThankYou'))(RiderInfo);
