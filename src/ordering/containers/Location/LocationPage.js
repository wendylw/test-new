import React, { Component } from 'react';
import { withTranslation } from 'react-i18next';
import Header from '../../../components/Header';
import LocationPicker from '../../../components/LocationPicker';
import { post } from '../../../utils/request';
import config from '../../../config';
import ErrorImage from '../../../images/delivery-error.png';
import ErrorToast from '../../../components/ErrorToast';
import '../../../App.scss';
import Utils from '../../../utils/utils';

class LocationPage extends Component {
  state = {
    initializing: true,
    initError: null,
    storeInfo: {},
    errorToast: '',
  };

  componentDidMount() {
    this.loadStoreInfo();
  }

  async loadStoreInfo() {
    const { t } = this.props;
    this.setState({ initializing: true });
    try {
      const { business, storeId } = config;
      if (!business || !storeId) {
        throw new Error('business id or store id is missing.');
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
      this.setState({
        initError: t('FailToLoadStoreInfo'),
      });
    } finally {
      this.setState({ initializing: false });
    }
  }

  onSelectPlace = placeInfo => {
    const { t, history } = this.props;
    const {
      storeInfo: { radius },
    } = this.state;
    const distance = placeInfo.straightDistance;
    if (distance === Infinity) {
      this.setState({
        errorToast: t(`OutOfDeliveryRangeWrongDistance`, {
          distance: (radius / 1000).toFixed(1),
        }),
      });
      return;
    } else if (distance > radius) {
      this.setState({
        errorToast: t(`OutOfDeliveryRange`, { distance: (radius / 1000).toFixed(1) }),
      });
      return;
    }
    Utils.setSessionVariable('deliveryAddress', JSON.stringify({ ...placeInfo }));
    const callbackUrl = Utils.getQueryString('callbackUrl');
    if (typeof callbackUrl === 'string') {
      history.push(callbackUrl);
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
      <div className="location-page__error-screen">
        <img className="location-page__error-screen-image" alt="Something went wrong" src={ErrorImage} />
        <div className="location-page__error-screen-message">{initError}</div>
      </div>
    );
  }

  renderLoadingMask() {
    // a transparent mask to prevent user's input
    return (
      <div className="location-page__loading-mask">
        <div className="loader theme page-loader" />
      </div>
    );
  }

  render() {
    const { t } = this.props;
    const { initError, initializing, storeInfo, errorToast } = this.state;
    return (
      <section className="table-ordering__location location-page" data-heap-name="ordering.location.container">
        <Header
          className="flex-middle"
          data-heap-name="ordering.location.header"
          isPage={true}
          title={t('DeliverTo')}
          navFunc={this.handleBackClicked}
        />
        {initError ? (
          this.renderInitError()
        ) : (
          <LocationPicker
            mode="ORIGIN_STORE"
            origin={storeInfo.coords}
            radius={storeInfo.radius}
            country={storeInfo.country}
            onSelect={this.onSelectPlace}
          />
        )}
        {initializing && this.renderLoadingMask()}
        {errorToast && <ErrorToast message={errorToast} clearError={this.clearErrorToast} />}
      </section>
    );
  }
}

export default withTranslation(['OrderingDelivery'])(LocationPage);
