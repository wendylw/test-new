import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import React, { Component } from 'react';
import { withTranslation } from 'react-i18next';
import { bindActionCreators, compose } from 'redux';
import _get from 'lodash/get';
import prefetch from '../../../common/utils/prefetch-assets';
import HybridHeader from '../../../components/HybridHeader';
import { post } from '../../../utils/request';
import config from '../../../config';
import ErrorImage from '../../../images/delivery-error.png';
import ErrorToast from '../../../components/ErrorToast';
import AddressSelector from '../../../containers/AddressSelector';
import Utils from '../../../utils/utils';
import { actions as appActionCreators, getBusiness, getUserIsLogin, getStoreId } from '../../redux/modules/app';
import { getAllBusinesses } from '../../../redux/modules/entities/businesses';
import { getAddressList } from '../../redux/modules/addressList/selectors';
import { loadAddressList as loadAddressListThunk } from '../../redux/modules/addressList/thunks';
import { setAddressInfo as setAddressInfoThunk } from '../../../redux/modules/address/thunks';
import CleverTap from '../../../utils/clevertap';
import logger from '../../../utils/monitoring/logger';

import './OrderingLocation.scss';

class LocationPage extends Component {
  constructor(props) {
    super(props);
    this.state = {
      initializing: true,
      initError: null,
      storeInfo: {},
      errorToast: '',
      outRange: Utils.getSessionVariable('outRange'),
    };
  }

  async componentDidMount() {
    const { storeId, appActions, t } = this.props;

    this.loadStoreInfo();
    if (!storeId) {
      await appActions.loadCoreBusiness();
      const { business, allBusinesses } = this.props;
      const { qrOrderingSettings, country } = allBusinesses[business] || {};
      const { deliveryRadius } = qrOrderingSettings || {};

      this.setState({
        storeInfo: {
          radius: deliveryRadius * 1000,
          country,
        },
      });
    }

    const { outRange } = this.state;

    if (outRange) {
      this.setState(
        {
          errorToast: t(`OutOfDeliveryRange`, { distance: outRange }),
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

    prefetch(['ORD_LAD']);
  }

  async componentDidUpdate(prevProps) {
    const { hasUserLoggedIn: prevHasUserLoggedIn } = prevProps;
    const { hasUserLoggedIn: currHasUserLoggedIn, loadAddressList } = this.props;

    if (!prevHasUserLoggedIn && currHasUserLoggedIn) {
      await loadAddressList();
    }
  }

  onSelectPlace = async addressInfo => {
    const { t, history, location, setAddressInfo, appActions } = this.props;
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
      let stores = await appActions.loadCoreStores(address);
      stores = stores.responseGql.data.business.stores;

      const { business, allBusinesses } = this.props;

      if (!stores.length) {
        const { deliveryRadius } = allBusinesses[business].qrOrderingSettings;

        this.setState({
          errorToast: t(`OutOfDeliveryRange`, { distance: deliveryRadius.toFixed(1) }),
        });
        return;
      }
    } catch (e) {
      logger.error('Ordering_LocationPage_LoadCoreStoresFailed', { message: e?.message });

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
    } catch (error) {
      logger.error('Ordering Location loadStoreInfo:', { message: error?.message || '' });
    } finally {
      this.setState({ initializing: false });
    }
  }

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
      <section className="ordering-location flex flex-column" data-test-id="ordering.location.container">
        <HybridHeader
          headerRef={ref => {
            this.headerEl = ref;
          }}
          className="flex-middle"
          contentClassName="flex-middle"
          data-test-id="ordering.location.header"
          isPage
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

LocationPage.propTypes = {
  storeId: PropTypes.string,
  business: PropTypes.string,
  appActions: PropTypes.shape({
    loadCoreStores: PropTypes.func,
    loadCoreBusiness: PropTypes.func,
  }),
  /* eslint-disable react/forbid-prop-types */
  location: PropTypes.object,
  allBusinesses: PropTypes.object,
  addressList: PropTypes.arrayOf(PropTypes.object),
  /* eslint-disable */
  hasUserLoggedIn: PropTypes.bool,
  setAddressInfo: PropTypes.func,
  loadAddressList: PropTypes.func,
};

LocationPage.defaultProps = {
  storeId: null,
  business: null,
  location: null,
  addressList: [],
  allBusinesses: {},
  appActions: {
    loadCoreStores: () => {},
    loadCoreBusiness: () => {},
  },
  hasUserLoggedIn: false,
  setAddressInfo: () => {},
  loadAddressList: () => {},
};

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
      setAddressInfo: bindActionCreators(setAddressInfoThunk, dispatch),
      appActions: bindActionCreators(appActionCreators, dispatch),
      loadAddressList: bindActionCreators(loadAddressListThunk, dispatch),
    })
  )
)(LocationPage);
