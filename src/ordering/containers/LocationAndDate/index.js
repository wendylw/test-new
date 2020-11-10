import React, { Component, Fragment } from 'react';
import { withTranslation } from 'react-i18next';
import Header from '../../../components/Header';
import { IconNext, IconSearch } from '../../../components/Icons';

import Constants from '../../../utils/constants';
import Utils from '../../../utils/utils';
import { computeStraightDistance } from '../../../utils/geoUtils';

import { connect } from 'react-redux';
import { bindActionCreators, compose } from 'redux';
import { getBusiness } from '../../redux/modules/app';
import { getAllBusinesses } from '../../../redux/modules/entities/businesses';
import { toNumericTime, addTime, isSameTime, padZero } from '../../../utils/datetime-lib';
import {
  actions as homeActionCreators,
  getTimeSlotList,
  getStoresList,
  getStoreHashCode,
} from '../../redux/modules/home';
import config from '../../../config';
import { actions as appActionCreators } from '../../redux/modules/app';
import qs from 'qs';
import beepLocationdateHint from '../../../images/beep-locationdate-hint.png';
import './OrderingLocationDate.scss';

const { ROUTER_PATHS, WEEK_DAYS_I18N_KEYS, PREORDER_IMMEDIATE_TAG, ADDRESS_RANGE, DELIVERY_METHOD } = Constants;
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
  if (!time) return {};
  if (typeof time === 'number') return { hour: time };
  const hour = parseInt(time.split(':')[0], 10);
  const minute = parseInt(time.split(':')[1] || 0, 10);

  return { hour, minute };
};

// Create time with time string like '01:20', 01 is hour and 20 is minute
const createTimeWithTimeString = timeString => {
  const { hour, minute } = getHourAndMinuteFromString(timeString);
  const currentTime = new Date();

  return currentTime.setHours(hour || 0, minute || 0, 0, 0);
};

const getHourAndMinuteFromTime = time => {
  const timeDate = new Date(time);
  const hour = padZero(timeDate.getHours());
  const minutes = padZero(timeDate.getMinutes());

  return `${hour}:${minutes}`;
};

const isAfterTime = (time1, time2) => new Date(time1).valueOf < new Date(time2).valueOf();

const isNoLaterThan = (time1, time2) => new Date(time1).valueOf() <= new Date(time2).valueOf();

const storehubLogisticsBusinessHours = ['09:00', '21:00'];

class LocationAndDate extends Component {
  state = {
    deliveryToAddress: '',
    selectedDate: {},
    selectedHour: {},
    timeSlot: [],
    h: Utils.getQueryVariable('h'),
    isDeliveryType: false,
    isPickUpType: false,
    nearlyStore: { name: '' },
    search: qs.parse(this.props.history.location.search, { ignoreQueryPrefix: true }),
    onlyType: Utils.getLocalStorageVariable('ONLYTYPE'),
    displayHourList: [],
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
    this.state.search.storeid ? this.setStoreFromSelect() : this.setStore();

    if (this.state.search.type.toLowerCase() === DELIVERY_METHOD.DELIVERY) {
      this.setDeliveryType();
    } else if (this.state.search.type.toLowerCase() === DELIVERY_METHOD.PICKUP) {
      this.setPickUpType(false);
    }
  };

  setDeliveryType = () => {
    this.setState(
      {
        isDeliveryType: true,
        isPickUpType: false,
        displayHourList: [],
      },
      async () => {
        if (this.state.nearlyStore.id) {
          let type = this.state.isPickUpType ? Constants.DELIVERY_METHOD.PICKUP : Constants.DELIVERY_METHOD.DELIVERY;
          let isSupport = false;
          this.state.nearlyStore.fulfillmentOptions.forEach(item => {
            if (item.toLowerCase() === type) isSupport = true;
          });

          if (!isSupport) {
            await this.reSetStore();
          }
        }
        this.setMethodsTime();
      }
    );
  };

  reSetStore = async () => {
    await this.props.homeActions.loadCoreStores();
    const { allStore } = this.props;

    if (Utils.getSessionVariable('deliveryAddress')) {
      if (allStore.length) {
        let stores = allStore;
        let type = Constants.DELIVERY_METHOD.DELIVERY;
        const { nearly, h } = await this.findNearyStore(stores, type);

        this.setState({
          h,
          nearlyStore: nearly,
        });
      }
    }
  };

  setPickUpType = (ischeckStore = true) => {
    this.setState(
      {
        isPickUpType: true,
        isDeliveryType: false,
        displayHourList: [],
      },
      () => {
        if (this.state.nearlyStore.id && ischeckStore) {
          let type = this.state.isPickUpType ? Constants.DELIVERY_METHOD.PICKUP : Constants.DELIVERY_METHOD.DELIVERY;
          let isSupport = false;
          this.state.nearlyStore.fulfillmentOptions.forEach(item => {
            if (item.toLowerCase() === type) isSupport = true;
          });

          if (!isSupport) {
            this.goStoreList();
          }
        } else {
          if (!this.state.nearlyStore.id && ischeckStore) this.goStoreList();
        }
        this.setMethodsTime();
      }
    );
  };

  setMethodsTime = () => {
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
  };

  setStoreFromSelect = async () => {
    if (this.state.search.storeid) {
      if (!this.props.allStore.length) {
        await this.props.homeActions.loadCoreStores();
      }
      let store = this.props.allStore.filter(item => item.id === this.state.search.storeid);

      this.setState({
        nearlyStore: store[0],
      });
      await Promise.all([
        this.props.appActions.loadCoreBusiness(this.state.search.storeid),
        this.props.homeActions.getStoreHashData(this.state.search.storeid),
      ]);

      this.setMethodsTime();

      this.setState({
        h: this.props.storeHash,
        displayHourList: [],
      });
    }
  };

  checkOnlyType = (stores, type) => {
    let isOnlyType = true,
      onlyType;
    for (let store of stores) {
      if (store.fulfillmentOptions.length > 1) {
        isOnlyType = false;
        break;
      }
    }

    if (isOnlyType) {
      onlyType = stores[0].fulfillmentOptions[0].toLowerCase();
      for (let store of stores) {
        if (store.fulfillmentOptions[0].toLowerCase() !== onlyType) {
          isOnlyType = false;
          break;
        }
      }
    }

    if (isOnlyType) {
      type = onlyType;
      Utils.setLocalStorageVariable('ONLYTYPE', type);
      if (type === DELIVERY_METHOD.DELIVERY) {
        this.setDeliveryType();
      } else if (type === DELIVERY_METHOD.PICKUP) {
        this.setPickUpType(false);
      }
    } else {
      Utils.removeLocalStorageVariable('ONLYTYPE');
      this.setState({
        onlyType: false,
      });
    }

    return type;
  };

  checkStoreIsClose = store => {
    const { qrOrderingSettings } = store;
    const { enablePreOrder } = qrOrderingSettings;

    return !(enablePreOrder || this.isValidTimeToOrder(qrOrderingSettings));
  };

  isValidTimeToOrder = ({ validTimeFrom, validTimeTo, breakTimeFrom, breakTimeTo, vacations, validDays }) => {
    const zero = num => (num < 10 ? '0' + num : num + '');
    const getDateStringFromTime = time => {
      time = new Date(time);
      return `${time.getFullYear()}${zero(time.getMonth() + 1)}${zero(time.getDate())}`;
    };
    const getHourAndMinuteStringFromTime = time => {
      time = new Date(time);
      return `${zero(time.getHours())}:${zero(time.getMinutes())}`;
    };

    const isVacation = (list, date) => {
      let isVacationDay = false;

      for (let i = 0; i < list.length; i++) {
        let item = list[i];
        if (date >= item.vacationTimeFrom && date <= item.vacationTimeTo) {
          return true;
        }
      }
      return isVacationDay;
    };

    const currTime = getHourAndMinuteStringFromTime(new Date());
    const week = new Date().getDay();
    const currDate = getDateStringFromTime(new Date());
    const vacationList = vacations
      ? vacations.map(item => {
          return {
            vacationTimeFrom: item.vacationTimeFrom.split('/').join(''),
            vacationTimeTo: item.vacationTimeTo.split('/').join(''),
          };
        })
      : [];
    const validDaysArray = Array.from(validDays, v => v - 1);

    if (isVacation(vacationList, currDate)) return false;

    if (!validDaysArray.includes(week)) return false;

    if (currTime < validTimeFrom || currTime > validTimeTo) return false;

    if (breakTimeFrom && breakTimeTo && currTime >= breakTimeFrom && currTime <= breakTimeTo) return false;

    return true;
  };

  findNearyStore = async (stores, type) => {
    const deliveryAddress = JSON.parse(Utils.getSessionVariable('deliveryAddress'));

    stores.forEach((item, idx, arr) => {
      if (item.location) {
        item.distance = computeStraightDistance(deliveryAddress.coords, {
          lat: item.location.latitude,
          lng: item.location.longitude,
        });
      }
    });
    stores = stores.filter(item => item.qrOrderingSettings && item.qrOrderingSettings.enableLiveOnline);
    stores = stores.filter(item => {
      return !this.checkStoreIsClose(item);
    });
    stores = stores.filter(item => item.fulfillmentOptions.map(citem => citem.toLowerCase()).indexOf(type) !== -1);
    let nearly;
    stores.forEach(item => {
      if (!nearly) {
        nearly = item;
      } else {
        item.distance < nearly.distance && (nearly = item);
      }
    });
    if (!nearly) {
      return { nearly: {} };
    }
    let result = await this.props.homeActions.getStoreHashData(nearly.id);
    const h = result.response.redirectTo;
    return {
      nearly,
      h,
    };
  };

  setStore = async () => {
    await this.props.homeActions.loadCoreStores();
    const { allStore = [] } = this.props;
    const { search } = this.state;

    this.checkOnlyType(allStore);
    if (
      Utils.getSessionVariable('deliveryAddress') &&
      this.state.search.type === DELIVERY_METHOD.DELIVERY &&
      (!search.h || Utils.getSessionVariable('deliveryAddressUpdate'))
    ) {
      if (allStore.length) {
        let stores = allStore;
        let { type } = this.state.search;
        const { nearly, h } = await this.findNearyStore(stores, type);
        this.setState(
          {
            h,
            nearlyStore: nearly,
            displayHourList: [],
          },
          async () => {
            await this.props.appActions.loadCoreBusiness(nearly.id);
            this.setMethodsTime();
          }
        );
        // window.location.href = `${ROUTER_PATHS.ORDERING_BASE}/?h=${h}&type=${type}`;
      }
    } else if (search.h && config.storeId) {
      let store = allStore.filter(item => item.id === config.storeId) || [];
      this.setState(
        {
          nearlyStore: store[0] || {},
          displayHourList: [],
        },
        async () => {
          await this.props.appActions.loadCoreBusiness(store[0].id);
          this.setMethodsTime();
        }
      );
    } else if (this.state.search.type === DELIVERY_METHOD.PICKUP) {
      this.goStoreList();
    }
  };

  // Create time with time string like '01:20', 01 is hour and 20 is minute
  createTimeWithTimeString = timeString => {
    const { hour, minute } = getHourAndMinuteFromString(timeString);
    const currentTime = new Date();

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
    const { business, allBusinessInfo } = this.props;
    const businessInfo = allBusinessInfo[business];
    const { qrOrderingSettings } = businessInfo || {};
    const { useStorehubLogistics } = qrOrderingSettings || {};
    const { hour: startHour, minute: startMinute } = getHourAndMinuteFromString(validTimeFrom);
    this.validTimeTo = validTimeTo;

    if (this.state.isDeliveryType) {
      // Calculate valid delivery time range
      this.validPreOrderTimeFrom = startMinute ? startHour + 2 : startHour + 1;

      if (useStorehubLogistics && Number(storehubLogisticsBusinessHours[0].slice(0, 2)) > this.validPreOrderTimeFrom) {
        this.validPreOrderTimeFrom = Number(storehubLogisticsBusinessHours[0].slice(0, 2));
      }
    }

    if (this.state.isPickUpType) {
      const tempStartBaseTime = createTimeWithTimeString(validTimeFrom);
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
    }
  };

  setInitialSelectedTime = deliveryDates => {
    this.deliveryDates = deliveryDates;
    const { business, allBusinessInfo } = this.props;
    const { enablePreOrder, disableOnDemandOrder, disableTodayPreOrder } = Utils.getDeliveryInfo({
      business,
      allBusinessInfo,
    });
    const { date } = Utils.getExpectedDeliveryDateFromSession();
    if (deliveryDates[0].isToday) {
      const list = this.getHoursList(deliveryDates[0]);
      if (list.length) {
        if (list[0].from === 'now' && list.length === 1 && disableOnDemandOrder && enablePreOrder) {
          this.deliveryDates.shift();
        }
        if (list[0].from !== 'now' && disableTodayPreOrder) {
          this.deliveryDates.shift();
        }
      } else {
        this.deliveryDates.shift();
      }
    }
    const initialSelectedTime =
      enablePreOrder && date.date ? Utils.getExpectedDeliveryDateFromSession() : { date: this.deliveryDates[0] };

    const firstItemFromTimeList = this.getFirstItemFromTimeList(initialSelectedTime.date);

    // if selectedDate is today, should auto select immediate

    this.setTimeSlot(initialSelectedTime.date, initialSelectedTime.hour || firstItemFromTimeList);

    initialSelectedTime.date = this.updateDate(initialSelectedTime.date, this.deliveryDates);
    this.setState({
      selectedDate: initialSelectedTime.date,
      selectedHour: initialSelectedTime.hour || firstItemFromTimeList,
    });
    // this.deliveryDates = deliveryDates;
  };

  updateDate = (date, list) => {
    for (let i = 0; i < list.length; i++) {
      let item = list[i];
      if (item.date === date.date) {
        return item;
      }
    }
    return date;
  };

  setDeliveryDays = (validDays = []) => {
    const deliveryDates = [];
    const { business, allBusinessInfo } = this.props;
    const businessInfo = allBusinessInfo[business];
    const { qrOrderingSettings } = businessInfo || {};
    const { useStorehubLogistics, disableTodayPreOrder, disableOnDemandOrder, enablePreOrder } =
      qrOrderingSettings || {};
    for (let i = 0; i < 5; i++) {
      const currentTime = new Date();
      const weekday = (currentTime.getDay() + i) % 7;
      const newDate = currentTime.setDate(currentTime.getDate() + i);
      let isOpen = validDays.includes(weekday);
      const deliveryDate = new Date(newDate).setHours(0, 0, 0, 0);
      let isValidTodayTime = !i;

      if (!i) {
        // Today option is open when user visits delivery time page before store is closed
        const isBeforeStoreClose = isNoLaterThan(currentTime, createTimeWithTimeString(this.validTimeTo));
        isOpen = validDays.includes(weekday) && isBeforeStoreClose && this.notVacation({ date: deliveryDate });

        if (!isOpen) continue;
      } else {
        !enablePreOrder && (isOpen = false);
        !this.notVacation({ date: deliveryDate }) && (isOpen = false);
      }

      if (useStorehubLogistics && this.state.isDeliveryType && storehubLogisticsBusinessHours[1] < this.validTimeTo) {
        const isBeforeStoreClose = isNoLaterThan(
          currentTime,
          this.createTimeWithTimeString(storehubLogisticsBusinessHours[1])
        );
        isValidTodayTime = validDays.includes(weekday) && isBeforeStoreClose;
        if (!isBeforeStoreClose && !i) continue;
      }
      if (enablePreOrder) {
        if (disableTodayPreOrder && disableOnDemandOrder && !i) {
          continue;
        }
      }

      deliveryDates.push({
        date: new Date(deliveryDate).toISOString(),
        isOpen: isOpen,
        isToday: isValidTodayTime,
      });
    }
    this.setInitialSelectedTime(deliveryDates);
  };

  showLocationSearch = () => {
    const { history } = this.props;
    let { search } = window.location;
    search = search.replace(/type=[^&]*/, `type=${this.state.isPickUpType ? 'pickup' : 'delivery'}`);
    search = search.replace(/&?storeid=[^&]*/, '');

    const callbackUrl = encodeURIComponent(`${ROUTER_PATHS.ORDERING_LOCATION_AND_DATE}${search}`);
    // next page don't need current page's callbackUrl.
    search = search.replace(/&?callbackUrl=[^&]*/, '');
    history.push({
      pathname: ROUTER_PATHS.ORDERING_LOCATION,
      search: `${search}&callbackUrl=${callbackUrl}`,
    });
  };

  handleBackClicked = () => {
    const { history, location } = this.props;
    const { state } = location || {};
    const { from } = state || {};
    const urlSearch = qs.parse(window.location.search, { ignoreQueryPrefix: true });
    Utils.removeSessionVariable('deliveryAddressUpdate');

    if ((from || urlSearch.from) === ROUTER_PATHS.ORDERING_CUSTOMER_INFO) {
      history.push({
        pathname: ROUTER_PATHS.ORDERING_CUSTOMER_INFO,
        search: window.location.search,
        state: from ? { from } : null,
      });
    } else if (!this.state.search.h && this.state.search.callbackUrl.split('?')[0] === '/' && this.state.h) {
      window.location.href = `${window.location.origin}${ROUTER_PATHS.ORDERING_BASE}${ROUTER_PATHS.ORDERING_HOME}?h=${this.state.h}&type=${this.state.search.type}`;
    } else if (this.state.search.h) {
      history.replace(this.state.search.callbackUrl);
    } else {
      history.go(-1);
    }
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

    this.setTimeSlot(date, selectedHour);
    this.setState({
      selectedDate: date,
      selectedHour: selectedHour,
      displayHourList: [],
    });
  };

  setTimeSlot = async (date, selectedHour) => {
    if (this.state.nearlyStore.id) {
      await this.props.homeActions.getTimeSlot(
        this.state.isDeliveryType ? Constants.DELIVERY_METHOD.DELIVERY : Constants.DELIVERY_METHOD.PICKUP,
        this.getFulfillDate(date, selectedHour),
        this.state.nearlyStore.id
      );
      const { timeSlotList, allBusinessInfo, business } = this.props;
      const { stores } = allBusinessInfo[business];
      const { qrOrderingSettings } = stores[0] || {};
      const { enablePerTimeSlotLimitForPreOrder, maxPreOrdersPerTimeSlot } = qrOrderingSettings || {};

      // timeSlotStartDate: { type: GraphQLString },
      // count: { type: GraphQLInt },
      if (!enablePerTimeSlotLimitForPreOrder) return;

      const list = [];

      timeSlotList.forEach(item => {
        if (item.count >= maxPreOrdersPerTimeSlot) {
          let { timeSlotStartDate } = item || {};
          timeSlotStartDate = new Date(timeSlotStartDate);
          let hour, minute;
          hour = timeSlotStartDate.getHours();
          minute = timeSlotStartDate.getMinutes();
          hour = hour < 10 ? '0' + hour : hour;
          minute = minute < 10 ? '0' + minute : minute;
          list.push(`${hour}:${minute}`);
        }
      });
      this.setState({
        timeSlot: list,
      });
    }
  };

  getFulfillDate = (date, hour) => {
    date = date.date;
    let fufillDate = new Date(date);

    // fufillDate.setHours(hours, min); // TODO need switch to marchat local time
    return fufillDate.toISOString();
  };

  handleSelectHour = hour => {
    this.setState({
      selectedHour: hour,
    });
  };

  getLocationDisplayTitle = () => {
    const { t } = this.props;

    return this.state.isDeliveryType ? t('DeliveryDetails') : t('PickUpDetails');
  };

  renderDeliveryTo = () => {
    if (this.state.isDeliveryType) {
      const { deliveryToAddress } = this.state;
      const { t } = this.props;

      return (
        <div className="padding-normal">
          <label className="location-date__label margin-top-bottom-small text-size-big text-weight-bolder">
            {t('DeliverTo')}
          </label>
          <div
            className="form__group flex flex-middle flex-space-between"
            onClick={this.showLocationSearch}
            data-heap-name="ordering.location-and-date.deliver-to"
            data-testid="deliverTo"
          >
            {!deliveryToAddress && <IconSearch className="icon icon__big icon__default flex__shrink-fixed" />}
            <p
              className={`location-date__input form__input flex flex-middle text-size-big text-line-height-base text-omit__single-line ${
                !deliveryToAddress ? '' : 'padding-normal'
              }`}
            >
              {deliveryToAddress || t('WhereToDeliverFood')}
            </p>
            {deliveryToAddress && <IconNext className="icon icon__normal icon__primary flex__shrink-fixed" />}
          </div>
        </div>
      );
    }

    if (this.state.isPickUpType) {
      const { t, business, allBusinessInfo = {} } = this.props;
      const businessInfo = allBusinessInfo[business] || {};
      const { stores = [] } = businessInfo;

      if (!stores.length) return;

      const pickUpAddress = Utils.getValidAddress(stores[0], ADDRESS_RANGE.COUNTRY);
      return (
        <div className="padding-normal">
          <label className="location-date__label margin-top-bottom-small text-size-big text-weight-bolder">
            {t('PickupAt')}
          </label>
          <p className="text-line-height-base">{pickUpAddress}</p>
        </div>
      );
    }
  };

  notVacation = day => {
    const { business, allBusinessInfo = {} } = this.props;
    const businessInfo = allBusinessInfo[business] || {};
    const { vacations } = businessInfo.qrOrderingSettings;
    if (!vacations) return true;
    day = new Date(day.date);
    const y = day.getFullYear();
    const m = day.getMonth() + 1;
    const d = day.getDate();

    day = +`${y}${m < 10 ? '0' + m : m}${d < 10 ? '0' + d : d}`;
    for (let i = 0; i < vacations.length; i++) {
      let item = vacations[i];
      let { vacationTimeFrom, vacationTimeTo } = item;
      vacationTimeFrom = +vacationTimeFrom.split('/').join('');
      vacationTimeTo = +vacationTimeTo.split('/').join('');
      if (day >= vacationTimeFrom && day <= vacationTimeTo) {
        return false;
      }
    }
    return true;
  };
  renderDeliveryOn = () => {
    const { selectedDate } = this.state;
    const { t } = this.props;
    return (
      <div className="padding-small">
        <label className="location-date__label padding-left-right-small margin-top-bottom-small text-size-big text-weight-bolder">
          {this.state.isDeliveryType && t('DeliverOn')}
          {this.state.isPickUpType && t('PickUpOn')}
        </label>
        <ul className="location-date__date flex flex-middle flex-space-between">
          {this.deliveryDates.map(deliverableTime => {
            const dateDetail = new Date(deliverableTime.date);
            const date = dateDetail.getDate();
            const weekday = dateDetail.getDay() % 7;
            const isSelected = dateDetail.getDay() === new Date(selectedDate.date).getDay();

            return (
              <li key={date}>
                <button
                  className={`location-date__button-date button ${
                    isSelected ? 'button__fill' : 'button__outline'
                  } padding-top-bottom-smaller padding-left-right-normal margin-left-right-small ${
                    deliverableTime.isToday ? 'text-uppercase' : ''
                  }`}
                  disabled={deliverableTime.isOpen ? '' : 'disabled'}
                  data-testid="preOrderDate"
                  data-heap-name="ordering.location-and-date.date-item"
                  data-heap-is-today={deliverableTime.isToday ? 'yes' : 'no'}
                  onClick={() => {
                    this.handleSelectDate(deliverableTime);
                  }}
                >
                  {deliverableTime.isToday ? (
                    t('Today')
                  ) : (
                    <Fragment>
                      <span className="location-date__date-weekday text-weight-bolder">
                        {t(WEEK_DAYS_I18N_KEYS[weekday])}
                      </span>
                      <time className="text-size-big">{date}</time>
                    </Fragment>
                  )}
                </button>
              </li>
            );
          })}
        </ul>
      </div>
    );
  };

  patchTimeList = (list, breakTimeFrom, breakTimeTo) => {
    let breakStartIndex, breakEndIndex;

    if (list.length) {
      let sList = [];
      if (list[0].from === 'now') {
        sList = sList.concat(list.slice(0, 1));
        list.splice(0, 1);
      }
      if (list.length) {
        let timeFrom = getHourAndMinuteFromTime(new Date(list[0].from));
        let timeTo = getHourAndMinuteFromTime(new Date(list[list.length - 1].to || list[list.length - 1].from));
        if (breakTimeFrom <= timeFrom && breakTimeTo >= timeTo) {
          return [...sList];
        }

        list.forEach((time, index, arr) => {
          const { from, to } = time;
          let timeFrom = getHourAndMinuteFromTime(new Date(from));
          let timeTo = getHourAndMinuteFromTime(new Date(to || from));

          if (timeFrom === breakTimeFrom) breakStartIndex = index;
          if (timeTo === breakTimeTo) breakEndIndex = index;
        });
        if (breakStartIndex !== undefined || breakEndIndex !== undefined) {
          breakStartIndex = breakStartIndex === undefined ? 0 : breakStartIndex;
          breakEndIndex = breakEndIndex === undefined ? list.length - 1 : breakEndIndex;
          list.splice(breakStartIndex, breakEndIndex - breakStartIndex + 1);
        }
      }
      list = [...sList, ...list];
    }
    return list;
  };

  patchBreakTime = list => {
    const { business, allBusinessInfo = {} } = this.props;
    const businessInfo = allBusinessInfo[business] || {};
    let { breakTimeFrom, breakTimeTo } = businessInfo.qrOrderingSettings;
    if (!breakTimeFrom || !breakTimeTo) return list;
    list = JSON.parse(JSON.stringify(list));
    // const zero = num => (num < 10 ? '0' + num : num + '');
    if (list[0].from === 'now') {
      let curr = getHourAndMinuteFromTime(new Date());
      // let min = Math.ceil(+curr.split(':')[1] / 15) * 15 + 30;
      // let pickUpEnd = min >= 60 ? zero(+curr.split(':')[0] + 1) + ':' + (min % 60) : curr.split(':')[0] + ':' + min;
      // let currEnd = this.state.isPickUpType ? pickUpEnd : zero(+curr.split(':')[0] + 2) + ':00';
      // if ((curr >= breakTimeFrom && curr < breakTimeTo) || (currEnd > breakTimeFrom && currEnd <= breakTimeTo)) {
      //   list.shift();
      // }
      if (curr >= breakTimeFrom && curr <= breakTimeTo) {
        list.shift();
      }
      return this.patchTimeList(list, breakTimeFrom, breakTimeTo);
    } else {
      return this.patchTimeList(list, breakTimeFrom, breakTimeTo);
    }
  };

  isDisplayImmediate = (disableOnDemandOrder, enablePreOrder) => {
    return !enablePreOrder || !disableOnDemandOrder;
  };

  collectHourList = item => {
    let timeString = item.from === 'now' ? 'now' : getHourAndMinuteFromTime(item.from);
    if (!this.state.displayHourList.includes(timeString)) {
      this.state.displayHourList.push(timeString);
      // this.setState({
      //   displayHourList: this.state.displayHourList,
      // });
    }
    return true;
  };

  renderHoursList = timeList => {
    if (!timeList || !timeList.length) return;

    const { t, business, allBusinessInfo } = this.props;
    const { selectedHour = {}, selectedDate } = this.state;
    const country = this.getBusinessCountry();

    timeList = this.patchBreakTime(timeList);
    const { qrOrderingSettings } = allBusinessInfo[business];
    const { disableOnDemandOrder, disableTodayPreOrder, enablePreOrder } = qrOrderingSettings;
    const dateList = this.deliveryDates.map(item => this.getDateFromTime(item.date));

    timeList = dateList.includes(this.getDateFromTime(selectedDate.date)) && selectedDate.isOpen ? timeList : [];

    return timeList.map(item => {
      if (item.from === PREORDER_IMMEDIATE_TAG.from) {
        return this.isDisplayImmediate(disableOnDemandOrder, enablePreOrder) ? (
          <li className="location-date__hour-item" key="deliveryOnDemandOrder">
            <button
              className={`location-date__button-hour button button__block text-center text-size-big ${
                selectedHour.from === PREORDER_IMMEDIATE_TAG.from ? 'selected text-weight-bolder' : ''
              }`}
              data-testid="preOrderHour"
              data-heap-name="ordering.location-and-date.time-item"
              data-heap-is-immediate="yes"
              onClick={() => {
                this.handleSelectHour({ ...item });
              }}
            >
              {this.collectHourList(item, disableOnDemandOrder, enablePreOrder) && t('Immediate')}
            </button>
          </li>
        ) : null;
      }

      let timeToDisplay;

      if (this.state.isDeliveryType) {
        timeToDisplay = `${toNumericTime(new Date(item.from), country)} - ${toNumericTime(new Date(item.to), country)}`;
      }

      if (this.state.isPickUpType) {
        timeToDisplay = `${toNumericTime(new Date(item.from), country)}`;
      }

      // item.from and item.to are time in ISOString format
      const from = getHourAndMinuteFromTime(item.from);
      const to = item.to && getHourAndMinuteFromTime(item.to);
      let isShowList = true;
      if (enablePreOrder) {
        if (this.state.selectedDate.isToday) {
          if (disableTodayPreOrder) {
            isShowList = false;
          }
        }
      } else {
        isShowList = false;
      }
      const isSoldOut = this.state.isDeliveryType ? this.isTimeSlot(from) : false;

      return (
        isShowList && (
          <li className="location-date__hour-item" key={`${from} - ${to}`}>
            <button
              className={`location-date__button-hour button button__block text-center text-size-big ${
                selectedHour.from === from ? 'selected text-weight-bolder' : ''
              }`}
              data-testid="preOrderHour"
              data-heap-name="ordering.location-and-date.time-item"
              data-heap-is-immediate="no"
              onClick={() => {
                !isSoldOut && this.handleSelectHour({ from, to });
              }}
            >
              {this.collectHourList(item) && timeToDisplay}
              {isSoldOut && <span className="text-uppercase"> {`(${this.props.t('SoldOut')})`}</span>}
            </button>
          </li>
        )
      );
    });
  };

  isTimeSlot = from => {
    return this.state.timeSlot.includes(from);
  };

  getValidStartingTimeString = (baseTimeString = this.validTimeFrom) => {
    const { hour: startHour, minute: startMinute } = getHourAndMinuteFromString(baseTimeString);
    let validStartingTime;

    if (this.state.isDeliveryType) {
      validStartingTime = `${startMinute ? startHour + 2 : startHour + 1} : 0`;
    }

    if (this.state.isPickUpType) {
      const tempStartBaseTime = createTimeWithTimeString(baseTimeString);
      const validStartBaseTime = closestValidTime(tempStartBaseTime, 30, 'm');

      validStartingTime = getHourAndMinuteFromTime(validStartBaseTime);
    }

    return validStartingTime;
  };

  getHoursListForToday = (selectedDate = {}) => {
    if (!selectedDate.isToday) return;
    const { business, allBusinessInfo } = this.props;
    const businessInfo = allBusinessInfo[business];
    const { qrOrderingSettings } = businessInfo || {};
    const { useStorehubLogistics } = qrOrderingSettings || {};
    const limit = useStorehubLogistics && this.state.isDeliveryType;
    const currentTime = new Date();
    const storeOpenTime = createTimeWithTimeString(
      limit && this.validTimeFrom < storehubLogisticsBusinessHours[0]
        ? storehubLogisticsBusinessHours[0]
        : this.validTimeFrom
    );
    const storeCloseTime = createTimeWithTimeString(
      limit && this.validTimeTo > storehubLogisticsBusinessHours[1]
        ? storehubLogisticsBusinessHours[1]
        : this.validTimeTo
    );
    const validStartingTimeString = this.getValidStartingTimeString(getHourAndMinuteFromTime(currentTime));
    const fullTimeList = this.getHoursList();

    // If user visit this webpage before store opens, show full time list

    if (isNoLaterThan(currentTime, storeOpenTime)) {
      if (this.fullTimeList.length) {
        if (new Date(this.fullTimeList[0].from).getHours() - new Date().getHours() < 2) {
          return this.fullTimeList.slice(1);
        }
      }
      return this.fullTimeList;
    }

    // If user visit this page in the middle of the day, first item should be 'immediate'
    if (isNoLaterThan(storeOpenTime, currentTime) && isNoLaterThan(currentTime, storeCloseTime)) {
      // If calculated first item display is after store close
      // Check here use isAfterTime because there is a case if what needs to display after 'immediate'
      // is 6:30, and close time is 6: 30, should show 6:30
      if (isAfterTime(storeCloseTime, createTimeWithTimeString(validStartingTimeString))) {
        return [PREORDER_IMMEDIATE_TAG];
      }
      const timeUnitToCompare = this.state.isDeliveryType ? ['h'] : ['h', 'm'];
      const startTimeInList = fullTimeList.findIndex(item =>
        isSameTime(item.from, createTimeWithTimeString(validStartingTimeString), timeUnitToCompare)
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
    const { business, allBusinessInfo } = this.props;
    const businessInfo = allBusinessInfo[business];
    const { qrOrderingSettings } = businessInfo || {};
    const { useStorehubLogistics } = qrOrderingSettings || {};

    const { hour: startHour, minute: startMinute } = getHourAndMinuteFromString(
      useStorehubLogistics &&
        this.state.isDeliveryType &&
        storehubLogisticsBusinessHours[0] > this.validPreOrderTimeFrom
        ? storehubLogisticsBusinessHours[0]
        : this.validPreOrderTimeFrom
    );
    const { hour: endHour, minute: endMinute } = getHourAndMinuteFromString(
      useStorehubLogistics && this.state.isDeliveryType && storehubLogisticsBusinessHours[1] < this.validTimeTo
        ? storehubLogisticsBusinessHours[1]
        : this.validTimeTo
    );
    const startTime = new Date().setHours(startHour || 0, startMinute || 0, 0, 0);
    const endTime = new Date().setHours(endHour || 0, endMinute || 0, 0, 0);
    const timeIncrease = i =>
      this.state.isDeliveryType ? addTime(i, 1, 'h') : this.state.isPickUpType ? addTime(i, 15, 'm') : 0;

    const loopCheck = i => {
      // Assuming store closes at 10:00 pm
      // Final delivery time should be 22:00 and final pickup time should be 21:30
      // Data structure of the last item in hour list
      // For delivery is { from: "21:00" , to: "22:00" }
      // For pickup is { from: "21:30" , to: "21:45" }
      // So for delivery should compare 'to' and for pickup should compare 'from'
      if (this.state.isDeliveryType) {
        return timeIncrease(i);
      }

      if (this.state.isPickUpType) {
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

      if (this.state.isDeliveryType) {
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
    // const windowHeight = document.documentElement.clientHeight || document.body.clientHeight;
    // const footerHeight = this.footerRef.current.clientHeight || this.footerRef.current.offsetHeight;

    return (
      <div className="padding-top-bottom-normal">
        {this.state.isDeliveryType && (
          <label className="location-date__label padding-left-right-normal margin-top-bottom-small text-size-big text-weight-bolder">
            {t('DeliveryTime')}
          </label>
        )}
        {this.state.isPickUpType && (
          <label className="location-date__label padding-left-right-normal margin-top-bottom-small text-size-big text-weight-bolder">
            {t('PickupTime')}
          </label>
        )}
        <ul
          ref={this.timeListRef}
          className="location-date__hour"
          // style={{ maxHeight: `${windowHeight - footerHeight - 332}px` }}
        >
          {this.renderHoursList(timeList)}
        </ul>
      </div>
    );
  };

  checkStoreStatus = (selectedHour, { enablePreOrder, disableOnDemandOrder, disableTodayPreOrder }, selectDate) => {
    if (selectedHour.from === 'now') {
      if (enablePreOrder) {
        if (disableOnDemandOrder) {
          return true;
        } else {
          return false;
        }
      } else {
        return false;
      }
    } else {
      if (enablePreOrder) {
        if (selectDate.isToday) {
          if (disableTodayPreOrder) {
            return true;
          } else {
            return false;
          }
        } else {
          return false;
        }
      } else {
        return true;
      }
    }
  };

  checkIfCanContinue = () => {
    const { business, allBusinessInfo } = this.props;
    const { selectedDate = {} } = this.state;
    const { selectedHour = {}, displayHourList, timeSlot, isDeliveryType } = this.state;
    const { address: deliveryToAddress } = JSON.parse(Utils.getSessionVariable('deliveryAddress') || '{}');
    const deliveryInfo = Utils.getDeliveryInfo({ business, allBusinessInfo });

    if (!displayHourList.includes(selectedHour.from) || (isDeliveryType && timeSlot.includes(selectedHour.from))) {
      return true;
    }

    const dateList = this.deliveryDates.map(item => this.getDateFromTime(item.date));

    if (!dateList.includes(this.getDateFromTime(selectedDate.date))) return true;

    if (!selectedDate.isOpen || !this.state.nearlyStore.id) return true;

    if (this.state.isDeliveryType) {
      if (deliveryToAddress && selectedDate.date && selectedHour.from) {
        return this.checkStoreStatus(selectedHour, deliveryInfo, selectedDate.date);
      }
    }

    if (this.state.isPickUpType) {
      if (selectedDate.date && selectedHour.from) {
        return this.checkStoreStatus(selectedHour, deliveryInfo, selectedDate.date);
      }
    }
    return true;
  };

  getDateFromTime = date => {
    let currDate = new Date(date);
    const zero = num => (num < 10 ? '0' + num : num + '');

    return `${currDate.getFullYear()}${zero(currDate.getMonth() + 1)}${zero(currDate.getDate())}`;
  };

  goToNext = () => {
    const { history, location } = this.props;
    const { search, h, selectedDate, selectedHour, isPickUpType } = this.state;
    const { state } = location || {};
    const { from } = state || {};
    const urlType = Utils.getOrderTypeFromUrl();
    const currentType = isPickUpType ? DELIVERY_METHOD.PICKUP : DELIVERY_METHOD.DELIVERY;

    if (isPickUpType) delete selectedHour.to;

    Utils.setExpectedDeliveryTime({
      date: selectedDate,
      hour: selectedHour,
    });
    Utils.removeSessionVariable('deliveryAddressUpdate');

    const callbackUrl = Utils.getQueryString('callbackUrl');

    if (typeof callbackUrl === 'string' || (from === ROUTER_PATHS.ORDERING_CUSTOMER_INFO && urlType !== currentType)) {
      if ((callbackUrl || '').split('?')[0] === '/customer') {
        // from customer
        this.checkDetailChange(search);
      } else {
        // from ordering
        window.location.href = `${window.location.origin}${Constants.ROUTER_PATHS.ORDERING_BASE}${
          callbackUrl ? callbackUrl.split('?')[0] : ''
        }?${h ? 'h=' + h + '&' : ''}type=${isPickUpType ? 'pickup' : 'delivery'}`;
        // history.replace({
        //   pathname: callbackUrl.split('?')[0],
        //   search: `${this.state.h ? 'h=' + this.state.h + '&' : ''}type=${
        //     this.state.isPickUpType ? 'pickup' : 'delivery'
        //   }`,
        // });
      }
    } else {
      history.go(-1);
    }
  };

  checkDetailChange = async search => {
    const cachedeliveryAddress = Utils.getSessionVariable('cachedeliveryAddress');
    const cacheexpectedDeliveryDate = Utils.getSessionVariable('cacheexpectedDeliveryDate');
    const cacheexpectedDeliveryHour = Utils.getSessionVariable('cacheexpectedDeliveryHour');
    const deliveryAddress = Utils.getSessionVariable('deliveryAddress');
    const expectedDeliveryDate = Utils.getSessionVariable('expectedDeliveryDate');
    const expectedDeliveryHour = Utils.getSessionVariable('expectedDeliveryHour');

    if (search.storeid && search.storeid !== config.storeId) {
      let result = await this.props.homeActions.getStoreHashData(search.storeid);
      const h = result.response.redirectTo;
      window.location.href = `${window.location.origin}${Constants.ROUTER_PATHS.ORDERING_BASE}${
        Constants.ROUTER_PATHS.ORDERING_CART
      }?h=${h}&type=${this.state.isPickUpType ? 'pickup' : 'delivery'}`;
      // this.props.history.replace({
      //   pathname: Constants.ROUTER_PATHS.ORDERING_CART,
      //   search: `h=${h}&type=${this.state.isPickUpType ? 'pickup' : 'delivery'}`,
      // });
      return;
    }
    if (
      cachedeliveryAddress !== deliveryAddress ||
      cacheexpectedDeliveryDate !== expectedDeliveryDate ||
      cacheexpectedDeliveryHour !== expectedDeliveryHour
    ) {
      Utils.removeSessionVariable('cachedeliveryAddress');
      Utils.removeSessionVariable('cacheexpectedDeliveryDate');
      Utils.removeSessionVariable('cacheexpectedDeliveryHour');

      this.props.history.replace({
        pathname: Constants.ROUTER_PATHS.ORDERING_CART,
        search: `h=${this.state.h}&type=${
          this.state.isPickUpType ? Constants.DELIVERY_METHOD.PICKUP : Constants.DELIVERY_METHOD.DELIVERY
        }`,
      });
      return;
    }
    const type = this.state.isPickUpType ? Constants.DELIVERY_METHOD.PICKUP : Constants.DELIVERY_METHOD.DELIVERY;
    if (type !== this.state.search.type.toLowerCase()) {
      this.props.history.replace({
        pathname: Constants.ROUTER_PATHS.ORDERING_CART,
        search: `h=${this.state.h}&type=${
          this.state.isPickUpType ? Constants.DELIVERY_METHOD.PICKUP : Constants.DELIVERY_METHOD.DELIVERY
        }`,
      });
      return;
    }
    this.props.history.push(search.callbackUrl);
  };

  renderContinueButton = () => {
    const { t } = this.props;

    return (
      <footer
        ref={ref => (this.footerEl = ref)}
        className="footer flex__shrink-fixed padding-top-bottom-small padding-left-right-normal"
      >
        <button
          className="button button__block button__fill padding-normal margin-top-bottom-smaller text-weight-bolder text-uppercase"
          data-testid="continue"
          data-heap-name="ordering.location-and-date.continue-btn"
          disabled={this.checkIfCanContinue()}
          onClick={this.goToNext}
        >
          {t('Continue')}
        </button>
      </footer>
    );
  };

  goStoreList = () => {
    const { history } = this.props;
    const { search, h, isPickUpType, nearlyStore } = this.state;

    if (search.storeid) {
      history.push({
        pathname: Constants.ROUTER_PATHS.ORDERING_STORE_LIST,
        search: `${search.h ? 'h=' + h + '&' : ''}storeid=${search.storeid}&type=${
          isPickUpType ? Constants.DELIVERY_METHOD.PICKUP : Constants.DELIVERY_METHOD.DELIVERY
        }&callbackUrl=${encodeURIComponent(search.callbackUrl)}`,
      });
    } else {
      this.props.history.push({
        pathname: Constants.ROUTER_PATHS.ORDERING_STORE_LIST,
        search: `${h ? 'h=' + h + '&' : ''}storeid=${nearlyStore.id}&type=${
          isPickUpType ? Constants.DELIVERY_METHOD.PICKUP : Constants.DELIVERY_METHOD.DELIVERY
        }&callbackUrl=${encodeURIComponent(search.callbackUrl)}`,
      });
    }
  };

  renderSelectStore = () => {
    const { t } = this.props;
    const { nearlyStore } = this.state;
    const { name } = nearlyStore || {};

    return (
      <div
        className="padding-normal"
        data-testid="deliverTo"
        onClick={this.goStoreList}
        data-heap-name="ordering.location-and-date.selected-store"
      >
        <label className="location-date__label margin-top-bottom-small text-size-big text-weight-bolder">
          {t('SelectedStore')}
        </label>
        <div className="form__group flex flex-middle flex-space-between">
          <p className="location-date__input padding-normal text-size-big text-line-height-base text-omit__single-line">
            {name}
          </p>
          <IconNext className="icon icon__normal icon__primary flex__shrink-fixed" />
        </div>
      </div>
    );
  };

  renderDeliveryHelpText = () => {
    const { t } = this.props;
    return (
      <div className="padding-normal">
        <img src={beepLocationdateHint} alt="Delivery no address" />
        <p className="location-date__help-text text-center text-size-big margin-top-bottom-normal">
          {t('DeliveryHelpText')}
        </p>
      </div>
    );
  };

  render() {
    const { t } = this.props;
    const { isDeliveryType, isPickUpType, onlyType, deliveryToAddress } = this.state;

    return (
      <section className="location-date flex flex-column" data-heap-name="ordering.location-and-date.container">
        <Header
          headerRef={ref => (this.headerEl = ref)}
          className="flex-middle"
          contentClassName="flex-middle"
          data-heap-name="ordering.location-and-date.header"
          isPage={true}
          title={this.getLocationDisplayTitle()}
          navFunc={this.handleBackClicked}
        />
        <div
          className="location-date__container"
          style={{
            top: `${Utils.mainTop({
              headerEls: [this.headerEl],
            })}px`,
            height: Utils.containerHeight({
              headerEls: [this.headerEl],
              footerEls: [this.footerEl],
            }),
          }}
        >
          {!onlyType && (
            <ul className="flex flex-middle padding-normal">
              <li
                className={`location-date__delivery text-center padding-small text-size-big text-line-height-base text-weight-bolder ${
                  isDeliveryType ? 'active' : ''
                }`}
                onClick={this.setDeliveryType}
                data-heap-name="ordering.location-and-date.delivery"
              >
                {t('Delivery')}
              </li>
              <li
                className={`location-date__pickup text-center padding-small text-size-big text-line-height-base text-weight-bolder ${
                  isPickUpType ? 'active' : ''
                }`}
                onClick={this.setPickUpType}
                data-heap-name="ordering.location-and-date.pickup"
              >
                {t('Pickup')}
              </li>
            </ul>
          )}
          {isPickUpType && this.renderSelectStore()}
          {this.renderDeliveryTo()}
          {this.state.isDeliveryType ? (this.state.deliveryToAddress ? this.renderSelectStore() : null) : null}
          {this.state.isDeliveryType
            ? this.state.deliveryToAddress
              ? this.renderDeliveryOn()
              : null
            : this.renderDeliveryOn()}
          {this.state.isDeliveryType
            ? this.state.deliveryToAddress
              ? this.renderHourSelector()
              : null
            : this.renderHourSelector()}
          {isDeliveryType && !deliveryToAddress && this.renderDeliveryHelpText()}
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
      allStore: getStoresList(state),
      storeHash: getStoreHashCode(state),
      timeSlotList: getTimeSlotList(state),
    }),

    dispatch => ({
      homeActions: bindActionCreators(homeActionCreators, dispatch),
      appActions: bindActionCreators(appActionCreators, dispatch),
    })
  )
)(LocationAndDate);
