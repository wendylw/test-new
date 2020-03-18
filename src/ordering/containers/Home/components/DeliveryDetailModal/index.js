import React, { Component } from 'react';
import { withTranslation, Trans } from 'react-i18next';
import Tag from '../../../../../components/Tag';
import Image from '../../../../../components/Image';
import { IconMotorcycle } from '../../../../../components/Icons';
import CurrencyNumber from '../../../../components/CurrencyNumber';

class DeliveryDetailModal extends Component {
  getDeliveryHourUI = () => {
    const weekInfo = {
      1: 'Mon',
      2: 'Tue',
      3: 'Wed',
      4: 'Thu',
      5: 'Fri',
      6: 'Sat',
      7: 'Sun',
    };
    const { validDays, validTimeFrom, validTimeTo } = this.props;

    return (
      validDays &&
      validDays.map(x => {
        return (
          <li className="store-info__item flex flex-middle flex-space-between">
            <span>{weekInfo[x]}</span>
            {/* <time>11:00 - 22:30</time> */}
            <time>
              {`${validTimeFrom}:00`} - {`${validTimeTo}:00`}
            </time>
          </li>
        );
      })
    );
  };
  render() {
    const {
      onlineStoreInfo,
      show,
      onToggle,
      storeAddress,
      telephone,
      deliveryFee,
      minOrder,
      isValidTimeToOrder,
    } = this.props;
    const getClassName = show => {
      return show ? 'aside active' : 'aside';
    };
    return (
      <aside className={getClassName(show)} onClick={() => onToggle(null)}>
        <div className="store-info">
          <i className="aside-bottom__slide-button"></i>

          <div className="flex flex-top flex-space-between">
            <Image
              className="header__image-container text-middle"
              src={onlineStoreInfo.logo}
              alt={onlineStoreInfo.title}
            />
            <div className="header__title-container">
              <h1 className="header__title">
                <span className="font-weight-bold text-middle">{onlineStoreInfo.storeName}</span>
                {isValidTimeToOrder ? null : (
                  <div className="tag__card-container">
                    <Tag text="Closed" className="tag__card warning downsize text-middle"></Tag>
                  </div>
                )}
              </h1>
              <p className="store-info__address gray-font-opacity">{storeAddress}</p>
              <a className="store-info__phone link link__non-underline" href="tel:+6001298765432">
                {telephone}
              </a>
              <ul className="header__info-list">
                <li className="header__info-item text-middle">
                  <i className="header__motor-icon text-middle">
                    <IconMotorcycle />
                  </i>
                  <span className="header__info-text text-middle font-weight-bold">
                    <CurrencyNumber money={deliveryFee || 0} />
                  </span>
                </li>
                <li className="header__info-item text-middle">
                  <Trans i18nKey="MinimumOrder" minOrder={minOrder}>
                    <label className="text-middle">Min Order.</label>
                    <CurrencyNumber className="header__info-text text-middle font-weight-bold" money={minOrder || 0} />
                  </Trans>
                </li>
              </ul>
            </div>
          </div>

          <div className="store-info__delivery-hours flex flex-top flex-space-between">
            <label className="font-weight-bold gray-font-opacity">Delivery Hours</label>
            <ul className="store-info__list">
              {this.getDeliveryHourUI()}
              {/* <li className="store-info__item flex flex-middle flex-space-between">
                                <span>Sun</span>
                                <time>11:00 - 22:30</time>
                            </li>
                            <li className="store-info__item flex flex-middle flex-space-between">
                                <span>Sun</span>
                                <time>11:00 - 22:30</time>
                            </li>
                            <li className="store-info__item flex flex-middle flex-space-between">
                                <span>Sun</span>
                                <time>11:00 - 22:30</time>
                            </li>
                            <li className="store-info__item flex flex-middle flex-space-between">
                                <span>Sun</span>
                                <time>11:00 - 22:30</time>
                            </li>
                            <li className="store-info__item flex flex-middle flex-space-between">
                                <span>Sun</span>
                                <time>11:00 - 22:30</time>
                            </li>
                            <li className="store-info__item flex flex-middle flex-space-between">
                                <span>Sun</span>
                                <time>11:00 - 22:30</time>
                            </li>
                            <li className="store-info__item flex flex-middle flex-space-between">
                                <span>Sun</span>
                                <time>11:00 - 22:30</time>
                            </li> */}
            </ul>
          </div>
        </div>
      </aside>
    );
  }
}

export default withTranslation()(DeliveryDetailModal);
