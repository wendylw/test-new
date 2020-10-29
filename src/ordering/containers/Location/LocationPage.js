import React, { Component } from 'react';
import { withTranslation } from 'react-i18next';
import Header from '../../../components/Header';
import LocationPicker from '../../../components/LocationPicker';
import { post } from '../../../utils/request';
import config from '../../../config';
import ErrorImage from '../../../images/delivery-error.png';
import ErrorToast from '../../../components/ErrorToast';
import Utils from '../../../utils/utils';
import { bindActionCreators, compose } from 'redux';
import { actions as homeActionCreators } from '../../redux/modules/home';
import { actions as appActionCreators, getBusiness } from '../../redux/modules/app';
import { getAllBusinesses } from '../../../redux/modules/entities/businesses';
import { connect } from 'react-redux';

import './OrderingLocation.scss';

class LocationPage extends Component {
  state = {
    initializing: true,
    initError: null,
    storeInfo: {},
    errorToast: '',
    outRange: Utils.getSessionVariable('outRange'),
  };

  async componentDidMount() {
    this.loadStoreInfo();
    if (!config.storeId) {
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
          Utils.removeSessionVariable('deliveryAddress');
          Utils.removeSessionVariable('outRange');
        }
      );
    }
  }

  async loadStoreInfo() {
    this.setState({ initializing: true });
    try {
      const { business, storeId } = config;
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

  onSelectPlace = async placeInfo => {
    const { t, history } = this.props;
    const address = {
      location: {
        longitude: placeInfo.coords.lng,
        latitude: placeInfo.coords.lat,
      },
    };

    let stores = await this.props.homeActions.loadCoreStores(address);
    stores = stores.responseGql.data.business.stores;
    if (!stores.length) {
      const { deliveryRadius } = this.props.allBusinesses[this.props.business].qrOrderingSettings;

      this.setState({
        errorToast: t(`OutOfDeliveryRange`, { distance: deliveryRadius.toFixed(1) }),
      });
      return;
    }
    // if (distance === Infinity) {
    //   this.setState({
    //     errorToast: t(`OutOfDeliveryRangeWrongDistance`, {
    //       distance: (radius / 1000).toFixed(1),
    //     }),
    //   });
    //   return;
    // } else if (distance > radius) {
    //   this.setState({
    //     errorToast: t(`OutOfDeliveryRange`, { distance: (radius / 1000).toFixed(1) }),
    //   });
    //   return;
    // }

    Utils.setSessionVariable('deliveryAddress', JSON.stringify({ ...placeInfo }));
    Utils.setSessionVariable('deliveryAddressUpdate', true);
    const callbackUrl = Utils.getQueryString('callbackUrl');
    if (typeof callbackUrl === 'string') {
      history.replace(callbackUrl);
    } else {
      history.go(-1);
    }
  };

  handleBackClicked = () => {
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
    const { t } = this.props;
    const { initError, initializing, storeInfo, errorToast } = this.state;
    const outRangeSearchText = JSON.parse(Utils.getSessionVariable('deliveryAddress') || '{}').address;
    return (
      <section className="ordering-location flex flex-column" data-heap-name="ordering.location.container">
        <Header
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
          <LocationPicker
            mode={'ORIGIN_STORE'}
            origin={storeInfo.coords}
            radius={storeInfo.radius}
            country={storeInfo.country}
            outRangeSearchText={this.state.outRange && outRangeSearchText}
            onSelect={this.onSelectPlace}
          />
        )}
        {initializing && this.renderLoadingMask()}
        {errorToast && <ErrorToast className="fixed" message={errorToast} clearError={this.clearErrorToast} />}
      </section>
    );
  }
}

export default compose(
  withTranslation(['OrderingDelivery']),
  connect(
    state => ({
      business: getBusiness(state),
      allBusinesses: getAllBusinesses(state),
    }),
    dispatch => ({
      homeActions: bindActionCreators(homeActionCreators, dispatch),
      appActions: bindActionCreators(appActionCreators, dispatch),
    })
  )
)(LocationPage);
