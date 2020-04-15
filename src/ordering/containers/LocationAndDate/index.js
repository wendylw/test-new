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
import { toNumericTime, addTime, isSameTime } from '../../../utils/datetime-lib';

const { ROUTER_PATHS, WEEK_DAYS_I18N_KEYS } = Constants;

const closestMinute = minute => [0, 15, 30, 45, 60].find(i => i >= minute);

// If time is 8:14, should return valid time as 8:30
// Logic for this one is given a time, calculate the closest time with 0/15/30/45/60
const closestValidTime = (baseTime, timeGap = 0, timeUnit = 'm') => {
  const baseTimeDate = baseTime ? new Date(baseTime) : new Date();
  const baseMinute = baseTimeDate.getMinutes();
  const closestMinutesInFifteenInterval = baseTimeDate.setMinutes(closestMinute(baseMinute), 0);
  const resultTime = addTime(closestMinutesInFifteenInterval, timeGap, timeUnit);

  return resultTime;
};

// Accepts time format like 10:00, 10, and 10:40
const getHourAndMinuteFromString = time => {
  if (!time) return;
  if (typeof time === 'number') return { hour: time };
  const hour = parseInt(time.split(':')[0], 10);
  const minute = parseInt(time.split(':')[1] || 0, 10);

  return { hour, minute };
};

// Create time with time string like '01:20', 01 is hour and 20 is minute
const createTimeWithTimeString = timeString => {
  const { hour, minute } = getHourAndMinuteFromString(timeString);
  const currentTime = new Date();

  return currentTime.setHours(hour || 0, minute || 0);
};

const getHourAndMinuteFromTime = time => {
  const timeDate = new Date(time);
  const hour = timeDate.getHours();
  const minutes = timeDate.getMinutes();

  return `${hour}:${minutes}`;
};

const isAfterTime = (time1, time2) => {
  return new Date(time1).valueOf() <= new Date(time2).valueOf();
};

class LocationAndDate extends Component {
  state = {
    deliveryToAddress: '',
    selectedDate: {},
    selectedHour: {},
  };
  deliveryHours = [];
  deliveryDates = [];

  // Check if can remove following three variable
  validDays = [];
  validTimeFrom = null;
  validTimeTo = null;

  validDeliveryTimeFrom = null;
  validDeliveryTimeTo = null;
  pickupTimeList = null;
  validPickUpTimeFrom = null;
  validPickUpTimeTo = null;
  deliveryTimeList = null;

  componentDidMount = () => {
    const { address: deliveryToAddress } = JSON.parse(Utils.getSessionVariable('deliveryAddress') || '{}');

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

  getValidTimeToOrder = (validTimeFrom, validTimeTo) => {
    const { hour: startHour, minute: startMinute } = getHourAndMinuteFromString(validTimeFrom);
    const { hour: endHour, minute: endMinute } = getHourAndMinuteFromString(validTimeTo);

    if (Utils.isDeliveryType()) {
      // Calculate valid delivery time range
      this.validDeliveryTimeFrom = startMinute ? startHour + 2 : startHour + 1;
      this.validDeliveryTimeTo = endMinute ? endHour : endHour - 1;
      this.deliveryTimeList = this.getFullHourList();
    }

    if (Utils.isPickUpType()) {
      const tempStartBaseTime = createTimeWithTimeString(validTimeFrom);
      const validStartBaseTime = closestValidTime(tempStartBaseTime, 30, 'm');

      const tempEndEndTime = createTimeWithTimeString(validTimeTo);
      const validEndBaseTime = closestValidTime(tempEndEndTime, -30, 'm');

      this.validPickUpTimeFrom = getHourAndMinuteFromTime(validStartBaseTime);
      this.validPickUpTimeTo = getHourAndMinuteFromTime(validEndBaseTime);
      this.pickupTimeList = this.getFullHourList();
    }
  };

  componentDidUpdate = () => {
    // Check if can remove validDays from this
    if (!(this.validDays.length && typeof this.validTimeFrom === 'string' && typeof this.validTimeTo === 'string')) {
      const { business, allBusinessInfo } = this.props;
      const { validDays, validTimeFrom, validTimeTo } = Utils.getDeliveryInfo({ business, allBusinessInfo });

      // Calculate rendering time data when everything is ready
      if (validDays && validDays.length && typeof validTimeFrom === 'string' && typeof validTimeTo === 'string') {
        // IST saved Sunday as 1, Monday as two
        // Transfer sunday to 0, Monday to 1
        this.initialValidDays = validDays;
        this.validDays = Array.from(validDays, v => v - 1);
        this.validTimeFrom = validTimeFrom;
        this.validTimeTo = validTimeTo;

        this.getValidTimeToOrder(validTimeFrom, validTimeTo);
        this.setDeliveryDays(this.validDays);
      }

      if (business && allBusinessInfo && allBusinessInfo[business]) {
        const { enablePreOrder } = Utils.getDeliveryInfo({ business, allBusinessInfo });

        if (!enablePreOrder) window.location.href = '/';
      }
    }
  };

  setInitialSelectedTime = () => {
    const { business, allBusinessInfo } = this.props;
    const { enablePreOrder } = Utils.getDeliveryInfo({ business, allBusinessInfo });
    const { date } = Utils.getExpectedDeliveryDateFromSession();
    const initialSelectedTime =
      enablePreOrder && date.date ? Utils.getExpectedDeliveryDateFromSession() : { date: this.deliveryDates[0] };

    const firstItemFromTimeList = this.getFirstItemFromTimeList(initialSelectedTime.date);

    // if selectedDate is today, should auto select immediate
    this.setState({
      selectedDate: initialSelectedTime.date,
      selectedHour: initialSelectedTime.hour || firstItemFromTimeList,
    });
  };

  setDeliveryDays = (validDays = []) => {
    const deliveryDates = [];
    for (let i = 0; i < 5; i++) {
      const currentTime = new Date();
      const currentHour = currentTime.getHours();
      const weekday = (currentTime.getDay() + i) % 7;
      const newDate = currentTime.setDate(currentTime.getDate() + i);
      let isOpen = validDays.includes(weekday);
      const deliveryDate = new Date(newDate).setHours(0, 0, 0);

      if (!i) {
        isOpen = validDays.includes(weekday) && currentHour < this.validTimeTo.split(':')[0];
        if (!isOpen) continue;
      }

      deliveryDates.push({
        date: new Date(deliveryDate).toISOString(),
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

    const callbackUrl = encodeURIComponent(
      `${enablePreOrder ? ROUTER_PATHS.ORDERING_LOCATION_AND_DATE : ROUTER_PATHS.ORDERING_LOCATION}${search}`
    );

    history.push({
      pathname: ROUTER_PATHS.ORDERING_LOCATION,
      search: `${search}&callbackUrl=${callbackUrl}`,
    });
  };

  handleBackClicked = () => {
    const { history } = this.props;
    history.go(-1);
  };

  getFirstItemFromTimeList = date => {
    let firstListItem = {};
    if (date.isToday) {
      const hoursListForToday = this.getHoursListForToday(date);
      firstListItem = hoursListForToday[0];
    } else {
      if (Utils.isDeliveryType()) {
        const firstDeliveryItem = this.deliveryTimeList[0];
        firstListItem = firstDeliveryItem;
      }
      if (Utils.isPickUpType()) {
        const firstDeliveryItem = this.pickupTimeList[0];
        firstListItem = firstDeliveryItem;
      }
    }

    if (firstListItem.from === 'now') return firstListItem;

    return {
      from: getHourAndMinuteFromTime(firstListItem.from),
      to: getHourAndMinuteFromTime(firstListItem.to),
    };
  };

  handleSelectDate = date => {
    if (!date.isOpen) {
      return;
    }
    const selectedHour = this.getFirstItemFromTimeList(date);

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

    return Utils.isDeliveryType() ? t('DeliveryDetails') : t('PickUpDetails');
  };

  renderDeliveryTo = () => {
    if (Utils.isDeliveryType()) {
      const { deliveryToAddress } = this.state;
      const { t } = this.props;
      return (
        <div className="form__group">
          <label className="form__label font-weight-bold">{t('DeliverTo')}</label>
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
    }

    if (Utils.isPickUpType()) {
      const { t, business, allBusinessInfo = {} } = this.props;
      const businessInfo = allBusinessInfo[business] || {};
      const { stores = [] } = businessInfo;

      if (!stores.length) return;

      const pickUpAddress = Utils.getValidAddress(stores[0], Constants.ADDRESS_RANGE.CITY);
      return (
        <div className="form__group">
          <label className="form__label font-weight-bold">{t('PickupAt')}</label>
          <div className="form__textarea">{pickUpAddress}</div>
        </div>
      );
    }
  };

  renderDeliveryOn = () => {
    const { selectedDate } = this.state;
    const { t } = this.props;

    return (
      <div className="form__group">
        <label className="form__label font-weight-bold">
          {Utils.isDeliveryType() && t('DeliverOn')}
          {Utils.isPickUpType() && t('PickUpOn')}
        </label>
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
                key={date}
              >
                {deliverableTime.isToday ? (
                  <span className="text-uppercase">{t('Today')}</span>
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

  renderHoursList = timeList => {
    if (!timeList || !timeList.length) return;

    const { t } = this.props;
    const { selectedHour = {} } = this.state;
    const country = this.getBusinessCountry();

    return timeList.map(item => {
      if (item.from === 'now') {
        return (
          <li
            className={`location-display__hour-item text-center ${selectedHour.from === 'now' ? 'selected' : ''}`}
            onClick={() => {
              this.handleSelectHour({ ...item });
            }}
            key="deliveryOnDemandOrder"
          >
            {t('Immediate')}
          </li>
        );
      }

      let timeToDisplay;

      if (Utils.isDeliveryType()) {
        timeToDisplay = `${toNumericTime(new Date(item.from), country)} - ${toNumericTime(new Date(item.to), country)}`;
      }

      if (Utils.isPickUpType()) {
        timeToDisplay = `${toNumericTime(new Date(item.from), country)}`;
      }

      // item.from and item.to are time in ISOString format
      const from = getHourAndMinuteFromTime(item.from);
      const to = item.to && getHourAndMinuteFromTime(item.to);
      return (
        <li
          className={`location-display__hour-item text-center ${selectedHour.from === from ? 'selected' : ''}`}
          onClick={() => {
            this.handleSelectHour({ from, to });
          }}
          key={`${from} - ${to}`}
        >
          {timeToDisplay}
        </li>
      );
    });
  };

  getHoursListForToday = (selectedDate = {}) => {
    if (!selectedDate.isToday) return;
    let hoursListForToday = [];

    if (Utils.isPickUpType()) {
      const startTimeForToday = closestValidTime('', 30, 'm');
      const fullTimeList = this.pickupTimeList || [];
      const startTimeInList = fullTimeList.findIndex(item => isSameTime(item.from, startTimeForToday, ['h', 'm']));
      hoursListForToday = fullTimeList.slice(startTimeInList);
    }

    if (Utils.isDeliveryType()) {
      const fullTimeList = this.deliveryTimeList || [];
      const currentTime = new Date();
      const currentHour = currentTime.getHours();
      const currentMinute = currentTime.getMinutes();
      const validHour = currentMinute ? currentHour + 2 : currentHour + 1;

      // If user visit this page before store opens, should show all the time list
      if (currentHour < this.validDeliveryTimeFrom) {
        return this.deliveryTimeList || [];
      }

      // If user visit this page after store closes, show nothing
      if (currentHour > this.validDeliveryTimeTo || validHour > this.validDeliveryTimeTo) {
        return [];
      }

      // If user visit this page in the middle of the day, first item should be 'immediate'
      const startTimeInList = fullTimeList.findIndex(item =>
        isSameTime(item.from, currentTime.setHours(validHour), ['h'])
      );
      hoursListForToday = fullTimeList.slice(startTimeInList);
      hoursListForToday.unshift({
        from: 'now',
        to: 'now',
      });

      return hoursListForToday;
    }

    return hoursListForToday;
  };

  getFullHourList = () => {
    if (!this.validTimeFrom || !this.validTimeTo) {
      return [];
    }

    let displayTimeFrom;
    let displayTimeTo;
    let timeList = [];

    if (Utils.isDeliveryType()) {
      displayTimeTo = this.validDeliveryTimeTo;
      displayTimeFrom = this.validDeliveryTimeFrom;
    }

    if (Utils.isPickUpType()) {
      displayTimeTo = this.validPickUpTimeTo;
      displayTimeFrom = this.validPickUpTimeFrom;
    }

    const { hour: startHour, minute: startMinute } = getHourAndMinuteFromString(displayTimeFrom);
    const { hour: endHour, minute: endMinute } = getHourAndMinuteFromString(displayTimeTo);
    const startTime = new Date().setHours(startHour || 0, startMinute || 0, 0);
    const endTime = new Date().setHours(endHour || 0, endMinute || 0, 0);
    const timeIncrease = i =>
      Utils.isDeliveryType() ? addTime(i, 1, 'h') : Utils.isPickUpType() ? addTime(i, 15, 'm') : 0;

    for (let i = new Date(startTime).toISOString(); isAfterTime(i.valueOf(), endTime.valueOf()); i = timeIncrease(i)) {
      const timeItem = {
        from: i,
      };

      if (Utils.isDeliveryType()) {
        timeItem.to = timeIncrease(i);
      }
      timeList.push(timeItem);
    }

    return timeList;
  };

  getHoursList = (selectedDate = {}) => {
    let timeList = [];

    if (selectedDate.isToday) {
      timeList = this.getHoursListForToday(selectedDate);
    } else {
      if (Utils.isDeliveryType()) {
        timeList = this.deliveryTimeList;
      }

      if (Utils.isPickUpType()) {
        timeList = this.pickupTimeList;
      }
    }

    return timeList;
  };

  renderHourSelector = () => {
    const { t } = this.props;
    const { selectedDate } = this.state;

    if (!selectedDate || !selectedDate.date) return;

    const timeList = this.getHoursList(selectedDate);

    return (
      <div className="form__group location-display__date-container">
        {Utils.isDeliveryType() && <label className="form__label font-weight-bold">{t('DeliveryTime')}</label>}
        {Utils.isPickUpType() && <label className="form__label font-weight-bold">{t('PickupTime')}</label>}
        <ul className="location-display__hour">{this.renderHoursList(timeList)}</ul>
      </div>
    );
  };

  checkIfCanContinue = () => {
    const { business, allBusinessInfo } = this.props;
    const { selectedDate = {} } = this.state;
    const { selectedHour = {} } = this.state;
    const { address: deliveryToAddress } = JSON.parse(Utils.getSessionVariable('deliveryAddress') || '{}');
    const { enablePreOrder } = Utils.getDeliveryInfo({ business, allBusinessInfo });

    if (!enablePreOrder || !selectedDate.isOpen) return true;

    if (Utils.isDeliveryType()) {
      if (deliveryToAddress && selectedDate.date && selectedHour.from) {
        return false;
      }
    }

    if (Utils.isPickUpType()) {
      if (selectedDate.date && selectedHour.from) {
        return false;
      }
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

    const callbackUrl = Utils.getQueryString('callbackUrl');

    if (typeof callbackUrl === 'string') {
      history.push(callbackUrl);
    } else {
      history.go(-1);
    }
  };

  renderContinueButton = () => {
    const { t } = this.props;
    return (
      <footer className="footer-operation grid flex flex-middle flex-space-between">
        <div className="footer-operation__item width-1-1">
          <button
            className="billing__link button button__fill button__block font-weight-bolder"
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
