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
import { toNumericTime, addTime } from '../../../utils/datetime-lib';

const { ROUTER_PATHS, WEEK_DAYS_I18N_KEYS } = Constants;

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
  const hour = timeDate.getHours();
  const minutes = timeDate.getMinutes();

  return `${hour}:${(minutes < 10 ? '0' : '') + minutes}`;
};

const compareTime = (time1, time2) => {
  return new Date(time1).valueOf() < new Date(time2).valueOf();
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
  validDeliveryTimeFrom = null;
  validDeliveryTimeTo = null;
  pickupTimeList = null;
  // pickupTimeListForToday = null;
  validPickUpTimeFrom = null;
  validPickUpTimeTo = null;
  deliveryTimeList = null;
  // deliveryTimeListForToday = null;

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

  getValidTimeToOrder = (validDays, validTimeFrom, validTimeTo) => {
    const { hour: startHour, minute: startMinute } = getHourAndMinuteFromString(validTimeFrom);
    const { hour: endHour, minute: endMinute } = getHourAndMinuteFromString(validTimeTo);

    if (Utils.isDeliveryType()) {
      // Calculate valid delivery time range
      this.validDeliveryTimeFrom = startMinute ? startHour + 2 : startHour + 1;
      this.validDeliveryTimeTo = endHour;
      // this.validDeliveryTimeFrom = `${startMinute ? startHour + 2 : startHour + 1}:00`;
      // this.validDeliveryTimeTo = `${endHour}:00`;
      this.deliveryTimeList = this.getHoursList();
    }

    if (Utils.isPickUpType()) {
      const nearestStartFifthMinute = 5 * Math.round(startMinute / 5);
      const nearestEndFifthMinute = 5 * Math.ceil(endMinute / 5);
      const tempStartBaseTime = new Date();
      tempStartBaseTime.setHours(startHour, nearestStartFifthMinute);

      const tempEndBaseTime = new Date();
      tempEndBaseTime.setHours(endHour, nearestEndFifthMinute, 0);

      this.validPickUpTimeFrom = getHourAndMinuteFromTime(addTime(tempStartBaseTime, 30, 'm'));
      this.validPickUpTimeTo = getHourAndMinuteFromTime(addTime(tempEndBaseTime, -30, 'm'));
      this.pickupTimeList = this.getHoursList();
      console.log('This is time list', this.pickupTimeList);
    }
  };

  componentDidUpdate = () => {
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

        this.getValidTimeToOrder(validDays, validTimeFrom, validTimeTo);
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

    // const hoursListForToday = this.getHoursList(initialSelectedTime.date);
    const firstItemFromTimeList = this.getFirstItemFromTimeList(initialSelectedTime.date);
    // if (Utils.isDeliveryType() && initialSelectedTime.date.isToday && !initialSelectedTime.hour){
    //   selectedHour = {
    //     from: 'now',
    //     to: 'now',
    //   };
    // }

    // if selectedDate is today, should auto select immediate
    this.setState({
      selectedDate: initialSelectedTime.date,
      selectedHour: initialSelectedTime.hour || firstItemFromTimeList,
      // || getHourAndMinuteFromTime(hoursListForToday[0]),
    });
  };

  setDeliveryDays = (validDays = []) => {
    const deliveryDates = [];
    // const country = this.getBusinessCountry();
    for (let i = 0; i < 5; i++) {
      const currentTime = new Date();
      const weekday = (currentTime.getDay() + i) % 7;
      const newDate = currentTime.setDate(currentTime.getDate() + i);
      let isOpen = validDays.includes(weekday);

      // If store is closed today, don't show today in date list
      if (!i) {
        isOpen = Utils.isValidTimeToOrder({
          validDays: this.initialValidDays,
          validTimeFrom: this.validTimeFrom,
          validTimeTo: this.validTimeTo,
        });

        if (!isOpen) continue;
      }
      const deliveryDate = new Date(newDate).setHours(0, 0, 0);

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

  getFirstItemFromTimeList = date => {
    if (Utils.isDeliveryType() && Array.isArray(this.deliveryTimeList)) {
      // const { selectedDate } = this.state;

      if (date.isToday) {
        return {
          from: 'now',
          to: 'now',
        };
      } else {
        const firstTimeItem = this.deliveryTimeList[0];
        // should check if current time is late than validDelivery or pickup time
        return {
          from: getHourAndMinuteFromTime(firstTimeItem.from),
          to: getHourAndMinuteFromTime(firstTimeItem.to),
        };
      }
    } else if (Utils.isPickUpType() && Array.isArray(this.pickupTimeList)) {
      if (date.isToday) {
        const timeList = this.getHoursList(date);
        const firstTimeItem = timeList[0];
        return {
          from: getHourAndMinuteFromTime(firstTimeItem.from),
          to: getHourAndMinuteFromTime(firstTimeItem.to),
        };
      } else {
        const firstTimeItem = this.pickupTimeList[0];
        return {
          from: getHourAndMinuteFromTime(firstTimeItem.from),
          to: getHourAndMinuteFromTime(firstTimeItem.to),
        };
      }
    }

    return {};
  };

  handleSelectDate = date => {
    // No hours list when either store is closed that day or order should be delivered today
    if (!date.isOpen) {
      return;
    }
    const selectedHour = this.getFirstItemFromTimeList(date);
    // const selectedHour = {
    //   from: `${this.validDeliveryTimeFrom}:00`,
    //   to: `${this.validDeliveryTimeFrom + 1}:00`,
    // };

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
            Immediate
          </li>
        );
      }

      // item.from and item.to are time in ISOString format
      const from = getHourAndMinuteFromTime(item.from);
      const to = getHourAndMinuteFromTime(item.to);
      return (
        <li
          className={`location-display__hour-item text-center ${selectedHour.from === from ? 'selected' : ''}`}
          onClick={() => {
            this.handleSelectHour({ from, to });
          }}
          key={`${from} - ${to}`}
        >
          {`${toNumericTime(new Date(item.from), country)} - ${toNumericTime(new Date(item.to), country)}`}
        </li>
      );
    });
  };

  getPreOrderStartEndTime = () => {
    // const { selectedDate } = this.state;
    let startTime;
    let endTime;

    if (Utils.isDeliveryType()) {
      // if (selectedDate.isToday) {
      //   startTime =
      // }
      startTime = this.validDeliveryTimeFrom;
      endTime = this.validDeliveryTimeTo;
    }

    if (Utils.isPickUpType()) {
      // if (selectedDate.isToday) {
      // }
      startTime = this.validPickUpTimeFrom;
      endTime = this.validPickUpTimeTo;
    }

    return { startTime, endTime };
  };

  getHoursList = (selectedDate = {}) => {
    if (!this.validTimeFrom || !this.validTimeTo) {
      return [];
    }

    let displayTimeFrom;
    let displayTimeTo;
    let timeList = [];

    if (Utils.isDeliveryType()) {
      displayTimeTo = this.validDeliveryTimeTo;
      if (selectedDate.isToday) {
        displayTimeFrom = this.getStartTimeForToday();
        timeList.push({
          from: 'now',
          to: 'now',
        });
      } else {
        displayTimeFrom = this.validDeliveryTimeFrom;
      }
    }

    if (Utils.isPickUpType()) {
      displayTimeTo = this.validPickUpTimeTo;
      if (selectedDate.isToday) {
        displayTimeFrom = this.getStartTimeForToday();
      } else {
        displayTimeFrom = this.validPickUpTimeFrom;
      }
    }

    const { hour: startHour, minute: startMinute } = getHourAndMinuteFromString(displayTimeFrom);
    const { hour: endHour, minute: endMinute } = getHourAndMinuteFromString(displayTimeTo);
    const startTime = new Date().setHours(startHour || 0, startMinute || 0, 0);
    const endTime = new Date().setHours(endHour || 0, endMinute || 0, 0);
    const timeIncrease = i =>
      Utils.isDeliveryType() ? addTime(i, 1, 'h') : Utils.isPickUpType() ? addTime(i, 15, 'm') : 0;

    for (let i = new Date(startTime).toISOString(); compareTime(i.valueOf(), endTime.valueOf()); i = timeIncrease(i)) {
      timeList.push({
        from: i.valueOf(),
        to: timeIncrease(i),
      });
    }

    return timeList;
  };

  getStartTimeForToday = () => {
    const currentTime = new Date();

    if (Utils.isPickUpType()) {
      // Check what if store opens at 8am, and users get to this page on 5am
      const nearestStartFifthMinute = 5 * Math.round(currentTime.getMinutes() / 5);
      const tempStartBaseTime = new Date();
      tempStartBaseTime.setHours(currentTime.getHours(), nearestStartFifthMinute, 0);

      const startTimeForToday = getHourAndMinuteFromTime(addTime(tempStartBaseTime, 30, 'm'));
      return startTimeForToday;
    } else if (Utils.isDeliveryType()) {
      // Check what if store opens at 8am, and users get to this page on 5am
      const currentHour = currentTime.getHours();
      const currentMinute = currentTime.getMinutes();
      // If currentTime is smaller than validDeliveryTime, should
      const isAfterDeliveryStartTime = compareTime(this.validDeliveryTimeTo, currentTime);

      const startTimeForToday = isAfterDeliveryStartTime
        ? currentMinute
          ? currentHour + 2
          : currentHour + 1
        : this.validDeliveryTimeFrom;
      return startTimeForToday;
    }
  };

  renderHourSelector = () => {
    const { t } = this.props;
    const { selectedDate } = this.state;
    const timeList = this.getHoursList(selectedDate);

    return (
      <div className="form__group location-display__date-container">
        <label className="form__label font-weight-bold">{t('DeliveryTime')}</label>
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
      <footer className="footer-operation grid flex flex-middle flex-space-between">
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
