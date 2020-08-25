import React, { Component } from 'react';
import { withTranslation } from 'react-i18next';
import Constants from '../../../utils/constants';

import { connect } from 'react-redux';
import { bindActionCreators, compose } from 'redux';
import Header from '../../../components/Header';
import Image from '../../../components/Image';
import { IconChecked } from '../../../components/Icons';

import { actions as homeActionCreators, getStoresList, getStoreHashCode } from '../../redux/modules/home';
import { actions as appActionCreators, getOnlineStoreInfo } from '../../redux/modules/app';
import Utils from '../../../utils/utils';
import { IconLocation } from '../../../components/Icons';
import Tag from '../../../components/Tag';
import config from '../../../config';
import qs from 'qs';
import './OrderingStores.scss';

const { ADDRESS_RANGE } = Constants;
const StoreListItem = props => (
  <li
    className={`flex flex-middle flex-space-between padding-top-bottom-normal margin-left-right-normal border__bottom-divider ${
      props.isClose ? 'ordering-stores__item-disabled' : ''
    }`}
    onClick={() => props.select(props.store)}
    data-heap-name="ordering.store-list.store-item"
  >
    <summary className="ordering-stores__summary padding-left-right-small">
      <div className="flex flex-middle">
        <h3 className="ordering-stores__title margin-top-bottom-small text-size-big text-weight-bolder text-omit__single-line">
          {props.store.name}
        </h3>
        {props.isClose ? (
          <Tag
            text={props.t('Closed')}
            className="tag__small tag__error margin-left-right-small text-middle text-size-small"
          />
        ) : null}
      </div>
      <p className="margin-top-bottom-small text-size-small text-opacity">
        {Utils.getValidAddress(props.store, ADDRESS_RANGE.COUNTRY)}
      </p>
      {props.isDeliveryType && (
        <ul className="store-info">
          <li className="store-info__item text-middle">
            <IconLocation className="icon icon__smaller text-middle" />
            <span className="store-info__text text-size-smaller text-middle">
              {props.t('DistanceText', { distance: props.store.distance })}
            </span>
          </li>
        </ul>
      )}
      <p className="margin-top-bottom-small text-size-small">
        {props.t('openingHours')}: {props.openingHouers}
      </p>
    </summary>

    {props.storeId === props.store.id && (
      <IconChecked className="icon icon__primary flex__shrink-fixed margin-left-right-smaller" />
    )}
  </li>
);

class StoreList extends Component {
  constructor(props) {
    super(props);
    this.state = {
      storeid: config.storeId,
      search: qs.parse(this.props.history.location.search, { ignoreQueryPrefix: true }),
      storeList: [],
    };
    this.state.storeid = this.state.search.storeid || config.storeId;
  }

  async componentDidMount() {
    let address = Utils.getSessionVariable('deliveryAddress');
    if (address) {
      address = JSON.parse(address);
      address = {
        location: {
          longitude: address.coords.lng,
          latitude: address.coords.lat,
        },
      };
    }
    await this.props.homeActions.loadCoreStores(
      this.state.search.type === Constants.DELIVERY_METHOD.DELIVERY ? address : ''
    );

    this.getStoreList();
    // await this.props.appActions.fetchOnlineStoreInfo();
  }

  getStoreList = () => {
    let stores = [];
    const { allStore } = this.props;
    stores = allStore.filter(
      item =>
        item.fulfillmentOptions.map(citem => citem.toLowerCase()).indexOf(this.state.search.type.toLowerCase()) !== -1
    );

    stores.forEach(store => {
      store.isClose = this.checkStoreIsClose(store);
    });

    this.setState({
      storeList: stores,
    });
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

  selectStore = store => {
    if (store.isClose) return;

    this.setState(
      {
        storeid: store.id,
      },
      async () => {
        if (this.state.search.callbackUrl) {
          let search = this.props.history.location.search;
          search = search.replace(/&?storeid=[^&]*/, '');
          this.props.history.replace({
            pathname: Constants.ROUTER_PATHS.ORDERING_LOCATION_AND_DATE,
            search: `${search}&${store.id ? 'storeid=' + store.id : ''}`,
          });
        } else {
          await this.props.homeActions.getStoreHashData(store.id);
          window.location.href = `${window.location.origin}${Constants.ROUTER_PATHS.ORDERING_BASE}${
            Constants.ROUTER_PATHS.ORDERING_HOME
          }?h=${this.props.storeHash}&type=${this.state.search.type || Constants.DELIVERY_METHOD.DELIVERY}`;
          // this.props.history.replace({
          //   pathname: Constants.ROUTER_PATHS.ORDERING_HOME,
          //   search: `h=${this.props.storeHash}&type=${this.state.search.type || Constants.DELIVERY_METHOD.DELIVERY}`,
          // });
        }
      }
    );
  };

  getOpeningHouers = item => {
    const { qrOrderingSettings } = item;
    if (!qrOrderingSettings) return;
    const { validTimeFrom, validTimeTo } = qrOrderingSettings;

    let openingHouersStringFrom = `${
      validTimeFrom.split(':')[0] < '12'
        ? validTimeFrom + ' AM'
        : +validTimeFrom.split(':')[0] - 12 < 10
        ? '0' + (+validTimeFrom.split(':')[0] - 12) + ':' + validTimeFrom.split(':')[1] + ' PM'
        : +validTimeFrom.split(':')[0] - 12 + ':' + validTimeFrom.split(':')[1] + ' PM'
    }`;
    let openingHouersStringTo = `${
      validTimeTo.split(':')[0] < '12'
        ? validTimeTo + ' AM'
        : +validTimeTo.split(':')[0] - 12 < 10
        ? '0' + (+validTimeTo.split(':')[0] - 12) + ':' + validTimeTo.split(':')[1] + ' PM'
        : +validTimeTo.split(':')[0] - 12 + ':' + validTimeTo.split(':')[1] + ' PM'
    }`;
    if (validTimeFrom === '12:00') {
      openingHouersStringFrom = '12:00 PM';
    }
    if (validTimeTo === '12:00') {
      openingHouersStringTo = '12:00 PM';
    }
    if (validTimeFrom === '24:00') {
      openingHouersStringFrom = '00:00 AM';
    }
    if (validTimeTo === '24:00') {
      openingHouersStringTo = '00:00 AM';
    }
    return `${openingHouersStringFrom} - ${openingHouersStringTo}`;
  };

  render() {
    const { t, history, onlineStoreInfo } = this.props;
    const { storeList } = this.state;

    return (
      (onlineStoreInfo && (
        <section className="ordering-stores flex flex-column" data-heap-name="ordering.store-list.container">
          <Header
            className="flex-middle"
            contentClassName="flex-middle"
            isPage={true}
            data-heap-name="ordering.store-list.header"
            title={t('SelectStore')}
            navFunc={() => {
              history.go(-1);
            }}
          />

          <div className="ordering-stores__container">
            <div className="flex flex-top padding-top-bottom-normal padding-left-right-small margin-left-right-normal border__bottom-divider">
              <Image className="logo logo__big margin-left-right-small" src={onlineStoreInfo.logo} />
              <summary className="padding-left-right-small">
                <h2 className="margin-top-bottom-small text-size-big text-weight-bolder">
                  {onlineStoreInfo.storeName}
                </h2>
                <p className="margin-top-bottom-small text-size-smaller text-opacity">{onlineStoreInfo.businessType}</p>
                <p className="margin-top-bottom-small text-size-small">
                  {this.state.search.type === Constants.DELIVERY_METHOD.DELIVERY
                    ? `${storeList.length} outlets near you`
                    : `Total ${storeList.length} outlets`}
                </p>
              </summary>
            </div>
            <ul className="">
              {storeList.map(item => (
                <StoreListItem
                  store={item}
                  openingHouers={this.getOpeningHouers(item)}
                  storeId={this.state.storeid}
                  select={this.selectStore}
                  key={item.id}
                  t={this.props.t}
                  isDeliveryType={this.state.search.type === Constants.DELIVERY_METHOD.DELIVERY}
                  isClose={item.isClose}
                />
              ))}
            </ul>
          </div>
        </section>
      )) ||
      null
    );
  }
}

export default compose(
  withTranslation(),
  connect(
    state => ({
      allStore: getStoresList(state),
      onlineStoreInfo: getOnlineStoreInfo(state),
      storeHash: getStoreHashCode(state),
    }),
    dispatch => ({
      homeActions: bindActionCreators(homeActionCreators, dispatch),
      appActions: bindActionCreators(appActionCreators, dispatch),
    })
  )
)(StoreList);
