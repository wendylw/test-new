import React from 'react';
import PropTypes from 'prop-types';
import { withTranslation } from 'react-i18next';
import { compose } from 'redux';
import Constants from '../../../../../../utils/constants';

const { ORDER_STATUS } = Constants;

function LogisticsProcessing({ t, ORDER_STATUS, deliveryInformation, order }) {
  const { PAID, ACCEPTED, LOGISTIC_CONFIRMED, CONFIMRMED, PICKUP, DELIVERED } = ORDER_STATUS;
  let { status } = order || {};
  let { useStorehubLogistics } = deliveryInformation && deliveryInformation[0] ? deliveryInformation[0] : {};

  let currentStatusObj = {};
  /** paid status */
  if (status === PAID) {
    currentStatusObj = {
      status: 'paid',
      style: {
        width: '25%',
      },
      firstNote: t('OrderReceived'),
      secondNote: t('OrderReceivedDescription'),
    };
  }

  /** accepted status */
  if (status === ACCEPTED) {
    currentStatusObj = {
      status: 'accepted',
      style: {
        width: '50%',
      },
      firstNote: t('MerchantAccepted'),
      secondNote: t('FindingRider'),
    };
  }

  /** logistic confirmed and confirmed */
  if (status === CONFIMRMED || status === LOGISTIC_CONFIRMED) {
    currentStatusObj = {
      status: 'confirmed',
      style: {
        width: '75%',
      },
      firstNote: t('PendingPickUp'),
      secondNote: t('RiderAssigned'),
    };
  }

  /** pickup status */
  if (status === PICKUP) {
    currentStatusObj = {
      status: 'riderPickUp',
      style: {
        width: '100%',
      },
      firstNote: t('RiderPickUp'),
      secondNote: t('TrackYourOrder'),
    };
  }

  if (status === DELIVERED) {
    currentStatusObj = {
      status: 'delivered',
      style: {
        width: '100%',
      },
      firstNote: t('OrderDelivered'),
      secondNote: t('OrderDeliveredDescription'),
    };
  }

  const isShowProgress = ['paid', 'accepted', 'confirmed'].includes(currentStatusObj.status);

  return (
    <React.Fragment>
      {currentStatusObj.status === 'cancelled' ? null : (!useStorehubLogistics && currentStatusObj.status !== 'paid') ||
        !isShowProgress ? null : (
        <div className="card text-center margin-normal flex">
          <div className="padding-small margin-left-right-smaller text-left">
            {currentStatusObj.status === 'paid' ? (
              <React.Fragment>
                <h4
                  className={`flex flex-middle text-size-big text-weight-bolder line-height-normal ordering-thanks__paid padding-left-right-small`}
                >
                  <i className="ordering-thanks__active "></i>
                  <span className="padding-left-right-normal text-weight-bolder margin-left-right-smaller">
                    {currentStatusObj.firstNote}
                  </span>
                </h4>
                <div className="flex flex-middle line-height-normal text-gray padding-left-right-normal">
                  <p className="ordering-thanks__description text-size-big padding-left-right-normal margin-left-right-smaller">
                    <span className="padding-left-right-smaller">{currentStatusObj.secondNote}</span>
                    <span role="img" aria-label="Goofy">
                      😋
                    </span>
                  </p>
                </div>
              </React.Fragment>
            ) : (
              <div className="line-height-normal text-black padding-left-right-small flex flex-middle">
                <i className="ordering-thanks__prev"></i>
                <span className="padding-left-right-normal margin-left-right-smaller">{t('Confirmed')}</span>
              </div>
            )}

            {currentStatusObj.status === 'accepted' ? (
              <React.Fragment>
                <h4 className="flex flex-middle ordering-thanks__progress-title text-size-big text-weight-bolder line-height-normal padding-left-right-small margin-top-bottom-small  ordering-thanks__accepted padding-top-bottom-smaller">
                  <i className="ordering-thanks__active"></i>
                  <span className="padding-left-right-normal text-weight-bolder margin-left-right-smaller">
                    {currentStatusObj.firstNote}
                  </span>
                </h4>
                <div className="flex flex-middle text-gray padding-left-right-normal margin-left-right-normal">
                  <div className="margin-left-right-smaller flex flex-middle">
                    <IconAccessTime className="icon icon__small icon__default" />
                    <span className="">{currentStatusObj.secondNote}</span>
                  </div>
                </div>
              </React.Fragment>
            ) : (
              <div
                className={` flex flex-middle line-height-normal padding-left-right-small margin-top-bottom-small padding-top-bottom-smaller ${
                  currentStatusObj.status === 'confirmed'
                    ? 'text-black'
                    : 'padding-top-bottom-smaller ordering-thanks__progress-title  text-gray'
                }`}
              >
                {status === 'paid' ? (
                  <i className="ordering-thanks__next ordering-thanks__next-heigher"></i>
                ) : (
                  <i className="ordering-thanks__prev"></i>
                )}
                <span className="padding-left-right-normal margin-left-right-smaller">
                  {currentStatusObj.status === 'confirmed' ? t('RiderFound') : t('MerchantAccepted')}
                </span>
              </div>
            )}

            {currentStatusObj.status === 'confirmed' ? (
              <React.Fragment>
                <h4
                  className={`flex flex-middle  ordering-thanks__progress-title   padding-left-right-small text-size-big text-weight-bolder line-height-normal  ordering-thanks__accepted`}
                >
                  <i className="ordering-thanks__active"></i>
                  <span className="padding-left-right-normal text-weight-bolder margin-left-right-smaller">
                    {currentStatusObj.firstNote}
                  </span>
                </h4>
                <div className="flex flex-middle text-gray line-height-normal padding-left-right-normal margin-left-right-smaller">
                  <span className="padding-left-right-normal margin-left-right-smaller">
                    {currentStatusObj.secondNote}
                  </span>
                </div>
              </React.Fragment>
            ) : (
              <div className="flex flex-middle padding-top-bottom-smaller text-gray line-height-normal ordering-thanks__progress-title padding-left-right-small">
                <i
                  className={`ordering-thanks__next ${status === 'accepted' ? 'ordering-thanks__next-heigher' : ''}`}
                ></i>
                <span className="padding-left-right-normal margin-left-right-smaller">{t('PendingPickUp')}</span>
              </div>
            )}
          </div>
        </div>
      )}
    </React.Fragment>
  );
}

LogisticsProcessing.propTypes = {};

LogisticsProcessing.defaultProps = {};

export default compose(withTranslation('OrderingThankYou'))(LogisticsProcessing);
