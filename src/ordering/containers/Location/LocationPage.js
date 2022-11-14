import React, { Component } from 'react';
import { withTranslation } from 'react-i18next';
import _get from 'lodash/get';
import prefetch from '../../../common/utils/prefetch-assets';
import HybridHeader from '../../../components/HybridHeader';
import { post } from '../../../utils/request';
import config from '../../../config';
import ErrorImage from '../../../images/delivery-error.png';
import ErrorToast from '../../../components/ErrorToast';
import AddressSelector from '../../../containers/AddressSelector';
import Utils from '../../../utils/utils';
import { bindActionCreators, compose } from 'redux';
import { actions as appActionCreators, getBusiness, getUserIsLogin, getStoreId } from '../../redux/modules/app';
import { getAllBusinesses } from '../../../redux/modules/entities/businesses';
import { getAddressList } from '../../redux/modules/addressList/selectors';
import { loadAddressList } from '../../redux/modules/addressList/thunks';
import { setAddressInfo } from '../../../redux/modules/address/thunks';
import { connect } from 'react-redux';
import CleverTap from '../../../utils/clevertap';

import './OrderingLocation.scss';
import logger from '../../../utils/monitoring/logger';

class LocationPage extends Component {
  state = {
    initializing: true,
    initError: null,
    storeInfo: {},
    errorToast: '',
    outRange: Utils.getSessionVariable('outRange'),
  };

  async componentDidMount() {
    prefetch(['ORD_LAD']);

    const { storeId } = this.props;

    this.loadStoreInfo();
    if (!storeId) {
      await this.props.appActions.loadCoreBusiness();
      const { qrOrderingSettings, country } = this.props.allBusinesses[this.props.business] || {};
      const { deliveryRadius } = qrOrderingSettings || {};

      this.setState({
        storeInfo: {
          radius: deliveryRadius * 1000,
          country,
        },
      });
    }

    if (this.state.outRange) {
      this.setState(
        {
          errorToast: this.props.t(`OutOfDeliveryRange`, { distance: this.state.outRange }),
        },
        () => {
          Utils.removeSessionVariable('outRange');
        }
      );
    }

    const { hasUserLoggedIn, loadAddressList } = this.props;

    if (hasUserLoggedIn) {
      await loadAddressList();
    }
  }

  async componentDidUpdate(prevProps) {
    const { hasUserLoggedIn: prevHasUserLoggedIn } = prevProps;
    const { hasUserLoggedIn: currHasUserLoggedIn, loadAddressList } = this.props;

    if (!prevHasUserLoggedIn && currHasUserLoggedIn) {
      await loadAddressList();
    }
  }

  async loadStoreInfo() {
    const { storeId } = this.props;

    this.setState({ initializing: true });
    try {
      const { business } = config;
      if (!business || !storeId) {
        return;
      }
      const response = await post('/api/gql/CoreBusiness', { business, storeId });
      const { qrOrderingSettings, country } = response.data.business;
      const {
        stores: [store],
      } = response.data.business;
      const storeInfo = {
        radius: qrOrderingSettings.deliveryRadius * 1000,
        country,
        coords: { lat: store.location.latitude, lng: store.location.longitude },
      };
      if (
        typeof storeInfo.radius !== 'number' ||
        typeof storeInfo.coords.lat !== 'number' ||
        typeof storeInfo.coords.lng !== 'number'
      ) {
        throw new Error('Delivery radius or store coordinates is not correct.');
      }
      this.setState({ storeInfo });
    } catch (e) {
      console.error('fail to load storeInfo', e);
      // this.setState({
      //   initError: t('FailToLoadStoreInfo'),
      // });
    } finally {
      this.setState({ initializing: false });
    }
  }

  onSelectPlace = async addressInfo => {
    const { t, history, location, setAddressInfo } = this.props;
    const { updateAddressEnabled = true, callbackPayload } = location.state || {};
    const address = {
      location: {
        longitude: _get(addressInfo, 'coords.lng', 0),
        latitude: _get(addressInfo, 'coords.lat', 0),
      },
    };

    if (updateAddressEnabled) {
      await setAddressInfo(addressInfo);
    }

    try {
      let stores = await this.props.appActions.loadCoreStores(address);
      stores = stores.responseGql.data.business.stores;
      if (!stores.length) {
        const { deliveryRadius } = this.props.allBusinesses[this.props.business].qrOrderingSettings;

        this.setState({
          errorToast: t(`OutOfDeliveryRange`, { distance: deliveryRadius.toFixed(1) }),
        });
        return;
      }
    } catch (e) {
      logger.error('Ordering_LocationPage_LoadCoreStoresFailed', e);

      throw e;
    }

    const callbackUrl = Utils.getQueryString('callbackUrl');
    if (typeof callbackUrl === 'string') {
      history.replace(callbackUrl, { selectedAddress: addressInfo, ...callbackPayload });
    } else {
      history.go(-1);
    }
  };

  handleBackClicked = () => {
    CleverTap.pushEvent('Location Page - Click back');
    const { history } = this.props;
    history.go(-1);
  };

  clearErrorToast = () => {
    this.setState({ errorToast: null });
  };

  renderInitError() {
    const { initError } = this.state;
    return (
      <div className="padding-top-bottom-normal text-center">
        <img
          className="ordering-location__error-screen-image margin-top-bottom-small"
          alt="Something went wrong"
          src={ErrorImage}
        />
        <p className="ordering-location__error-screen-message padding-normal">{initError}</p>
      </div>
    );
  }

  renderLoadingMask() {
    // a transparent mask to prevent user's input
    return (
      <div className="fixed-wrapper">
        <div className="loader theme full-page" />
      </div>
    );
  }

  render() {
    const { t, location, addressList, hasUserLoggedIn } = this.props;
    const { initError, initializing, storeInfo, errorToast } = this.state;
    const { addressPickerAllowed = true } = location.state || {};
    const addressPickerEnabled = hasUserLoggedIn && addressPickerAllowed;

    return (
      <section className="ordering-location flex flex-column" data-heap-name="ordering.location.container">
        <HybridHeader
          headerRef={ref => (this.headerEl = ref)}
          className="flex-middle"
          contentClassName="flex-middle"
          data-heap-name="ordering.location.header"
          isPage={true}
          title={t('DeliverTo')}
          navFunc={this.handleBackClicked}
        />
        {initError ? (
          this.renderInitError()
        ) : (
          <section
            style={{
              top: `${Utils.mainTop({
                headerEls: [this.headerEl],
              })}px`,
              height: `${Utils.windowSize().height -
                Utils.mainTop({
                  headerEls: [this.deliveryEntryEl, this.headerEl, this.deliveryFeeEl],
                })}px`,
            }}
            className="flex flex-column"
          >
            <AddressSelector
              placeInfo={storeInfo}
              addressPickerEnabled={addressPickerEnabled}
              addressList={addressList}
              onSelect={this.onSelectPlace}
            />
          </section>
        )}
        {initializing && this.renderLoadingMask()}
        {errorToast && <ErrorToast className="fixed" message={errorToast} clearError={this.clearErrorToast} />}
      </section>
    );
  }
}
LocationPage.displayName = 'LocationPage';

export default compose(
  withTranslation(['OrderingDelivery']),
  connect(
    state => ({
      hasUserLoggedIn: getUserIsLogin(state),
      business: getBusiness(state),
      allBusinesses: getAllBusinesses(state),
      addressList: getAddressList(state),
      storeId: getStoreId(state),
    }),
    dispatch => ({
      setAddressInfo: bindActionCreators(setAddressInfo, dispatch),
      appActions: bindActionCreators(appActionCreators, dispatch),
      loadAddressList: bindActionCreators(loadAddressList, dispatch),
    })
  )
)(LocationPage);
