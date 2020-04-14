import React, { Component } from 'react';
import { withTranslation, Trans } from 'react-i18next';
import Tag from '../../../../../components/Tag';
import Image from '../../../../../components/Image';
import { IconMotorcycle } from '../../../../../components/Icons';
import CurrencyNumber from '../../../../components/CurrencyNumber';

class DeliveryDetailModal extends Component {
  state = {
    initDom: true,
  };

  renderDeliveryHour = () => {
    const weekInfo = {
      2: 'Mon',
      3: 'Tue',
      4: 'Wed',
      5: 'Thu',
      6: 'Fri',
      7: 'Sat',
      1: 'Sun',
    };
    const { t, validDays, validTimeFrom, validTimeTo } = this.props;

    return (validDays || []).sort().map(day => {
      return (
        <li key={day} className="store-info__item flex flex-middle flex-space-between">
          <span>{t(weekInfo[day])}</span>
          <time>
            {`${validTimeFrom}`} - {`${validTimeTo}`}
          </time>
        </li>
      );
    });
  };

  render() {
    const {
      t,
      businessInfo,
      businessLoaded,
      onlineStoreInfo,
      show,
      onToggle,
      storeAddress,
      telephone,
      deliveryFee,
      minOrder,
      isValidTimeToOrder,
      // enablePreOrder,
    } = this.props;
    const { initDom } = this.state;
    const { stores, multipleStores } = businessInfo || {};
    const { name } = multipleStores && stores && stores[0] ? stores[0] : {};
    const classList = ['store-info__aside aside'];

    if (!businessLoaded) {
      return null;
    }

    if (show || (initDom && !isValidTimeToOrder)) {
      classList.push('active');
    }

    return (
      <aside
        className={classList.join(' ')}
        onClick={() => {
          if (initDom) {
            this.setState({ initDom: false });
          }

          onToggle(null);
        }}
      >
        <div className="store-info">
          <i className="aside-bottom__slide-button"></i>

          <div className="flex flex-top flex-space-between">
            <Image
              className="header__image-container text-middle"
              src={onlineStoreInfo.logo}
              alt={onlineStoreInfo.title}
            />
            <div className="header__title-container">
              <h2 className="header__title">
                <span
                  className={`header__one-line-title font-weight-bold text-middle ${
                    !isValidTimeToOrder ? 'has-tag' : ''
                  }`}
                >
                  {onlineStoreInfo.storeName}
                  {name ? ` (${name})` : ''}
                </span>
                {isValidTimeToOrder ? null : (
                  <div className="tag__card-container text-middle">
                    <Tag text={t('Closed')} className="tag__card warning downsize text-middle"></Tag>
                  </div>
                )}
              </h2>
              <p className="store-info__address gray-font-opacity">{storeAddress}</p>
              <a className="store-info__phone link link__non-underline" href={`tel:+${telephone}`}>
                {telephone}
              </a>
              <ul className="header__info-list">
                <li className="header__info-item text-middle">
                  <IconMotorcycle className="header__motor-icon text-middle" />
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
            <label className="font-weight-bold gray-font-opacity">{t('DeliveryHours')}</label>
            <ul className="store-info__list">
              {this.renderDeliveryHour()}
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
