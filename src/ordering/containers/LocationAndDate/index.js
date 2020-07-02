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
import { toNumericTime, addTime, isSameTime, padZero } from '../../../utils/datetime-lib';

const { ROUTER_PATHS, WEEK_DAYS_I18N_KEYS, PREORDER_IMMEDIATE_TAG, ADDRESS_RANGE } = Constants;

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

const getHourAndMinuteFromTime = time => {
  const timeDate = new Date(time);
  const hour = padZero(timeDate.getHours());
  const minutes = padZero(timeDate.getMinutes());

  return `${hour}:${minutes}`;
};

const isAfterTime = (time1, time2) => new Date(time1).valueOf < new Date(time2).valueOf();

const isNoLaterThan = (time1, time2) => new Date(time1).valueOf() <= new Date(time2).valueOf();

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
  timeListRef = React.createRef();
  footerRef = React.createRef();

  // fullTimeList are pickupTimeList and deliveryTimeList for the full time list displayed for future days
  // They'll be calculated and stored as static data for later use just to real time computing
  validPreOrderTimeFrom = null;
  fullTimeList = [];

  componentDidMount = () => {
    const { address: deliveryToAddress } = JSON.parse(Utils.getSessionVariable('deliveryAddress') || '{}');

    // Should do setState to here for what is in componentDidUpdate to work
    this.setState({
      deliveryToAddress,
    });
  };

  // Create time with time string like '01:20', 01 is hour and 20 is minute
  createTimeWithTimeString = timeString => {
    const { hour, minute } = getHourAndMinuteFromString(timeString);
    const currentTime = new Date(this.getMerchantLocalTime());

    return currentTime.setHours(hour || 0, minute || 0, 0, 0);
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
    this.validTimeTo = validTimeTo;

    if (Utils.isDeliveryType()) {
      // Calculate valid delivery time range
      this.validPreOrderTimeFrom = startMinute ? startHour + 2 : startHour + 1;
    }

    if (Utils.isPickUpType()) {
      const tempStartBaseTime = this.createTimeWithTimeString(validTimeFrom);
      const validStartBaseTime = closestValidTime(tempStartBaseTime, 30, 'm');

      this.validPreOrderTimeFrom = getHourAndMinuteFromTime(validStartBaseTime);
    }
    // Should place it here because we need validPreOrderTimeFrom to check the function
    this.fullTimeList = this.getFullHourList();
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

  getMerchantLocalTime = () => {
    const { business, allBusinessInfo } = this.props;
    const { country } = allBusinessInfo[business];

    return Utils.getMerchantLocalTime(allBusinessInfo[business]);
  };

  setDeliveryDays = (validDays = []) => {
    const deliveryDates = [];
    const { business, allBusinessInfo } = this.props;
    const { disableTodayPreOrder } = Utils.getDeliveryInfo({ business, allBusinessInfo });

    for (let i = 0; i < 5; i++) {
      const currentTime = this.getMerchantLocalTime();
      const weekday = (currentTime.getDay() + i) % 7;
      const newDate = currentTime.setDate(currentTime.getDate() + i);
      let isOpen = validDays.includes(weekday);
      const deliveryDate = new Date(newDate).setHours(0, 0, 0, 0);

      if (!i) {
        // Today option is open when user visits delivery time page before store is closed
        const isBeforeStoreClose = isNoLaterThan(currentTime, this.createTimeWithTimeString(this.validTimeTo));
        isOpen = validDays.includes(weekday) && isBeforeStoreClose;
        if (!isOpen) continue;
      }

      if (disableTodayPreOrder && !i) {
        continue;
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
    const { enablePreOrder } = Utils.getDeliveryInfo({ business, allBusinessInfo });
    let { search } = window.location;

    const callbackUrl = encodeURIComponent(
      `${enablePreOrder ? ROUTER_PATHS.ORDERING_LOCATION_AND_DATE : ROUTER_PATHS.ORDERING_LOCATION}${search}`
    );
    // next page don't need current page's callbackUrl.
    search = search.replace(/&?callbackUrl=[^&]*/, '');

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
      firstListItem = this.fullTimeList[0];
    }

    if (!firstListItem) return {};

    if (firstListItem.from === PREORDER_IMMEDIATE_TAG.from) return firstListItem;

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
              <input
                className="input input__block"
                data-testid="deliverTo"
                type="text"
                defaultValue={deliveryToAddress}
                readOnly
              />
              <IconNext className="delivery__next-icon" />
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

      const pickUpAddress = Utils.getValidAddress(stores[0], ADDRESS_RANGE.COUNTRY);
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
                data-testid="preOrderDate"
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
      if (item.from === PREORDER_IMMEDIATE_TAG.from) {
        return (
          <li
            className={`location-display__hour-item text-center ${
              selectedHour.from === PREORDER_IMMEDIATE_TAG.from ? 'selected' : ''
            }`}
            data-testid="preOrderHour"
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
          data-testid="preOrderHour"
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

  getValidStartingTimeString = (baseTimeString = this.validTimeFrom) => {
    const { hour: startHour, minute: startMinute } = getHourAndMinuteFromString(baseTimeString);
    let validStartingTime;

    if (Utils.isDeliveryType()) {
      validStartingTime = `${startMinute ? startHour + 2 : startHour + 1} : 0`;
    }

    if (Utils.isPickUpType()) {
      const tempStartBaseTime = this.createTimeWithTimeString(baseTimeString);
      const validStartBaseTime = closestValidTime(tempStartBaseTime, 30, 'm');

      validStartingTime = getHourAndMinuteFromTime(validStartBaseTime);
    }

    return validStartingTime;
  };

  getHoursListForToday = (selectedDate = {}) => {
    if (!selectedDate.isToday) return;
    const currentTime = this.getMerchantLocalTime();
    const storeOpenTime = this.createTimeWithTimeString(this.validTimeFrom);
    const storeCloseTime = this.createTimeWithTimeString(this.validTimeTo);
    const validStartingTimeString = this.getValidStartingTimeString(getHourAndMinuteFromTime(currentTime));
    const fullTimeList = this.getHoursList();

    // If user visit this webpage before store opens, show full time list
    if (isNoLaterThan(currentTime, storeOpenTime)) {
      return this.fullTimeList;
    }

    // If user visit this page in the middle of the day, first item should be 'immediate'
    if (isNoLaterThan(storeOpenTime, currentTime) && isNoLaterThan(currentTime, storeCloseTime)) {
      // If calculated first item display is after store close
      // Check here use isAfterTime because there is a case if what needs to display after 'immediate'
      // is 6:30, and close time is 6: 30, should show 6:30
      if (isAfterTime(storeCloseTime, this.createTimeWithTimeString(validStartingTimeString))) {
        return [PREORDER_IMMEDIATE_TAG];
      }
      const timeUnitToCompare = Utils.isDeliveryType() ? ['h'] : ['h', 'm'];
      const startTimeInList = fullTimeList.findIndex(item =>
        isSameTime(item.from, this.createTimeWithTimeString(validStartingTimeString), timeUnitToCompare)
      );

      const timeListToDisplay = startTimeInList < 0 ? [] : fullTimeList.slice(startTimeInList);
      timeListToDisplay.unshift(PREORDER_IMMEDIATE_TAG);

      return timeListToDisplay;
    }

    if (isNoLaterThan(currentTime, storeCloseTime)) {
      return [PREORDER_IMMEDIATE_TAG];
    }

    return [];
  };

  getFullHourList = () => {
    if (!this.validTimeFrom || !this.validTimeTo) {
      return [];
    }

    let timeList = [];

    const { hour: startHour, minute: startMinute } = getHourAndMinuteFromString(this.validPreOrderTimeFrom);
    const { hour: endHour, minute: endMinute } = getHourAndMinuteFromString(this.validTimeTo);
    const startTime = new Date().setHours(startHour || 0, startMinute || 0, 0, 0);
    const endTime = new Date().setHours(endHour || 0, endMinute || 0, 0, 0);
    const timeIncrease = i =>
      Utils.isDeliveryType() ? addTime(i, 1, 'h') : Utils.isPickUpType() ? addTime(i, 15, 'm') : 0;

    const loopCheck = i => {
      // Assuming store closes at 10:00 pm
      // Final delivery time should be 22:00 and final pickup time should be 21:30
      // Data structure of the last item in hour list
      // For delivery is { from: "21:00" , to: "22:00" }
      // For pickup is { from: "21:30" , to: "21:45" }
      // So for delivery should compare 'to' and for pickup should compare 'from'
      if (Utils.isDeliveryType()) {
        return timeIncrease(i);
      }

      if (Utils.isPickUpType()) {
        return i;
      }

      return new Date();
    };

    // Every item in hours list has format like { from: time1, to: time2 }
    // following i is like from and addTime(i) is like to
    for (
      let i = new Date(startTime).toISOString();
      isNoLaterThan(loopCheck(i), endTime.valueOf());
      i = timeIncrease(i)
    ) {
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
      timeList = this.fullTimeList;
    }

    return timeList;
  };

  renderHourSelector = () => {
    const { t } = this.props;
    const { selectedDate } = this.state;

    if (!selectedDate || !selectedDate.date) {
      return null;
    }

    const timeList = this.getHoursList(selectedDate);
    const windowHeight = document.documentElement.clientHeight || document.body.clientHeight;
    const footerHeight = this.footerRef.current.clientHeight || this.footerRef.current.offsetHeight;

    return (
      <div className="form__group location-display__date-container">
        {Utils.isDeliveryType() && <label className="form__label font-weight-bold">{t('DeliveryTime')}</label>}
        {Utils.isPickUpType() && <label className="form__label font-weight-bold">{t('PickupTime')}</label>}
        <ul
          ref={this.timeListRef}
          className="location-display__hour"
          style={{ maxHeight: `${windowHeight - footerHeight - 332}px` }}
        >
          {this.renderHoursList(timeList)}
        </ul>
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

    if (Utils.isPickUpType()) delete selectedHour.to;

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
      <footer ref={this.footerRef} className="footer-operation grid flex flex-middle flex-space-between">
        <div className="footer-operation__item width-1-1">
          <button
            className="billing__link button button__fill button__block font-weight-bolder"
            data-testid="continue"
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
