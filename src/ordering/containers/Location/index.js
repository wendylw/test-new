import React, { Component } from 'react';
import { withTranslation } from 'react-i18next';
import Header from '../../../components/Header';
import { debounce } from 'lodash';
import { IconGpsFixed, IconSearch } from '../../../components/Icons';
import ErrorToast from '../../../components/ErrorToast';
import ErrorImage from '../../../images/delivery-error.png';
import './index.scss';

import {
  getCurrentAddressInfo,
  getStoreInfo,
  getStorePosition,
  getPlacesByText,
  getPlaceDetails,
  computeDistance,
} from './utils';

/**
 * type PositionInfo {
 *   address: string;
 *   coords: { lat: number; lng: number; }
 *   placeId?: string;
 *   addressComponents?: {
 *     street1: string;
 *     street2: string;
 *     city: string;
 *     state: string;
 *     country: string;
 *   }
 *   distance?: number;
 * }
 */

class Location extends Component {
  static async getStoreInfo() {
    return getStoreInfo();
  }
  static async getStorePositionInfo(storeInfo) {
    const storePosition = await getStorePosition(storeInfo);
    return {
      address: storePosition.address,
      coords: {
        lat: storePosition.coords.lat,
        lng: storePosition.coords.lng,
      },
      addressComponents: {
        street1: storeInfo.street1,
        street2: storeInfo.street2,
        city: storeInfo.city,
        state: storeInfo.state,
        country: storeInfo.country,
      },
      placeId: storePosition.placeId,
      distance: 0,
    };
  }
  static async getDevicePositionInfo({ storeCoords, withCache = false }) {
    const STORAGE_KEY = 'DEVICE_POSITION_INFO';
    try {
      if (withCache) {
        const cache = sessionStorage.getItem(STORAGE_KEY);
        if (cache) {
          return JSON.parse(cache);
        }
      }
      const positionInfo = await getCurrentAddressInfo();
      const ret = {
        address: positionInfo.address,
        coords: {
          lat: positionInfo.coords.latitude,
          lng: positionInfo.coords.longitude,
        },
        addressComponents: {
          ...positionInfo.addressInfo,
        },
        placeId: positionInfo.placeId,
      };
      // todo: consider the situation that storeCoords is missing
      const distance = computeDistance(storeCoords, ret.coords);
      ret.distance = distance;
      sessionStorage.setItem(STORAGE_KEY, JSON.stringify(ret));
      return ret;
    } catch (e) {
      console.error(e);
      return null;
    }
  }

  state = {
    searchText: '',
    searchResultList: [],
    storeInfo: null,
    isSearching: false,
    devicePositionInfo: null,
    isDetectingPosition: true,
    // NOTE: storePositionInfo is possibly not loaded from google, but our own api. Hence it may
    // miss placeId and the address info may be different from google map. Be careful.
    storePositionInfo: null,
    isInitializing: true,
    initializeError: '',
    isSubmitting: false,
    errorToast: null,
  };

  get deliveryDistanceMeter() {
    if (this.state.storeInfo && this.state.storeInfo.qrOrderingSettings) {
      return this.state.storeInfo.qrOrderingSettings.deliveryRadius * 1000;
    }
    return 0;
  }

  async componentDidMount() {
    const { t } = this.props;
    try {
      const storeInfo = await Location.getStoreInfo();
      const storePositionInfo = await Location.getStorePositionInfo(storeInfo);
      const devicePositionInfo = await Location.getDevicePositionInfo({
        storeCoords: storePositionInfo.coords,
        withCache: true,
      });
      this.setState({
        storeInfo,
        storePositionInfo,
        devicePositionInfo,
        isInitializing: false,
        isDetectingPosition: false,
      });
    } catch (e) {
      console.error(e);
      this.setState({
        isInitializing: false,
        isDetectingPosition: false,
        initializeError: t('FailToLoadStoreInfo'),
      });
    }
  }

  redetectDevicePosition = async () => {
    this.setState({ isDetectingPosition: true });
    const devicePositionInfo = await Location.getDevicePositionInfo({
      storeCoords: this.state.storePositionInfo.coords,
      withCache: false,
    });
    this.setState({
      devicePositionInfo,
      isDetectingPosition: false,
    });
  };

  debounceSearchPlaces = debounce(async () => {
    const { searchText, storePositionInfo, storeInfo } = this.state;
    this.setState({ isSearching: true });
    try {
      const places = await getPlacesByText(searchText, {
        position: storePositionInfo.coords,
        radius: storeInfo.qrOrderingSettings.deliveryRadius * 1000,
      });
      this.setState({
        searchResultList: places,
        isSearching: false,
      });
    } catch (e) {
      // do nothing for now, user can keep typing.
      console.error(e);
    }
  }, 700);

  onSearchBoxChange = event => {
    const searchText = event.currentTarget.value;
    console.log('typed:', searchText);
    this.setState({ searchText }, () => {
      this.debounceSearchPlaces();
    });
  };

  selectPlace(placeInfo) {
    const { history, t } = this.props;
    const { distance } = placeInfo;
    if (this.isTooFar(distance)) {
      this.setState({
        errorToast: t(`OutOfDeliveryRange`, (this.deliveryDistanceMeter / 1000).toFixed(1)),
      });
      return;
    }
    sessionStorage.setItem('deliveryAddress', JSON.stringify(placeInfo));
    const callbackUrl = sessionStorage.getItem('deliveryCallbackUrl');
    sessionStorage.removeItem('deliveryCallbackUrl');
    if (typeof callbackUrl === 'string') {
      history.push(callbackUrl);
    } else {
      history.go(-1);
    }
  }

  onSearchResultPress = async searchResult => {
    const { t } = this.props;
    this.setState({ isSubmitting: true });
    try {
      const placeDetail = await getPlaceDetails(searchResult.place_id, {
        targetCoords: this.state.storePositionInfo.coords,
      });
      this.selectPlace(placeDetail);
    } catch (e) {
      console.error(e);
      this.setState({ errorToast: t('FailToGetPlaceInfo') });
    } finally {
      this.setState({ isSubmitting: false });
    }
  };

  onDetectedLocationPress = () => {
    this.selectPlace(this.state.devicePositionInfo);
  };

  handleBackClicked = async () => {
    const { history } = this.props;
    history.go(-1);
  };

  clearErrorToast = () => {
    this.setState({ errorToast: null });
  };

  isTooFar = distance => {
    return distance > this.deliveryDistanceMeter;
  };

  renderSearchBox() {
    const { searchText } = this.state;
    const { t } = this.props;
    return (
      <div className="location-page__form">
        <div className="input-group outline flex flex-middle flex-space-between border-radius-base">
          <i className="location-page__icon-pin" onClick={this.tryGeolocation}>
            <IconSearch />
          </i>
          <input
            className="input input__block"
            type="text"
            placeholder={t('SearchYourAddress')}
            onChange={this.onSearchBoxChange}
            value={searchText}
          />
        </div>
      </div>
    );
  }

  renderAddressItem(summary, detail, distance) {
    return (
      <div className="location-page__address-item">
        <div className="location-page__address-title">{summary}</div>
        <div className="location-page__address-detail">
          {typeof distance === 'number' && (
            <span className="location-page__address-distance">{(distance / 1000).toFixed(1)} KM</span>
          )}
          {<span>{detail}</span>}
        </div>
      </div>
    );
  }

  renderDetectedPosition() {
    const { devicePositionInfo, isDetectingPosition } = this.state;
    const { t } = this.props;
    return (
      <div className="location-page__detected-position">
        <div className="location-page__detected-position-icon" onClick={this.redetectDevicePosition}>
          <IconGpsFixed style={{ width: '10px' }} />
        </div>
        <div className="location-page__detected-position-address">
          {isDetectingPosition ? (
            this.renderAddressItem(t('DetectingLocation'))
          ) : devicePositionInfo ? (
            <div onClick={this.onDetectedLocationPress}>
              {this.renderAddressItem(
                devicePositionInfo.address,
                devicePositionInfo.address,
                devicePositionInfo.distance
              )}
            </div>
          ) : (
            this.renderAddressItem(t('FailToDetectYourLocation'))
          )}
        </div>
      </div>
    );
  }

  renderSearchResultList() {
    const { searchResultList } = this.state;
    return (
      <div>
        {searchResultList.map(searchResult => {
          return (
            <div key={searchResult.place_id} onClick={() => this.onSearchResultPress(searchResult)}>
              {this.renderAddressItem(
                searchResult.structured_formatting.main_text,
                searchResult.structured_formatting.secondary_text,
                searchResult.distance_meters
              )}
            </div>
          );
        })}
      </div>
    );
  }

  renderInitializeError() {
    const { initializeError } = this.state;
    return (
      <div className="location-page__error-screen">
        <img className="location-page__error-screen-image" alt="Something went wrong" src={ErrorImage} />
        <div className="location-page__error-screen-message">{initializeError}</div>
      </div>
    );
  }

  renderMainContent() {
    return (
      <div className="location-page__info">
        {this.renderSearchBox()}
        {this.renderDetectedPosition()}
        {this.renderSearchResultList()}
      </div>
    );
  }

  renderLoadingMask() {
    return <div className="loader theme page-loader" />;
  }

  render() {
    const { t } = this.props;
    const { isInitializing, initializeError, isSubmitting, errorToast } = this.state;
    return (
      <section className="table-ordering__location">
        <Header className="has-right" isPage={true} title={t('DeliverTo')} navFunc={this.handleBackClicked} />
        {initializeError ? this.renderInitializeError() : this.renderMainContent()}
        {errorToast && <ErrorToast message={errorToast} clearError={this.clearErrorToast} />}
        {(isInitializing || isSubmitting) && this.renderLoadingMask()}
      </section>
    );
  }
}

Location.propTypes = {};

Location.defaultProps = {};

export default withTranslation(['OrderingDelivery'])(Location);
