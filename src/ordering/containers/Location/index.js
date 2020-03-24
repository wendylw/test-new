import React, { Component } from 'react';
import { withTranslation } from 'react-i18next';
import Header from '../../../components/Header';
import { debounce } from 'lodash';
import { IconGpsFixed, IconSearch, IconClose, IconBookmark } from '../../../components/Icons';
import ErrorToast from '../../../components/ErrorToast';
import ErrorImage from '../../../images/delivery-error.png';

import {
  getCurrentAddressInfo,
  getStoreInfo,
  getStorePosition,
  getPlacesByText,
  getPlaceDetails,
  computeStraightDistance,
  getRouteDistanceMatrix,
  getHistoricalDeliveryAddresses,
} from './utils';

/**
 * type PositionInfo {
 *   address: string;
 *   coords: { lat: number; lng: number; }
 *   placeId?: string;
 *   displayComponents?: {
 *     mainText: string;
 *     secondaryText?: string;
 *   }
 *   addressComponents?: {
 *     street1: string;
 *     street2: string;
 *     city: string;
 *     state: string;
 *     country: string;
 *   }
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
    };
  }
  static async getDevicePositionInfo(withCache = false) {
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
        displayComponents: {
          mainText: positionInfo.address,
          secondaryText: positionInfo.address,
        },
      };
      sessionStorage.setItem(STORAGE_KEY, JSON.stringify({ ...ret }));
      return ret;
    } catch (e) {
      console.error(e);
      return null;
    }
  }
  static async getPlaceDetailsFromSearchResult(searchResult) {
    const placeDetail = await getPlaceDetails(searchResult.place_id, {
      fields: ['geometry'],
    });
    const { main_text, secondary_text } = searchResult.structured_formatting;
    placeDetail.address = `${main_text}, ${secondary_text}`;
    placeDetail.displayComponents = {
      mainText: main_text,
      secondaryText: secondary_text,
    };
    return placeDetail;
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
    historicalAddresses: [],
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
      this.setState({
        storeInfo,
        storePositionInfo,
        isInitializing: false,
        isDetectingPosition: false,
      });
      this.detectDevicePosition(true);
      this.getHistoricalAddresses();
    } catch (e) {
      console.error(e);
      this.setState({
        isInitializing: false,
        isDetectingPosition: false,
        initializeError: t('FailToLoadStoreInfo'),
      });
    }
  }

  detectDevicePosition = async (withCache = true) => {
    this.setState({ isDetectingPosition: true });
    const devicePositionInfo = await Location.getDevicePositionInfo(withCache);
    this.setState({
      devicePositionInfo,
      isDetectingPosition: false,
    });
  };

  async getHistoricalAddresses() {
    try {
      const historicalAddresses = await getHistoricalDeliveryAddresses(5);
      this.setState({ historicalAddresses });
    } catch (e) {
      console.error('Failed to get historical addresses');
    }
  }

  debounceSearchPlaces = debounce(async () => {
    const { searchText, storePositionInfo, storeInfo } = this.state;
    if (!searchText) {
      return;
    }
    this.setState({ isSearching: true });
    try {
      const places = await getPlacesByText(searchText, {
        position: storePositionInfo.coords,
        radius: storeInfo.qrOrderingSettings.deliveryRadius * 1000,
        country: storeInfo.countryCode,
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

  computeStraightDistanceFromStore(coords) {
    const { storePositionInfo } = this.state;
    if (storePositionInfo) {
      return computeStraightDistance(storePositionInfo.coords, coords);
    }
    return Infinity;
  }

  async computeRouteDistanceFromStore(coordsList) {
    const { storePositionInfo } = this.state;
    if (storePositionInfo) {
      const results = await getRouteDistanceMatrix([storePositionInfo.coords], coordsList);
      if (results[0]) {
        return results[0];
      }
      throw new Error('Fail to get distance info.');
    }
    return Infinity;
  }

  onSearchBoxChange = event => {
    const searchText = event.currentTarget.value;
    console.log('typed:', searchText);
    this.setState({ searchText }, () => {
      this.debounceSearchPlaces();
    });
  };

  async selectPlace(placeInfoOrSearchResult) {
    const { history, t } = this.props;
    try {
      let placeInfo;
      this.setState({ isSubmitting: true });
      if (!placeInfoOrSearchResult.coords) {
        // is searchResult
        placeInfo = await Location.getPlaceDetailsFromSearchResult(placeInfoOrSearchResult);
      } else {
        placeInfo = placeInfoOrSearchResult;
      }
      let distance;
      try {
        distance = (await this.computeRouteDistanceFromStore([placeInfo.coords]))[0];
        if (typeof distance !== 'number' || distance === Infinity) {
          throw new Error('Fail to get distance info.');
        }
      } catch (e) {
        this.setState({
          errorToast: t(`OutOfDeliveryRangeWrongDistance`, {
            distance: (this.deliveryDistanceMeter / 1000).toFixed(1),
          }),
        });
        return;
      }
      if (this.isTooFar(distance)) {
        this.setState({
          errorToast: t(`OutOfDeliveryRange`, { distance: (this.deliveryDistanceMeter / 1000).toFixed(1) }),
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
    } catch (e) {
      console.error(e);
      this.setState({ errorToast: t('FailToGetPlaceInfo') });
    } finally {
      this.setState({ isSubmitting: false });
    }
  }

  onSearchResultPress = async searchResult => {
    this.selectPlace(searchResult);
  };

  onDetectedLocationPress = () => {
    this.selectPlace(this.state.devicePositionInfo);
  };

  handleBackClicked = async () => {
    const { history } = this.props;
    history.go(-1);
  };

  clearSearchBox = () => {
    this.setState({ searchText: '' });
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
      <div className="location-page__search-box">
        <div className="input-group outline flex flex-middle flex-space-between border-radius-base">
          <i className="location-page__search-box-search-icon" onClick={this.tryGeolocation}>
            <IconSearch />
          </i>
          <input
            className="input input__block"
            type="text"
            placeholder={t('SearchYourAddress')}
            onChange={this.onSearchBoxChange}
            value={searchText}
          />
          <i
            className="location-page__search-box-clear-icon"
            onClick={this.clearSearchBox}
            style={{ visibility: searchText ? 'visible' : 'hidden' }}
          >
            <IconClose />
          </i>
        </div>
      </div>
    );
  }

  renderAddressItem(summary, detail, distance) {
    return (
      <div className="location-page__address-item">
        <div className="location-page__address-title">{summary}</div>
        <div className="location-page__address-detail">
          {/* will not display distance for now, because this distance is straight line distance and doesn't fit vendor's requirement */}
          {/* {typeof distance === 'number' && distance !== Infinity && (
            <span className="location-page__address-distance">{(distance / 1000).toFixed(1)} KM</span>
          )} */}
          <span>{detail}</span>
        </div>
      </div>
    );
  }

  renderDetectedPositionStatus(message) {
    return <div className="location-page__detected-position-status">{message}</div>;
  }

  renderDetectedPosition() {
    const { devicePositionInfo, isDetectingPosition, storePositionInfo } = this.state;
    const { t } = this.props;
    let mainText = devicePositionInfo
      ? devicePositionInfo.displayComponents
        ? devicePositionInfo.displayComponents.mainText
        : devicePositionInfo.address
      : '';
    let secondaryText = devicePositionInfo
      ? devicePositionInfo.displayComponents
        ? devicePositionInfo.displayComponents.secondaryText
        : devicePositionInfo.address
      : '';
    return (
      <div className="location-page__detected-position">
        <div
          className="location-page__detected-position-icon"
          onClick={() => {
            if (storePositionInfo) {
              this.detectDevicePosition(false);
            }
          }}
        >
          <IconGpsFixed style={{ width: '10px' }} />
        </div>
        <div className="location-page__detected-position-address">
          {isDetectingPosition ? (
            this.renderDetectedPositionStatus(t('DetectingLocation'))
          ) : devicePositionInfo ? (
            <div onClick={this.onDetectedLocationPress}>
              {this.renderAddressItem(
                mainText,
                secondaryText
                // this.computeDistanceFromStore(devicePositionInfo.coords)
              )}
            </div>
          ) : (
            this.renderDetectedPositionStatus(t('LocationSharingIsOff'))
          )}
        </div>
      </div>
    );
  }

  renderHistoricalAddressList() {
    // IMPORTANT: be careful to render historicalAddressList, because the data is cached in localStorage,
    // thing might be broken if you have change the data structure. So you must make sure the compat with old version.
    try {
      const { historicalAddresses } = this.state;
      return (
        <div>
          {historicalAddresses.map(positionInfo => {
            const { displayComponents } = positionInfo;
            const mainText = displayComponents ? displayComponents.mainText : positionInfo.address;
            const secondaryText = displayComponents ? displayComponents.secondaryText : positionInfo.address;
            // const distance = this.computeDistanceFromStore(coords);
            return (
              <div
                className="location-page__historical-address"
                onClick={() => this.selectPlace(positionInfo)}
                key={positionInfo.address}
              >
                <div className="location-page__historical-address-icon">
                  <IconBookmark />
                </div>
                <div className="location-page__historical-address-content">
                  {this.renderAddressItem(mainText, secondaryText)}
                </div>
              </div>
            );
          })}
        </div>
      );
    } catch (e) {
      console.error(e);
      return null;
    }
  }

  renderSearchResultList() {
    const { searchResultList } = this.state;

    return (
      <div className="location-page__list">
        {searchResultList.map(searchResult => {
          return (
            <div key={searchResult.place_id} onClick={() => this.onSearchResultPress(searchResult)}>
              {this.renderAddressItem(
                searchResult.structured_formatting.main_text,
                searchResult.structured_formatting.secondary_text
                // searchResult.distance_meters
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

  renderPredictedPositions() {
    return (
      <div>
        {this.renderDetectedPosition()}
        {this.renderHistoricalAddressList()}
      </div>
    );
  }

  renderMainContent() {
    const { searchText } = this.state;
    return (
      <div className="location-page__info">
        {this.renderSearchBox()}
        {!searchText ? this.renderPredictedPositions() : this.renderSearchResultList()}
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
