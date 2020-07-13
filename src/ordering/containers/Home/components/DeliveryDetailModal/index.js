import React, { Component } from 'react';
import { withTranslation } from 'react-i18next';
import Tag from '../../../../../components/Tag';
import Image from '../../../../../components/Image';

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
      isValidTimeToOrder,
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
        data-heap-name="ordering.home.delivery-detail.container"
        onClick={() => {
          if (initDom) {
            this.setState({ initDom: false });
          }

          onToggle(null);
        }}
      >
        <div className="store-info">
          <div className="store-info__header flex flex-top flex-space-between">
            <Image
              className="header__image-container text-middle"
              src={onlineStoreInfo.logo}
              alt={onlineStoreInfo.title}
            />

            <div className="header__title-container">
              <h2 className="header__title">
                <span
                  className={`header__one-line-title text-weight-bolder text-middle ${
                    !isValidTimeToOrder ? 'has-tag' : ''
                  }`}
                >
                  {onlineStoreInfo.storeName}
                  {name ? ` (${name})` : ''}
                </span>
                {isValidTimeToOrder ? null : (
                  <div className="tag__card-container text-middle">
                    <Tag text={t('Closed')} className="tag tag__error text-middle text-size-small"></Tag>
                  </div>
                )}
              </h2>
              <p className="store-info__address">{storeAddress}</p>
              <a
                className="store-info__phone link link__non-underline"
                href={`tel:+${telephone}`}
                data-heap-name="ordering.home.delivery-detail.phone-number"
              >
                {telephone}
              </a>

              <div className="store-info__delivery-hours">
                <label className="text-weight-bold text-opacity">{t('DeliveryHours')}</label>
                <ul className="store-info__list">{this.renderDeliveryHour()}</ul>
              </div>
            </div>
          </div>
        </div>
      </aside>
    );
  }
}

export default withTranslation()(DeliveryDetailModal);
