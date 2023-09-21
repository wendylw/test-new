import dayjs from 'dayjs';
import _get from 'lodash/get';
import PropTypes from 'prop-types';
import React, { Component } from 'react';
import qs from 'qs';
import { bindActionCreators, compose } from 'redux';
import { connect } from 'react-redux';
import { withTranslation } from 'react-i18next';
import HybridHeader from '../../../components/HybridHeader';
import PageLoader from '../../../components/PageLoader';
import beepLocationdateHint from '../../../images/beep-locationdate-hint.png';
import { IconNext, IconSearch } from '../../../components/Icons';
import {
  actions as locationAndDateActionCreator,
  getDeliveryType,
  getStoreId as getCachedStoreId,
  getAddressName,
  getOrderDateList,
  getSelectedOrderDate,
  getAvailableTimeSlotList,
  getSelectedTime,
  getStore,
  getSelectedDay,
  getSelectedFromTime,
  isShowLoading,
  getOriginalDeliveryType,
  getAddressInfo as getCachedAddressInfo,
  getCurrentDate,
} from '../../redux/modules/locationAndDate';
import Constants from '../../../utils/constants';
import Utils from '../../../utils/utils';
import * as storeUtils from '../../../utils/store-utils';
import * as timeLib from '../../../utils/time-lib';
import {
  actions as appActionCreators,
  getBusinessDeliveryTypes,
  getBusinessUTCOffset,
  getStoreInfoForCleverTap,
  getStoreHashCode,
  getStoreId as getSavedStoreId,
} from '../../redux/modules/app';
import { getAddressInfo as getSavedAddressInfo } from '../../../redux/modules/address/selectors';
import { setAddressInfo as setAddressInfoThunk } from '../../../redux/modules/address/thunks';
import { withAddressInfo } from '../Location/withAddressInfo';
import CleverTap from '../../../utils/clevertap';
import logger from '../../../utils/monitoring/logger';
import prefetch from '../../../common/utils/prefetch-assets';
import './OrderingLocationDate.scss';

const { DELIVERY_METHOD, ROUTER_PATHS, WEEK_DAYS_I18N_KEYS, TIME_SLOT_NOW, ADDRESS_RANGE } = Constants;

class LocationAndDate extends Component {
  headerEl = null;

  footerEl = null;

  resetWhenWillUnmount = false;

  componentDidMount = async () => {
    const { actions, location, savedAddressInfo, cachedAddressInfo, savedStoreId } = this.props;
    const { selectedAddress: selectedAddressInfo = null } = location.state || {};

    const queryDeliveryType = (this.query.type || '').toLowerCase();
    this.ensureDeliveryType(queryDeliveryType);
    const expectedDeliveryDate = Utils.getExpectedDeliveryDateFromSession();

    const expectedDay = _get(expectedDeliveryDate, 'date.date', null);
    const expectedFromTime = _get(expectedDeliveryDate, 'hour.from', null);
    // if delivery address updated from location page, should trigger `initial action` find nearest store
    const storeId = selectedAddressInfo ? null : savedStoreId;

    const { storeid } = this.query;
    const { selectedDay, selectedFromTime, deliveryType, originalDeliveryType } = this.props;

    await actions.initial({
      currentDate: new Date(),
      deliveryType: deliveryType || queryDeliveryType,
      storeId: storeid || storeId,
      addressInfo: selectedAddressInfo || cachedAddressInfo || savedAddressInfo,
      expectedDay: selectedDay || expectedDay,
      expectedFromTime: selectedFromTime || expectedFromTime,
      originalDeliveryType: originalDeliveryType ?? queryDeliveryType,
    });

    const { cachedStoreId, cachedAddressInfo: latestCachedAddressInfo } = this.props;

    if (deliveryType === DELIVERY_METHOD.DELIVERY) {
      CleverTap.pushEvent(
        `Shipping Details${latestCachedAddressInfo ? '' : ' (missing delivery address)'} - View Page`
      );
    }

    if (!cachedStoreId && deliveryType === DELIVERY_METHOD.PICKUP) {
      this.gotoStoreList(DELIVERY_METHOD.PICKUP, storeid || savedStoreId);
    }

    prefetch(['ORD_SL', 'ORD_CI', 'ORD_LOC'], ['OrderingCustomer', 'OrderingDelivery']);
  };

  componentWillUnmount() {
    const { actions } = this.props;

    if (this.resetWhenWillUnmount) {
      actions.reset();
      this.resetWhenWillUnmount = false;
    }
  }

  get query() {
    const { history } = this.props;

    return qs.parse(history.location.search, { ignoreQueryPrefix: true });
  }

  get isDelivery() {
    const { deliveryType } = this.props;

    return deliveryType === DELIVERY_METHOD.DELIVERY;
  }

  get isPickup() {
    const { deliveryType } = this.props;

    return deliveryType === DELIVERY_METHOD.PICKUP;
  }

  gotoStoreList = (deliveryType, storeId) => {
    const { history, location } = this.props;

    const from = _get(location, 'state.from', null);

    const searchParams = {
      h: this.query.h,
      storeid: storeId,
      type: deliveryType,
      callbackUrl: this.query.callbackUrl,
    };

    history.push({
      pathname: Constants.ROUTER_PATHS.ORDERING_STORE_LIST,
      state: from ? { from } : null,
      search: qs.stringify(searchParams, { addQueryPrefix: true }),
    });
  };

  handleGotoStoreListClick = () => {
    const { deliveryType, cachedStoreId } = this.props;

    this.gotoStoreList(deliveryType, cachedStoreId);
  };

  ensureDeliveryType = deliveryType => {
    if (![DELIVERY_METHOD.DELIVERY, DELIVERY_METHOD.PICKUP].includes(deliveryType)) {
      if ([DELIVERY_METHOD.TAKE_AWAY, DELIVERY_METHOD.DINE_IN].includes(deliveryType)) {
        window.location.href = `${window.location.origin}${ROUTER_PATHS.DINE}`;
      } else {
        window.location.href = `${window.location.origin}${ROUTER_PATHS.ORDERING_BASE}`;
      }
    }
  };

  getLocationDisplayTitle = () => {
    const { t, deliveryType } = this.props;

    return deliveryType === DELIVERY_METHOD.DELIVERY ? t('DeliveryDetails') : t('PickUpDetails');
  };

  handleBackClicked = () => {
    const { history, location } = this.props;
    const stateFrom = _get(location, 'state.from', null);
    const { callbackUrl } = this.query;
    const from = stateFrom || this.query.from;
    // reset redux store data when will unmount
    this.resetWhenWillUnmount = true;

    if (from === ROUTER_PATHS.ORDERING_CUSTOMER_INFO) {
      const state = stateFrom ? { from: stateFrom } : null;

      if (callbackUrl) {
        return history.replace(callbackUrl, state);
      }

      // For compatibility sake, in case some users are still using the old version.
      return history.push({
        pathname: ROUTER_PATHS.ORDERING_CUSTOMER_INFO,
        search: window.location.search,
        state,
      });
    }

    if (callbackUrl) {
      return history.replace(callbackUrl);
    }

    return history.go(-1);
  };

  isContinueButtonDisabled = () => {
    const { store, addressName, orderDateList, availableTimeSlotList, selectedOrderDate, selectedTime } = this.props;

    if (!store) {
      return true;
    }

    if (this.isDelivery && !addressName) {
      return true;
    }

    if (!selectedOrderDate || !selectedTime) {
      return true;
    }

    if (!selectedOrderDate.isOpen) {
      return true;
    }

    if (selectedTime.soldOut) {
      return true;
    }

    const isInDateList = orderDateList.some(date => dayjs(date.date).isSame(selectedOrderDate.date));

    if (!isInDateList) {
      return true;
    }

    const isInTimeList = availableTimeSlotList.some(time => timeLib.isSame(time.from, selectedTime.from));

    if (!isInTimeList) {
      return true;
    }

    return false;
  };

  goToNext = async () => {
    logger.log('Ordering_LocationAndDate_ClickContinueButton');
    const {
      selectedOrderDate,
      selectedTime,
      appActions,
      savedStoreId,
      cachedStoreId,
      originalDeliveryType,
      deliveryType,
      location,
      history,
      setAddressInfo,
      cachedAddressInfo,
    } = this.props;

    const expectedDate = {
      date: selectedOrderDate.date.toISOString(),
      isOpen: selectedOrderDate.isOpen,
      isToday: selectedOrderDate.isToday,
    };
    const expectedTime = this.isDelivery
      ? {
          from: selectedTime.from,
          to: selectedTime.to,
        }
      : {
          from: selectedTime.from,
        };

    Utils.setExpectedDeliveryTime({
      date: expectedDate,
      hour: expectedTime,
    });
    // reset redux store data when will unmount
    this.resetWhenWillUnmount = true;

    if (cachedAddressInfo) {
      await setAddressInfo(cachedAddressInfo);
    }

    await appActions.getStoreHashData(cachedStoreId);

    const { storeHashCode } = this.props;
    const h = decodeURIComponent(storeHashCode);
    const from = _get(location, 'state.from', null);

    if (originalDeliveryType && originalDeliveryType !== deliveryType) {
      await CleverTap.pushEvent(`Shipping Details - Switched to ${deliveryType}`);
    }

    if (from === ROUTER_PATHS.ORDERING_CUSTOMER_INFO) {
      const deliveryTypeHasChanged = this.query.type !== deliveryType;
      const storeHasChanged = cachedStoreId !== savedStoreId;

      if (deliveryTypeHasChanged) {
        this.gotoOrderingHomePage(deliveryType, h);
        return;
      }

      if (storeHasChanged) {
        this.gotoOrderingCartPage(deliveryType, h);
        return;
      }
    }

    if (this.query.callbackUrl) {
      const query = qs.stringify(
        {
          h,
          type: deliveryType,
        },
        {
          addQueryPrefix: true,
        }
      );

      // callbackUrl equals 'undefined' from customer page
      const callbackUrl = this.query.callbackUrl === 'undefined' ? '/' : this.query.callbackUrl;

      const callbackPath = callbackUrl.split('?')[0];

      window.location.href = `${ROUTER_PATHS.ORDERING_BASE}${callbackPath}${query}`;
      return;
    }

    history.go(-1);
  };

  gotoOrderingHomePage = (type, h) => {
    const queryString = qs.stringify(
      {
        h,
        type,
      },
      {
        addQueryPrefix: true,
      }
    );

    window.location.href = `${ROUTER_PATHS.ORDERING_BASE}${queryString}`;
  };

  gotoOrderingCartPage = (type, h) => {
    const queryString = qs.stringify(
      {
        h,
        type,
      },
      {
        addQueryPrefix: true,
      }
    );

    window.location.href = `${ROUTER_PATHS.ORDERING_BASE}${ROUTER_PATHS.ORDERING_CART}${queryString}`;
  };

  renderContinueButton = () => {
    const { t } = this.props;

    return (
      <footer
        ref={ref => {
          this.footerEl = ref;
        }}
        className="footer flex__shrink-fixed padding-top-bottom-small padding-left-right-normal"
      >
        <button
          className="button button__block button__fill padding-normal margin-top-bottom-smaller text-weight-bolder text-uppercase"
          data-testid="continue"
          data-test-id="ordering.location-and-date.continue-btn"
          disabled={this.isContinueButtonDisabled()}
          onClick={this.goToNext}
        >
          {t('Continue')}
        </button>
      </footer>
    );
  };

  gotoLocationSearch = () => {
    const { deliveryType, history } = this.props;
    const { pathname } = history.location;

    const callbackQueryString = qs.stringify(
      {
        type: deliveryType,
        h: this.query.h,
        callbackUrl: this.query.callbackUrl,
      },
      { addQueryPrefix: true }
    );

    const queryParams = {
      type: deliveryType,
      h: this.query.h,
      callbackUrl: `${pathname}${callbackQueryString}`,
    };

    history.replace({
      pathname: ROUTER_PATHS.ORDERING_LOCATION,
      search: qs.stringify(queryParams, { addQueryPrefix: true }),
      state: { updateAddressEnabled: false },
    });
  };

  handleDeliveryTypeChange = async deliveryType => {
    const { actions } = this.props;
    await actions.deliveryTypeChanged(deliveryType);

    const { store } = this.props;

    if (deliveryType === DELIVERY_METHOD.PICKUP && !store) {
      this.gotoStoreList(DELIVERY_METHOD.PICKUP, null);
    }
  };

  renderDeliveryTypesSelector = () => {
    const { t, deliveryType, storeInfoForCleverTap } = this.props;
    const isDelivery = deliveryType === DELIVERY_METHOD.DELIVERY;
    const isPickup = deliveryType === DELIVERY_METHOD.PICKUP;

    return (
      <ul className="flex flex-middle padding-normal">
        <li
          className={`location-date__delivery text-center padding-small text-size-big text-line-height-base text-weight-bolder ${
            isDelivery ? 'active' : ''
          }`}
          onClick={() => {
            CleverTap.pushEvent('Shipping Details - click delivery tab', storeInfoForCleverTap);
            this.handleDeliveryTypeChange(DELIVERY_METHOD.DELIVERY);
          }}
          data-test-id="ordering.location-and-date.delivery"
        >
          {t('Delivery')}
        </li>
        <li
          className={`location-date__pickup text-center padding-small text-size-big text-line-height-base text-weight-bolder ${
            isPickup ? 'active' : ''
          }`}
          onClick={() => {
            CleverTap.pushEvent('Shipping Details - click pickup tab', storeInfoForCleverTap);
            this.handleDeliveryTypeChange(DELIVERY_METHOD.PICKUP);
          }}
          data-test-id="ordering.location-and-date.pickup"
        >
          {t('Pickup')}
        </li>
      </ul>
    );
  };

  renderDeliveryTo = () => {
    const { t, addressName, storeInfoForCleverTap } = this.props;

    return (
      <div className="padding-normal">
        <span className="location-date__label margin-top-bottom-small text-size-big text-weight-bolder">
          {t('DeliverTo')}
        </span>
        <div
          className="form__group flex flex-middle flex-space-between"
          onClick={() => {
            CleverTap.pushEvent('Shipping Details - click deliver to', storeInfoForCleverTap);
            this.gotoLocationSearch();
          }}
          role="button"
          tabIndex="0"
          data-test-id="ordering.location-and-date.deliver-to"
        >
          {!addressName && <IconSearch className="icon icon__big icon__default flex__shrink-fixed" />}
          <p
            className={`location-date__input form__input flex flex-middle text-size-big text-line-height-base text-omit__single-line ${
              addressName ? 'padding-normal' : ''
            }`}
          >
            {addressName || t('WhereToDeliverFood')}
          </p>
          {addressName && <IconNext className="icon icon__normal icon__primary flex__shrink-fixed" />}
        </div>
      </div>
    );
  };

  renderSelectedStore = () => {
    const { t, store, storeInfoForCleverTap } = this.props;
    const storeName = store && store.name;

    return (
      <div
        className="padding-normal"
        onClick={() => {
          CleverTap.pushEvent('Shipping Details - click selected store', storeInfoForCleverTap);
          this.handleGotoStoreListClick();
        }}
        role="button"
        tabIndex="0"
        data-test-id="ordering.location-and-date.selected-store"
      >
        <span className="location-date__label margin-top-bottom-small text-size-big text-weight-bolder">
          {t('SelectedStore')}
        </span>
        <div className="form__group flex flex-middle flex-space-between">
          <p className="location-date__input padding-normal text-size-big text-line-height-base text-omit__single-line">
            {storeName}
          </p>
          <IconNext className="icon icon__normal icon__primary flex__shrink-fixed" />
        </div>
      </div>
    );
  };

  handleSelectDeliveryDate = orderDate => {
    const { actions } = this.props;

    actions.selectedDayChanged(orderDate.date);
  };

  renderDeliveryDateItem = orderDate => {
    const { t, selectedOrderDate, businessUTCOffset, storeInfoForCleverTap, currentDate } = this.props;

    const currentDateDayjs = storeUtils.getBusinessDateTime(businessUTCOffset, currentDate);
    const dateDayjs = storeUtils.getBusinessDateTime(businessUTCOffset, orderDate.date);

    const isSelected = selectedOrderDate ? dateDayjs.isSame(selectedOrderDate.date) : false;
    const { isToday } = orderDate;
    const isTomorrow = dateDayjs.isSame(currentDateDayjs.add(1, 'day'), 'day');
    const { isOpen } = orderDate;
    const dayOfWeek = dateDayjs.day();
    const dateOfMonth = dateDayjs.date();

    return (
      <li key={dateDayjs.format()}>
        <button
          className={`location-date__button-date button
          ${isSelected ? 'button__fill' : 'button__outline'}
          padding-top-bottom-smaller padding-left-right-normal margin-left-right-small
          ${isToday || isTomorrow ? 'text-uppercase' : ''}`}
          disabled={!isOpen}
          data-testid="preOrderDate"
          data-test-id="ordering.location-and-date.date-item"
          onClick={() => {
            CleverTap.pushEvent('Shipping Details - click shipping date', storeInfoForCleverTap);
            this.handleSelectDeliveryDate(orderDate);
          }}
        >
          {isToday ? (
            t('Today')
          ) : isTomorrow ? (
            t('Tomorrow')
          ) : (
            <>
              <span className="location-date__date-weekday text-weight-bolder">
                {t(WEEK_DAYS_I18N_KEYS[dayOfWeek])}
              </span>
              <time className="text-size-big">{dateOfMonth}</time>
            </>
          )}
        </button>
      </li>
    );
  };

  renderDeliveryDateSelector = () => {
    const { t, orderDateList } = this.props;

    return (
      <div className="padding-small">
        <span className="location-date__label padding-left-right-small margin-top-bottom-small text-size-big text-weight-bolder">
          {this.isDelivery && <span key="deliver-on">{t('DeliverOn')}</span>}
          {this.isPickup && <span key="pickup-on">{t('PickUpOn')}</span>}
        </span>
        <ul className="location-date__date flex flex-middle flex-space-between">
          {orderDateList.map(orderDate => this.renderDeliveryDateItem(orderDate))}
        </ul>
      </div>
    );
  };

  handleSelectDeliveryHourTime = timeItem => {
    const { actions } = this.props;

    if (timeItem && timeItem.soldOut) {
      return;
    }

    actions.selectedFromTimeChanged(timeItem ? timeItem.from : null);
  };

  renderDeliveryHourTimeItemLabel = timeItem => {
    const { t } = this.props;
    const isImmediate = timeItem.from === TIME_SLOT_NOW;

    if (isImmediate) {
      return t('Immediate');
    }

    const timeFrom = timeLib.formatTo12hour(timeItem.from);

    if (this.isPickup) {
      return `${timeFrom}`;
    }

    const timeTo = timeLib.formatTo12hour(timeItem.to);

    return `${timeFrom} - ${timeTo}`;
  };

  renderDeliveryHourTimeItem = timeItem => {
    const { t, selectedTime, storeInfoForCleverTap } = this.props;
    const isSelected = selectedTime && selectedTime.from === timeItem.from;
    const isSoldOut = timeItem.soldOut;

    return (
      <li key={timeItem.from} className="location-date__hour-item">
        <button
          className={`location-date__button-hour button button__block text-center text-size-big
              ${isSelected ? 'selected text-weight-bolder' : ''}
            `}
          data-testid="preOrderHour"
          data-test-id="ordering.location-and-date.time-item"
          onClick={() => {
            CleverTap.pushEvent('Shipping Details - click shipping time', storeInfoForCleverTap);
            this.handleSelectDeliveryHourTime(timeItem);
          }}
        >
          {this.renderDeliveryHourTimeItemLabel(timeItem)}

          {isSoldOut && <span className="text-uppercase"> {`(${t('SoldOut')})`}</span>}
        </button>
      </li>
    );
  };

  renderDeliveryHourTimeSelector = () => {
    const { t, availableTimeSlotList } = this.props;

    return (
      <div className="padding-top-bottom-normal">
        <span className="location-date__label padding-left-right-normal margin-top-bottom-small text-size-big text-weight-bolder">
          {this.isDelivery ? t('DeliveryTime') : t('PickupTime')}
        </span>
        <ul className="location-date__hour">
          {availableTimeSlotList.map(timeItem => this.renderDeliveryHourTimeItem(timeItem))}
        </ul>
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

  renderPickAt = () => {
    const { t, store } = this.props;

    const pickUpAddress = store ? Utils.getValidAddress(store, ADDRESS_RANGE.COUNTRY) : '';

    return (
      <div className="padding-normal">
        <span className="location-date__label margin-top-bottom-small text-size-big text-weight-bolder">
          {t('PickupAt')}
        </span>
        <p className="text-line-height-base">{pickUpAddress}</p>
      </div>
    );
  };

  renderDeliveryContainer = () => {
    const { addressName } = this.props;
    return (
      <>
        {this.renderDeliveryTo()}

        {!addressName ? (
          this.renderDeliveryHelpText()
        ) : (
          <>
            {this.renderSelectedStore()}
            {this.renderDeliveryDateSelector()}
            {this.renderDeliveryHourTimeSelector()}
          </>
        )}
      </>
    );
  };

  renderPickupContainer = () => (
    <>
      {this.renderSelectedStore()}
      {this.renderPickAt()}
      {this.renderDeliveryDateSelector()}
      {this.renderDeliveryHourTimeSelector()}
    </>
  );

  render() {
    const { businessDeliveryTypes, showLoading } = this.props;

    return (
      <section className="location-date flex flex-column" data-test-id="ordering.location-and-date.container">
        <HybridHeader
          headerRef={ref => {
            this.headerEl = ref;
          }}
          className="flex-middle"
          contentClassName="flex-middle"
          data-test-id="ordering.location-and-date.header"
          isPage
          title={this.getLocationDisplayTitle()}
          navFunc={() => {
            CleverTap.pushEvent('Shipping Details - click back arrow');
            this.handleBackClicked();
          }}
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
          {showLoading ? (
            <PageLoader />
          ) : (
            <>
              {businessDeliveryTypes.length > 1 && this.renderDeliveryTypesSelector()}

              {this.isDelivery && this.renderDeliveryContainer()}
              {this.isPickup && this.renderPickupContainer()}
            </>
          )}
        </div>
        {this.renderContinueButton()}
      </section>
    );
  }
}

LocationAndDate.displayName = 'LocationAndDate';

LocationAndDate.propTypes = {
  /* eslint-disable react/forbid-prop-types */
  store: PropTypes.object,
  location: PropTypes.object,
  currentDate: PropTypes.object,
  selectedDay: PropTypes.object,
  selectedTime: PropTypes.object,
  orderDateList: PropTypes.array,
  savedAddressInfo: PropTypes.object,
  businessUTCOffset: PropTypes.number,
  cachedAddressInfo: PropTypes.object,
  selectedOrderDate: PropTypes.object,
  availableTimeSlotList: PropTypes.array,
  businessDeliveryTypes: PropTypes.array,
  storeInfoForCleverTap: PropTypes.object,
  /* eslint-enable */
  showLoading: PropTypes.bool,
  addressName: PropTypes.string,
  deliveryType: PropTypes.string,
  savedStoreId: PropTypes.string,
  cachedStoreId: PropTypes.string,
  storeHashCode: PropTypes.string,
  selectedFromTime: PropTypes.string,
  originalDeliveryType: PropTypes.string,
  setAddressInfo: PropTypes.func,
  actions: PropTypes.shape({
    reset: PropTypes.func,
    initial: PropTypes.func,
    selectedDayChanged: PropTypes.func,
    deliveryTypeChanged: PropTypes.func,
    selectedFromTimeChanged: PropTypes.func,
  }),
  appActions: PropTypes.shape({
    getStoreHashData: PropTypes.func,
  }),
};

LocationAndDate.defaultProps = {
  store: null,
  location: null,
  currentDate: null,
  savedStoreId: null,
  cachedStoreId: null,
  selectedDay: null,
  selectedTime: null,
  storeHashCode: null,
  savedAddressInfo: null,
  cachedAddressInfo: null,
  selectedOrderDate: null,
  businessUTCOffset: 480,
  originalDeliveryType: null,
  storeInfoForCleverTap: null,
  setAddressInfo: () => {},
  actions: {
    reset: () => {},
    initial: () => {},
    selectedDayChanged: () => {},
    deliveryTypeChanged: () => {},
    selectedFromTimeChanged: () => {},
  },
  appActions: {
    getStoreHashData: () => {},
  },
  showLoading: false,
  addressName: '',
  deliveryType: '',
  selectedFromTime: '',
  orderDateList: [],
  businessDeliveryTypes: [],
  availableTimeSlotList: [],
};

export default compose(
  withAddressInfo(),
  withTranslation(),
  connect(
    state => ({
      deliveryType: getDeliveryType(state),
      savedStoreId: getSavedStoreId(state),
      cachedStoreId: getCachedStoreId(state),
      store: getStore(state),
      businessDeliveryTypes: getBusinessDeliveryTypes(state),
      orderDateList: getOrderDateList(state),
      businessUTCOffset: getBusinessUTCOffset(state),
      availableTimeSlotList: getAvailableTimeSlotList(state),
      selectedOrderDate: getSelectedOrderDate(state),
      selectedTime: getSelectedTime(state),
      storeHashCode: getStoreHashCode(state),
      selectedDay: getSelectedDay(state),
      selectedFromTime: getSelectedFromTime(state),
      showLoading: isShowLoading(state),
      storeInfoForCleverTap: getStoreInfoForCleverTap(state),
      originalDeliveryType: getOriginalDeliveryType(state),
      addressName: getAddressName(state),
      cachedAddressInfo: getCachedAddressInfo(state),
      savedAddressInfo: getSavedAddressInfo(state),
      currentDate: getCurrentDate(state),
    }),

    dispatch => ({
      setAddressInfo: bindActionCreators(setAddressInfoThunk, dispatch),
      actions: bindActionCreators(locationAndDateActionCreator, dispatch),
      appActions: bindActionCreators(appActionCreators, dispatch),
    })
  )
)(LocationAndDate);
