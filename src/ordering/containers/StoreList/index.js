import React, { Component } from 'react';
import { withTranslation } from 'react-i18next';
import Constants from '../../../utils/constants';

import { connect } from 'react-redux';
import { bindActionCreators, compose } from 'redux';
import Header from '../../../components/Header';
import img from '../../../images/beep-logo.svg';
import checked from '../../../images/select.svg';

import './storeList.scss';
import { actions as homeActionCreators, getStoresList, getStoreHashCode } from '../../redux/modules/home';
import { actions as appActionCreators, getOnlineStoreInfo } from '../../redux/modules/app';
import Utils from '../../../utils/utils';
import { IconLocation, IconMotorcycle } from '../../../components/Icons';
import config from '../../../config';
import qs from 'qs';
import CurrencyNumber from '../../components/CurrencyNumber';

const { ADDRESS_RANGE } = Constants;
const StoreListItem = props => (
  <div
    className="stores-list-item"
    onClick={() => props.select(props.store)}
    data-heap-name="ordering.location-and-date.store-item"
  >
    <p>{props.store.name}</p>
    <p>{Utils.getValidAddress(props.store, ADDRESS_RANGE.COUNTRY)}</p>
    {props.isDeliveryType && (
      <p>
        <IconLocation className="header__motor-icon text-middle" />
        <span className="stores-list-item-distance">{props.store.distance}km</span>
        <IconMotorcycle className="header__motor-icon text-middle" />
        <CurrencyNumber className="font-weight-bolder" money={props.store.deliveryFee} />
        {/* <span className="stores-list-item-fee">{props.store.deliveryFee}</span> */}
      </p>
    )}
    <p>
      {props.t('openingHours')}: {props.openingHouers}
    </p>
    <p>{props.storeId === props.store.id && <img src={checked} alt="" />}</p>
  </div>
);
class StoreList extends Component {
  constructor(props) {
    super(props);
    this.state = {
      storeid: config.storeId,
      search: qs.parse(this.props.history.location.search, { ignoreQueryPrefix: true }),
    };
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
    await this.props.homeActions.loadCoreStores(address);
    // await this.props.appActions.fetchOnlineStoreInfo();
  }

  selectStore = store => {
    this.setState(
      {
        storeid: store.id,
      },
      async () => {
        if (this.state.search.callbackUrl) {
          this.props.history.replace({
            pathname: Constants.ROUTER_PATHS.ORDERING_LOCATION_AND_DATE,
            search: `${this.props.history.location.search}&${store.id ? 'storeid=' + store.id : ''}`,
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
        ? '0' + (+validTimeFrom.split(':')[0] - 12)
        : +validTimeFrom.split(':')[0] - 12 + ':' + validTimeFrom.split(':')[1] + ' PM'
    }`;
    let openingHouersStringTo = `${
      validTimeTo.split(':')[0] < '12'
        ? validTimeTo + ' AM'
        : +validTimeTo.split(':')[0] - 12 < 10
        ? '0' + (+validTimeTo.split(':')[0] - 12)
        : +validTimeTo.split(':')[0] - 12 + ':' + validTimeTo.split(':')[1] + ' PM'
    }`;

    return `${openingHouersStringFrom} - ${openingHouersStringTo}`;
  };

  isShowStore = store => {
    const { qrOrderingSettings } = store;
    if (!qrOrderingSettings) return true;
    const { disableOnDemandOrder, disableTodayPreOrder, enablePreOrder } = qrOrderingSettings;
    if (disableOnDemandOrder && disableTodayPreOrder && !enablePreOrder) {
      return false;
    }
    return true;
  };
  render() {
    let stores = [];
    stores = this.props.allStore.filter(
      item =>
        item.fulfillmentOptions.map(citem => citem.toLowerCase()).indexOf(this.state.search.type.toLowerCase()) !== -1
    );
    // stores = stores.filter(item => this.isShowStore(item));
    return (
      (this.props.onlineStoreInfo && (
        <div className="stores-list-contain" data-heap-name="ordering.store-list.container">
          <Header
            className="has-right flex-middle"
            isPage={true}
            title={'Select store'}
            data-heap-name="ordering.store-list.header"
            navFunc={() => {
              this.props.history.go(-1);
            }}
          />
          <div className="stores-info">
            <img src={this.props.onlineStoreInfo.logo} alt="" />
            <div className="stores-info-detail">
              <p>{this.props.onlineStoreInfo.storeName}</p>
              <p>{this.props.onlineStoreInfo.businessType}</p>
              <p>
                {this.state.search.type === Constants.DELIVERY_METHOD.DELIVERY
                  ? `${stores.length} outlets near you`
                  : `Total ${stores.length} outlets`}
              </p>
            </div>
          </div>
          <div className="stores-list">
            {stores.map(item => (
              <StoreListItem
                store={item}
                openingHouers={this.getOpeningHouers(item)}
                storeId={this.state.storeid}
                select={this.selectStore}
                key={item.id}
                t={this.props.t}
                isDeliveryType={this.state.search.type === Constants.DELIVERY_METHOD.DELIVERY}
              />
            ))}
          </div>
        </div>
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
