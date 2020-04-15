import React, { Component, Fragment } from 'react';
import { withTranslation } from 'react-i18next';
import Header from '../../../components/Header';
import { IconNext } from '../../../components/Icons';

import Constants from '../../../utils/constants';
import Utils from '../../../utils/utils';

import { connect } from 'react-redux';
import { compose } from 'redux';
import { getBusiness } from '../../redux/modules/app';
import { getAllBusinesses } from '../../../redux/modules/entities/businesses';
import { toNumericTime } from '../../../utils/datetime-lib';

const { ROUTER_PATHS, WEEK_DAYS_I18N_KEYS } = Constants;

// Accepts time format like 10:00, 10, and 10:40
const getHourAndMinute = time => {
  const hour = parseInt(time.split(':')[0], 10);
  const minute = parseInt(time.split(':')[1] || 0, 10);

  return { hour, minute };
};

class LocationAndDate extends Component {
  state = {
    deliveryToAddress: '',
    selectedDate: {},
    selectedHour: {},
  };
  deliveryHours = [];
  deliveryDates = [];
  validDays = [];
  validTimeFrom = null;
  validTimeTo = null;
  timeListRef = React.createRef();
  footerRef = React.createRef();

  componentDidMount = () => {
    const { address: deliveryToAddress } = JSON.parse(Utils.getSessionVariable('deliveryAddress') || '{}');
    const windowHeight = document.documentElement.clientHeight || document.body.clientHeight;
    const footerHeight = this.footerRef.current.clientHeight || this.footerRef.current.offsetHeight;
    const listOffset = Utils.elementPartialOffsetTop(this.timeListRef.current);

    this.timeListRef.current.style.maxHeight = `${windowHeight - footerHeight - listOffset}px`;

    // Should do setState to here for what is in componentDidUpdate to work
    this.setState({
      deliveryToAddress,
    });
  };

  getExpectedTimeFromSession = () => {
    const { date, hour } = Utils.getExpectedDeliveryDateFromSession();

    this.setState({
      selectedDate: date,
      selectedHour: hour,
    });
  };

  getBusinessCountry = () => {
    try {
      const { business, allBusinessInfo } = this.props;
      const businessInfo = allBusinessInfo[business];
      return businessInfo.country;
    } catch (e) {
      // this could happen when allBusinessInfo is not loaded.
      return undefined;
    }
  };

  componentDidUpdate = () => {
    if (!(this.validDays.length && typeof this.validTimeFrom === 'number' && typeof this.validTimeTo === 'number')) {
      const { business, allBusinessInfo } = this.props;
      const { validDays, validTimeFrom, validTimeTo } = Utils.getDeliveryInfo({ business, allBusinessInfo });

      if (validDays) {
        // IST saved Sunday as 1, Monday as two
        // Transfer sunday to 0, Monday to 1
        this.initialValidDays = validDays;
        this.validDays = Array.from(validDays, v => v - 1);
      }

      if (validTimeFrom) {
        this.initialValidTimeFrom = validTimeFrom;
        const { hour, minute } = getHourAndMinute(validTimeFrom);

        if (minute) {
          this.validTimeFrom = hour + 2;
        } else {
          this.validTimeFrom = hour + 1;
        }
      }

      if (validTimeTo) {
        this.initialValidTimeTo = validTimeTo;
        const { hour } = getHourAndMinute(validTimeTo);

        this.validTimeTo = hour;
      }

      if (typeof this.validTimeFrom === 'number' && typeof this.validTimeTo === 'number' && this.validDays.length) {
        this.deliveryHours = [this.validTimeFrom, this.validTimeTo];
        this.setDeliveryDays(this.validDays);
      }
    }
  };

  setInitialSelectedTime = () => {
    const { business, allBusinessInfo } = this.props;
    const { enablePreOrder } = Utils.getDeliveryInfo({ business, allBusinessInfo });
    const { date } = Utils.getExpectedDeliveryDateFromSession();
    const initialSelectedTime =
      enablePreOrder && date.date ? Utils.getExpectedDeliveryDateFromSession() : { date: this.deliveryDates[0] };

    this.setState({
      selectedDate: initialSelectedTime.date,
      selectedHour: initialSelectedTime.hour || {
        from: this.deliveryHours[0],
        to: this.deliveryHours[0] + 1,
      },
    });
  };

  setDeliveryDays = (validDays = []) => {
    const deliveryDates = [];
    for (let i = 0; i < 5; i++) {
      const currentTime = new Date();
      const weekday = (currentTime.getDay() + i) % 7;
      const newDate = currentTime.setDate(currentTime.getDate() + i);
      let isOpen = validDays.includes(weekday);

      // If store is closed today, don't show today in date list
      if (!i) {
        isOpen = Utils.isValidTimeToOrder({
          validDays: this.initialValidDays,
          validTimeFrom: this.initialValidTimeFrom,
          validTimeTo: this.initialValidTimeTo,
        });

        if (!isOpen) continue;
      }

      deliveryDates.push({
        date: newDate.valueOf(),
        isOpen: isOpen,
        isToday: !i,
      });
    }
    this.deliveryDates = deliveryDates;
    this.setInitialSelectedTime();
  };

  showLocationSearch = () => {
    const { history, business, allBusinessInfo } = this.props;
    const { search } = window.location;
    const { enablePreOrder } = Utils.getDeliveryInfo({ business, allBusinessInfo });

    Utils.setSessionVariable(
      'deliveryCallbackUrl',
      JSON.stringify({
        pathname: enablePreOrder ? ROUTER_PATHS.ORDERING_LOCATION_AND_DATE : ROUTER_PATHS.ORDERING_LOCATION,
        search,
      })
    );

    history.push({
      pathname: ROUTER_PATHS.ORDERING_LOCATION,
      search,
    });
  };

  handleBackClicked = () => {
    const { history } = this.props;
    history.go(-1);
  };

  handleSelectDate = date => {
    // No hours list when either store is closed that day or order should be delivered today
    if (!date.isOpen) {
      return;
    }
    const { deliveryHours = [] } = this;
    const selectedHour = {
      from: deliveryHours[0],
      to: deliveryHours[0] + 1,
    };

    this.setState({
      selectedDate: date,
      selectedHour,
    });
  };

  handleSelectHour = hour => {
    this.setState({
      selectedHour: hour,
    });
  };

  getLocationDisplayTitle = () => {
    const { t } = this.props;
    return t('DeliveryDetails');
  };

  renderDeliveryTo = () => {
    const { deliveryToAddress } = this.state;
    const { t } = this.props;
    return (
      <div className="form__group">
        <label className="form__label font-weight-bold gray-font-opacity">{t('DeliverTo')}</label>
        <div className="location-page__search-box" onClick={this.showLocationSearch}>
          <div className="input-group outline flex flex-middle flex-space-between border-radius-base">
            <input className="input input__block" type="text" defaultValue={deliveryToAddress} readOnly />
            <i className="delivery__next-icon">
              <IconNext />
            </i>
          </div>
        </div>
      </div>
    );
  };

  renderDeliveryOn = () => {
    const { selectedDate } = this.state;
    const { t } = this.props;

    return (
      <div className="form__group">
        <label className="form__label font-weight-bold gray-font-opacity">{t('DeliverOn')}</label>
        <ul className="flex flex-middle flex-space-between location-display__date">
          {this.deliveryDates.map(deliverableTime => {
            const dateDetail = new Date(deliverableTime.date);
            const date = dateDetail.getDate();
            const weekday = dateDetail.getDay() % 7;
            const isSelected = dateDetail.getDay() === new Date(selectedDate.date).getDay();

            return (
              <li
                className={`location-display__date-item flex flex-space-between flex-column text-center ${
                  deliverableTime.isOpen ? '' : 'disabled'
                } ${isSelected ? 'selected' : ''}`}
                onClick={() => {
                  this.handleSelectDate(deliverableTime);
                }}
                key={dateDetail.getTime()}
              >
                {deliverableTime.isToday ? (
                  <span>{t('Now')}</span>
                ) : (
                  <Fragment>
                    <span>{t(WEEK_DAYS_I18N_KEYS[weekday])}</span>
                    <span>{date}</span>
                  </Fragment>
                )}
              </li>
            );
          })}
        </ul>
      </div>
    );
  };

  renderHoursList = () => {
    const { selectedHour = {} } = this.state;
    const { deliveryHours } = this;
    const deliverHoursArray = Array.from(
      { length: deliveryHours[1] - deliveryHours[0] },
      (v, i) => i + deliveryHours[0]
    );
    const country = this.getBusinessCountry();

    return deliverHoursArray.map(hour => {
      const currHour = new Date();
      currHour.setHours(hour, 0);
      const nextHour = new Date();
      nextHour.setHours(hour + 1, 0);
      return (
        <li
          className={`location-display__hour-item text-center ${selectedHour.from === hour ? 'selected' : ''}`}
          onClick={() => {
            this.handleSelectHour({
              from: hour,
              to: hour + 1,
            });
          }}
          key={hour}
        >
          {`${toNumericTime(currHour, country)} - ${toNumericTime(nextHour, country)}`}
        </li>
      );
    });
  };

  renderHourSelector = () => {
    const { selectedDate } = this.state;
    const { t } = this.props;

    if (new Date(selectedDate.date).getDate() === new Date().getDate()) {
      return null;
    }

    return (
      <div className="form__group location-display__date-container">
        <label className="form__label font-weight-bold gray-font-opacity">{t('DeliveryTime')}</label>
        <ul ref={this.timeListRef} className="location-display__hour">
          {this.renderHoursList()}
        </ul>
      </div>
    );
  };

  checkIfCanContinue = () => {
    const { business, allBusinessInfo } = this.props;
    const { selectedDate } = this.state;
    const { selectedHour } = this.state;
    const { address: deliveryToAddress } = JSON.parse(Utils.getSessionVariable('deliveryAddress') || '{}');
    const { enablePreOrder } = Utils.getDeliveryInfo({ business, allBusinessInfo });

    if (enablePreOrder && selectedDate.isOpen && deliveryToAddress) {
      if (selectedDate.isToday || (!selectedDate.isToday && selectedHour)) {
        return false;
      }
    }

    if (enablePreOrder && selectedDate && selectedDate.isOpen && selectedHour && deliveryToAddress) {
      return false;
    }

    return true;
  };

  goToNext = () => {
    const { history } = this.props;
    const { selectedDate, selectedHour } = this.state;

    Utils.setExpectedDeliveryTime({
      date: selectedDate,
      hour: selectedHour,
    });

    const callbackUrl = JSON.parse(Utils.getSessionVariable('deliveryTimeCallbackUrl'));
    Utils.removeSessionVariable('deliveryTimeCallbackUrl');
    if (typeof callbackUrl === 'object') {
      const { pathname, search } = callbackUrl;
      history.push({
        pathname: pathname,
        search,
      });
    } else {
      history.go(-1);
    }
  };

  renderContinueButton = () => {
    const { t } = this.props;
    return (
      <footer ref={this.footerRef} className="footer-operation grid flex flex-middle flex-space-between">
        <div className="footer-operation__item width-1-1">
          <button
            className="billing__link button button__fill button__block font-weight-bold"
            disabled={this.checkIfCanContinue()}
            onClick={this.goToNext}
          >
            {t('Continue')}
          </button>
        </div>
      </footer>
    );
  };

  render() {
    return (
      <section className="table-ordering__location">
        <Header
          className="has-right flex-middle"
          isPage={true}
          title={this.getLocationDisplayTitle()}
          navFunc={this.handleBackClicked}
        />
        <div className="location-display__content">
          {this.renderDeliveryTo()}
          {this.renderDeliveryOn()}
          {this.renderHourSelector()}
        </div>
        {this.renderContinueButton()}
      </section>
    );
  }
}

export default compose(
  withTranslation(),
  connect(
    state => ({
      business: getBusiness(state),
      allBusinessInfo: getAllBusinesses(state),
    }),
    dispatch => ({})
  )
)(LocationAndDate);
