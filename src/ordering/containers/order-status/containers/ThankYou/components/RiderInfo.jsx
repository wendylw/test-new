import qs from 'qs';
import React from 'react';
import PropTypes from 'prop-types';
import { withTranslation, Trans } from 'react-i18next';
import { compose } from 'redux';
import Constants from '../../../../../../utils/constants';
import Utils from '../../../../../../utils/utils';
import Image from '../../../../../../components/Image';

import logisticsGoget from '../../../../../../images/beep-logistics-goget.jpg';
import logisticsGrab from '../../../../../../images/beep-logistics-grab.jpg';
import logisticsLalamove from '../../../../../../images/beep-logistics-lalamove.jpg';
import logisticBeepOnFleet from '../../../../../../images/beep-logistics-on-fleet.jpg';
import logisticsMrspeedy from '../../../../../../images/beep-logistics-rspeedy.jpg';
import './RiderInfo.scss';

const { AVAILABLE_REPORT_DRIVER_ORDER_STATUSES, ORDER_STATUS } = Constants;
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
  trackingUrl,

  supportCallPhone,
  order,

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
}) {
  // const { logo: storeLogo } = onlineStoreInfo;
  // const getLogisticsLogo = (logistics = '') => {
  //   switch (logistics.toLowerCase()) {
  //     case 'grab':
  //       return logisticsGrab;
  //     case 'goget':
  //       return logisticsGoget;
  //     case 'lalamove':
  //       return logisticsLalamove;
  //     case 'mrspeedy':
  //       return logisticsMrspeedy;
  //     case 'onfleet':
  //       return logisticBeepOnFleet;
  //     default:
  //       return logisticBeepOnFleet;
  //   }
  // };
  const isReportUnsafeDriverButtonDisabled = () => {
    const { status } = order || {};

    return !AVAILABLE_REPORT_DRIVER_ORDER_STATUSES.includes(status);
  };
  const handleReportUnsafeDriver = () => {
    if (isReportUnsafeDriverButtonDisabled()) {
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

  return (
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
          <div className="margin-top-bottom-smaller padding-left-right-normal text-left flex flex-column flex-space-between">
            <p className="line-height-normal text-weight-bolder">
              {useStorehubLogistics && logisticName ? logisticName : t('DeliveryBy', { name: storeName })}
            </p>
            {logisticPhone ? <span className="text-gray line-height-normal">{logisticPhone}</span> : null}
          </div>
        </div>
      </div>
      <div>
        <button></button>
        <a href=""></a>
      </div>
      {!useStorehubLogistics ? (
        status !== 'paid' &&
        storePhone && (
          <div className="ordering-thanks__button button text-uppercase flex  flex-center ordering-thanks__button-card-link">
            {Utils.isWebview() && !supportCallPhone ? (
              <a
                href="javascript:void(0)"
                onClick={() => copyPhoneNumber(storePhone, 'store')}
                className="text-weight-bolder button ordering-thanks__button-link ordering-thanks__link"
              >
                {t('CallStore')}
              </a>
            ) : (
              <a
                href={`tel:+${storePhone}`}
                className="text-weight-bolder button ordering-thanks__button-link ordering-thanks__link"
              >
                {t('CallStore')}
              </a>
            )}
          </div>
        )
      ) : (
        <div className="ordering-thanks__button button text-uppercase flex  flex-center ordering-thanks__button-card-link">
          {status === 'confirmed' && (
            <React.Fragment>
              {storePhone &&
                (Utils.isWebview() ? (
                  !supportCallPhone ? (
                    <a
                      href="javascript:void(0)"
                      className="text-weight-bolder button ordering-thanks__button-link ordering-thanks__link text-uppercase"
                      onClick={() => copyPhoneNumber(storePhone, 'store')}
                    >
                      {t('CallStore')}
                    </a>
                  ) : (
                    <a
                      href={`tel:+${storePhone}`}
                      className="text-weight-bolder button ordering-thanks__button-link ordering-thanks__link"
                    >
                      {t('CallStore')}
                    </a>
                  )
                ) : trackingUrl && Utils.isValidUrl(trackingUrl) ? (
                  <a
                    href={trackingUrl}
                    className="text-weight-bolder button ordering-thanks__link ordering-thanks__button-link"
                    target="__blank"
                    data-heap-name="ordering.thank-you.logistics-tracking-link"
                  >
                    {t('TrackOrder')}
                  </a>
                ) : null)}
              {Utils.isWebview() && !supportCallPhone ? (
                <a
                  href="javascript:void(0)"
                  onClick={() => copyPhoneNumber(driverPhone, 'drive')}
                  className="text-weight-bolder button ordering-thanks__link text-uppercase"
                >
                  {t('CallRider')}
                </a>
              ) : (
                <a href={`tel:+${driverPhone}`} className="text-weight-bolder button ordering-thanks__link">
                  {t('CallRider')}
                </a>
              )}
            </React.Fragment>
          )}

          {status === 'riderPickUp' && (
            <React.Fragment>
              {Utils.isWebview() ? (
                !supportCallPhone ? (
                  <a
                    href="javascript:void(0)"
                    onClick={() => copyPhoneNumber(storePhone, 'drive')}
                    className="text-weight-bolder button ordering-thanks__link text-uppercase ordering-thanks__button-link"
                  >
                    {t('CallStore')}
                  </a>
                ) : (
                  <a
                    href={`tel:+${storePhone}`}
                    className="text-weight-bolder button ordering-thanks__link ordering-thanks__button-link"
                  >
                    {t('CallStore')}
                  </a>
                )
              ) : trackingUrl && Utils.isValidUrl(trackingUrl) ? (
                <a
                  href={trackingUrl}
                  className="text-weight-bolder button ordering-thanks__link ordering-thanks__button-link"
                  target="__blank"
                  data-heap-name="ordering.thank-you.logistics-tracking-link"
                >
                  {t('TrackOrder')}
                </a>
              ) : null}
              {Utils.isWebview() && !supportCallPhone ? (
                <a
                  href="javascript:void(0)"
                  onClick={() => copyPhoneNumber(driverPhone, 'drive')}
                  className="text-weight-bolder button ordering-thanks__link text-uppercase"
                >
                  {t('CallRider')}
                </a>
              ) : (
                <a href={`tel:+${driverPhone}`} className="text-weight-bolder button ordering-thanks__link">
                  {t('CallRider')}
                </a>
              )}
            </React.Fragment>
          )}

          {status === 'delivered' && (
            <React.Fragment>
              <button
                className="text-weight-bolder button text-uppercase text-center ordering-thanks__button-card-link"
                onClick={handleReportUnsafeDriver}
                data-heap-name="ordering.need-help.report-driver-btn"
              >
                {t('ReportIssue')}
              </button>
            </React.Fragment>
          )}
        </div>
      )}
    </div>
  );
}

RiderInfo.propTypes = {};

RiderInfo.defaultProps = {};

export default compose(withTranslation('OrderingThankYou'))(RiderInfo);
