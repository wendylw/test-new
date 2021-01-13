import React, { Component } from 'react';
import { withTranslation } from 'react-i18next';
import Constants from '../../../utils/constants';

import { connect } from 'react-redux';
import { bindActionCreators, compose } from 'redux';
import Header from '../../../components/Header';
import Image from '../../../components/Image';
import { IconChecked } from '../../../components/Icons';

import { actions as homeActionCreators, getStoresList, getStoreHashCode } from '../../redux/modules/home';
import { actions as appActionCreators, getOnlineStoreInfo, getBusinessUTCOffset } from '../../redux/modules/app';
import Utils from '../../../utils/utils';
import { IconLocation } from '../../../components/Icons';
import Tag from '../../../components/Tag';
import config from '../../../config';
import qs from 'qs';
import './OrderingStores.scss';
import { checkStoreIsOpened, getBusinessDateTime } from '../../../utils/order-utils';

const { ADDRESS_RANGE } = Constants;
const StoreListItem = props => (
  <li
    className={`flex flex-middle flex-space-between padding-top-bottom-normal margin-left-right-normal border__bottom-divider ${
      props.isClose ? 'ordering-stores__item-disabled' : ''
    }`}
    onClick={() => props.select(props.store)}
    data-heap-name="ordering.store-list.store-item"
  >
    <summary
      className={`${
        props.storeId === props.store.id ? 'ordering-stores__summary--selected' : 'ordering-stores__summary'
      } padding-left-right-small`}
    >
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
      {props.openingHours ? (
        <p className="margin-top-bottom-small text-size-small">
          {props.t('openingHours')}: {props.openingHours}
        </p>
      ) : null}
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
  }

  getStoreList = () => {
    let stores = [];
    const { allStore, businessUTCOffset } = this.props;
    stores = allStore.filter(
      item =>
        item.fulfillmentOptions.map(citem => citem.toLowerCase()).indexOf(this.state.search.type.toLowerCase()) !== -1
    );

    const currentTime = getBusinessDateTime(businessUTCOffset);

    stores.forEach(store => {
      store.isClose = !checkStoreIsOpened(currentTime, store);
    });

    this.setState({
      storeList: stores,
    });
  };

  selectStore = store => {
    if (store.isClose) return;

    this.setState(
      {
        storeid: store.id,
      },
      async () => {
        const { history, location } = this.props;
        const { state } = location || {};
        const { from } = state || {};
        let search = history.location.search;

        if (this.state.search.callbackUrl) {
          search = search.replace(/&?storeid=[^&]*/, '');

          this.props.history.replace({
            pathname: Constants.ROUTER_PATHS.ORDERING_LOCATION_AND_DATE,
            search: `${search}&${store.id ? 'storeid=' + store.id : ''}`,
            state: from ? { from } : null,
          });
        } else {
          await this.props.homeActions.getStoreHashData(store.id);
          window.location.href = `${window.location.origin}${Constants.ROUTER_PATHS.ORDERING_BASE}${
            Constants.ROUTER_PATHS.ORDERING_HOME
          }?h=${this.props.storeHash}&type=${this.state.search.type ||
            Constants.DELIVERY_METHOD.DELIVERY}&from=${from}`;
          // this.props.history.replace({
          //   pathname: Constants.ROUTER_PATHS.ORDERING_HOME,
          //   search: `h=${this.props.storeHash}&type=${this.state.search.type || Constants.DELIVERY_METHOD.DELIVERY}`,
          // });
        }
      }
    );
  };

  getOpeningHours = item => {
    // Hotfix_beep-Update-some-settins-for-merchants: country will remove, comment is just temp.
    const { country: merchantCountry, qrOrderingSettings } = item;

    if (!qrOrderingSettings) {
      return null;
    }

    // Hotfix_beep-Update-some-settins-for-merchants: validTimeTo will revert, comment is just temp.
    const { validTimeFrom, validTimeTo, breakTimeFrom, breakTimeTo } = qrOrderingSettings;
    const formatBreakTimes = [Utils.formatHour(breakTimeFrom), Utils.formatHour(breakTimeTo)];
    const formatValidTimes = [
      Utils.formatHour(validTimeFrom),
      Utils.formatHour(merchantCountry === 'Malay' && validTimeTo > '19:00' ? '19:00' : validTimeTo),
    ];

    return Utils.getOpeningHours({
      validTimeFrom,
      validTimeTo: merchantCountry === 'Malay' && validTimeTo > '19:00' ? '19:00' : validTimeTo,
      breakTimeFrom,
      breakTimeTo,
      formatBreakTimes,
      formatValidTimes,
    });
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
                  openingHours={this.getOpeningHours(item)}
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
      businessUTCOffset: getBusinessUTCOffset(state),
    }),
    dispatch => ({
      homeActions: bindActionCreators(homeActionCreators, dispatch),
      appActions: bindActionCreators(appActionCreators, dispatch),
    })
  )
)(StoreList);
