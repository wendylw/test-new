import qs from 'qs';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import React, { Component } from 'react';
import { bindActionCreators, compose } from 'redux';
import { withTranslation } from 'react-i18next';
import _get from 'lodash/get';
import Constants from '../../../utils/constants';
import prefetch from '../../../common/utils/prefetch-assets';
import HybridHeader from '../../../components/HybridHeader';
import Image from '../../../components/Image';
import { IconChecked, IconLocation } from '../../../components/Icons';
import { withAddressInfo } from '../Location/withAddressInfo';
import {
  actions as appActionCreators,
  getOnlineStoreInfo,
  getBusinessUTCOffset,
  getStoreId as getSavedStoreId,
  getStoresList,
  getStoreHashCode,
} from '../../redux/modules/app';
import { getIfAddressInfoExists, getAddressCoords } from '../../../redux/modules/address/selectors';
import Utils from '../../../utils/utils';
import Tag from '../../../components/Tag';
import { checkStoreIsOpened } from '../../../utils/store-utils';
import './OrderingStores.scss';

const { ADDRESS_RANGE } = Constants;

const StoreListItem = ({ t, isClose, store, storeId, select, isDeliveryType, openingHours }) => (
  <li
    className={`flex flex-middle flex-space-between padding-top-bottom-normal margin-left-right-normal border__bottom-divider ${
      isClose ? 'ordering-stores__item-disabled' : ''
    }`}
    onClick={() => select(store)}
    data-test-id="ordering.store-list.store-item"
  >
    <summary
      className={`${
        storeId === store.id ? 'ordering-stores__summary--selected' : 'ordering-stores__summary'
      } padding-left-right-small`}
    >
      <div className="flex flex-middle">
        <h3 className="ordering-stores__title margin-top-bottom-small text-size-big text-weight-bolder text-omit__single-line">
          {store.name}
        </h3>
        {isClose ? (
          <Tag
            text={t('Closed')}
            className="tag__small tag__error margin-left-right-small text-middle text-size-small"
          />
        ) : null}
      </div>
      <p className="margin-top-bottom-small text-size-small text-opacity">
        {Utils.getValidAddress(store, ADDRESS_RANGE.COUNTRY)}
      </p>
      {isDeliveryType && (
        <ul className="store-info">
          <li className="store-info__item text-middle">
            <IconLocation className="icon icon__smaller text-middle" />
            <span className="store-info__text text-size-smaller text-middle">
              {t('DistanceText', { distance: store.distance })}
            </span>
          </li>
        </ul>
      )}
      {openingHours ? (
        <p className="margin-top-bottom-small text-size-small">
          {t('openingHours')}: {openingHours}
        </p>
      ) : null}
    </summary>

    {storeId === store.id && (
      <IconChecked className="icon icon__primary flex__shrink-fixed margin-left-right-smaller" />
    )}
  </li>
);

StoreListItem.displayName = 'StoreListItem';

StoreListItem.propTypes = {
  isClose: PropTypes.bool,
  storeId: PropTypes.string,
  select: PropTypes.func,
  isDeliveryType: PropTypes.bool,
  store: PropTypes.shape({
    id: PropTypes.string,
    name: PropTypes.string,
    distance: PropTypes.number,
  }),
  // eslint-disable-next-line react/forbid-prop-types
  openingHours: PropTypes.array,
};

StoreListItem.defaultProps = {
  isClose: false,
  storeId: null,
  isDeliveryType: false,
  select: () => {},
  store: {
    id: '',
    name: '',
    distance: 0,
  },
  openingHours: [],
};

class StoreList extends Component {
  constructor(props) {
    super(props);

    const { savedStoreId, history } = this.props;
    const search = qs.parse(history.location.search, { ignoreQueryPrefix: true });

    this.state = {
      storeid: search.storeid || savedStoreId,
      search,
      storeList: [],
    };
  }

  async componentDidMount() {
    const { addressCoords, appActions } = this.props;
    const { search } = this.state;

    const address = addressCoords && {
      location: {
        longitude: _get(addressCoords, 'lng', 0),
        latitude: _get(addressCoords, 'lat', 0),
      },
    };

    await appActions.loadCoreStores(search.type === Constants.DELIVERY_METHOD.DELIVERY ? address : '');

    this.getStoreList();
    prefetch(['ORD_LAD'], ['OrderingDelivery']);
  }

  getStoreList = () => {
    let stores = [];
    const { search } = this.state;
    const { allStore, businessUTCOffset } = this.props;
    stores = allStore.filter(
      item => item.fulfillmentOptions.map(citem => citem.toLowerCase()).indexOf(search.type.toLowerCase()) !== -1
    );

    const currentTime = new Date();

    stores.forEach(store => {
      store.isClose = !checkStoreIsOpened(store, currentTime, businessUTCOffset);
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
        const { search } = this.state;
        const { callbackUrl } = search;
        const { history, location, appActions } = this.props;
        const { state } = location || {};
        const { from } = state || {};

        let historySearch = history.location.search;

        if (callbackUrl || from) {
          historySearch = historySearch.replace(/&?storeid=[^&]*/, '');

          history.replace({
            pathname: Constants.ROUTER_PATHS.ORDERING_LOCATION_AND_DATE,
            search: `${historySearch}&${store.id ? `storeid=${store.id}` : ''}`,
            state: from ? { from } : null,
          });
        } else {
          await appActions.getStoreHashData(store.id);

          const { storeHash } = this.props;

          window.location.href = `${window.location.origin}${Constants.ROUTER_PATHS.ORDERING_BASE}${
            Constants.ROUTER_PATHS.ORDERING_HOME
          }?h=${storeHash}&type=${search.type || Constants.DELIVERY_METHOD.DELIVERY}&from=${from}`;
        }
      }
    );
  };

  getOpeningHours = item => {
    const { qrOrderingSettings } = item;

    if (!qrOrderingSettings) {
      return null;
    }

    const { validTimeFrom, validTimeTo, breakTimeFrom, breakTimeTo } = qrOrderingSettings;

    return Utils.getOpeningHours({
      validTimeFrom,
      validTimeTo,
      breakTimeFrom,
      breakTimeTo,
    });
  };

  render() {
    const { t, history, onlineStoreInfo } = this.props;
    const { storeid, search, storeList } = this.state;

    return (
      (onlineStoreInfo && (
        <section className="ordering-stores flex flex-column" data-test-id="ordering.store-list.container">
          <HybridHeader
            className="flex-middle"
            contentClassName="flex-middle"
            isPage
            data-test-id="ordering.store-list.header"
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
                  {search.type === Constants.DELIVERY_METHOD.DELIVERY
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
                  storeId={storeid}
                  select={this.selectStore}
                  key={item.id}
                  t={t}
                  isDeliveryType={search.type === Constants.DELIVERY_METHOD.DELIVERY}
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

StoreList.displayName = 'StoreList';

StoreList.propTypes = {
  /* eslint-disable react/forbid-prop-types */
  location: PropTypes.object,
  allStore: PropTypes.arrayOf(PropTypes.object),
  /* eslint-enable */
  storeHash: PropTypes.string,
  savedStoreId: PropTypes.string,
  onlineStoreInfo: PropTypes.shape({
    logo: PropTypes.string,
    storeName: PropTypes.string,
    businessType: PropTypes.string,
  }),
  addressCoords: PropTypes.shape({
    lat: PropTypes.number,
    lng: PropTypes.number,
  }),
  appActions: PropTypes.shape({
    loadCoreStores: PropTypes.func,
    getStoreHashData: PropTypes.func,
  }),
  businessUTCOffset: PropTypes.number,
};

StoreList.defaultProps = {
  allStore: [],
  location: null,
  storeHash: null,
  savedStoreId: null,
  addressCoords: null,
  businessUTCOffset: 480,
  onlineStoreInfo: {
    logo: '',
    storeName: '',
    businessType: '',
  },
  appActions: {
    loadCoreStores: () => {},
    getStoreHashData: () => {},
  },
};

export default compose(
  withTranslation(),
  withAddressInfo(),
  connect(
    state => ({
      savedStoreId: getSavedStoreId(state),
      allStore: getStoresList(state),
      onlineStoreInfo: getOnlineStoreInfo(state),
      storeHash: getStoreHashCode(state),
      businessUTCOffset: getBusinessUTCOffset(state),
      addressCoords: getAddressCoords(state),
      ifAddressInfoExists: getIfAddressInfoExists(state),
    }),
    dispatch => ({
      appActions: bindActionCreators(appActionCreators, dispatch),
    })
  )
)(StoreList);
