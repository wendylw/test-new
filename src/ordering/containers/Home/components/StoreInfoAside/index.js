import React, { Component } from 'react';
import { withTranslation } from 'react-i18next';
import Tag from '../../../../../components/Tag';
import Image from '../../../../../components/Image';
import './StoreInfoAside.scss';

class StoreInfoAside extends Component {
  state = {
    initDom: true,
  };

  formatHour = (hourString = '') => {
    const [hour, minute] = hourString ? hourString.split(':') : [];
    const hourRemainder = Number(hour) % 12;
    const localeMeridiem = Number(hour) > 11 ? 'pm' : 'am';
    const timeString = `${hourRemainder || 12}${Number(minute) ? `:${minute}` : ''}`;

    if (isNaN(hourRemainder)) {
      return '';
    }

    return `${hour && !(hour % 24) && !Number(minute) ? '11:59' : timeString}${localeMeridiem}`;
  };

  getOpeningHours = function({
    breakTimeFrom,
    breakTimeTo,
    validTimeFrom = '00:00',
    validTimeTo = '24:00',
    formatBreakTimes,
    formatValidTimes,
  }) {
    if (validTimeFrom >= breakTimeFrom && validTimeTo <= breakTimeTo) {
      return [];
    }

    if (
      !breakTimeFrom ||
      !breakTimeTo ||
      validTimeFrom >= breakTimeTo ||
      (validTimeTo <= breakTimeTo && breakTimeFrom === breakTimeTo)
    ) {
      return [`${formatValidTimes[0]} - ${formatValidTimes[1]}`];
    }

    if (validTimeFrom < breakTimeFrom && validTimeTo > breakTimeTo && breakTimeFrom !== breakTimeTo) {
      return [`${formatValidTimes[0]} - ${formatBreakTimes[0]}, ${formatBreakTimes[1]} - ${formatValidTimes[1]}`];
    }

    if (validTimeFrom >= breakTimeFrom && validTimeFrom <= breakTimeTo && breakTimeTo < validTimeTo) {
      return [`${formatBreakTimes[1]} - ${formatValidTimes[1]}`];
    }

    if (validTimeTo <= breakTimeTo && validTimeTo >= breakTimeFrom && breakTimeFrom > validTimeFrom) {
      return [`${formatValidTimes[0]} - ${formatBreakTimes[0]}`];
    }

    return [`${formatValidTimes[0]} - ${formatValidTimes[1]}`];
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
    const { t, validDays, validTimeFrom, validTimeTo, breakTimeFrom, breakTimeTo } = this.props;
    const formatBreakTimes = [this.formatHour(breakTimeFrom), this.formatHour(breakTimeTo)];
    const formatValidTimes = [this.formatHour(validTimeFrom), this.formatHour(validTimeTo)];
    const openingHours = this.getOpeningHours({
      validTimeFrom,
      validTimeTo,
      breakTimeFrom,
      breakTimeTo,
      formatBreakTimes,
      formatValidTimes,
    });

    return Object.keys(weekInfo)
      .sort()
      .map(day => {
        return (
          <li key={day} className="flex flex-middle flex-space-between margin-top-bottom-small">
            <span>{t(weekInfo[day])}</span>
            <time>{validDays.includes(+day) || !openingHours.length ? openingHours : t('Closed')}</time>
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
      enablePreOrder,
      isValidTimeToOrder,
      footerEl,
    } = this.props;
    const { initDom } = this.state;
    const { stores, multipleStores } = businessInfo || {};
    const { name } = multipleStores && stores && stores[0] ? stores[0] : {};
    const classList = ['store-info-aside aside fixed-wrapper'];

    if (!businessLoaded) {
      return null;
    }

    if (show || (initDom && !(isValidTimeToOrder || enablePreOrder))) {
      classList.push('active');
    }

    return (
      <aside
        className={classList.join(' ')}
        data-heap-name="ordering.home.delivery-detail.container"
        style={{
          bottom: footerEl ? `${footerEl.clientHeight || footerEl.offsetHeight}px` : '0',
        }}
        onClick={() => {
          if (initDom) {
            this.setState({ initDom: false });
          }

          onToggle(null);
        }}
      >
        <div className="store-info-aside__container aside__content absolute-wrapper padding-normal">
          <div className="flex flex-top">
            <Image
              className="logo logo__normal text-middle flex__shrink-fixed"
              src={onlineStoreInfo.logo}
              alt={onlineStoreInfo.title}
            />

            <summary className="store-info-aside__summary padding-left-right-small">
              <div className="flex flex-middle">
                <h2 className="text-size-big text-weight-bolder text-middle text-omit__single-line">
                  {onlineStoreInfo.storeName}
                  {name ? ` (${name})` : ''}
                </h2>
                {isValidTimeToOrder ? null : enablePreOrder ? (
                  <Tag
                    text={t('PreOrder')}
                    className="tag__small tag__info margin-left-right-small text-middle text-size-small"
                  />
                ) : (
                  <Tag
                    text={t('Closed')}
                    className="tag__small tag__error margin-left-right-small text-middle text-size-small"
                  />
                )}
              </div>
              {storeAddress ? (
                <address className="text-size-big margin-top-bottom-small text-line-height-base">
                  {storeAddress}
                </address>
              ) : null}
              {telephone ? (
                <a
                  className="store-info-aside__button-link button button__link text-size-big padding-top-bottom-small"
                  href={`tel:+${telephone}`}
                  data-heap-name="ordering.home.delivery-detail.phone-number"
                >
                  {telephone}
                </a>
              ) : null}
              <h4 className="margin-top-bottom-normal text-weight-bolder text-opacity">{t('DeliveryHours')}</h4>
              <ul>{this.renderDeliveryHour()}</ul>
            </summary>
          </div>
        </div>
      </aside>
    );
  }
}

export default withTranslation()(StoreInfoAside);
