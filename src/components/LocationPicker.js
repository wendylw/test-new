import React, { Component } from 'react';
import { withTranslation } from 'react-i18next';
import PropTypes from 'prop-types';
import { debounce } from 'lodash';
import {
  getDevicePositionInfo,
  getHistoricalDeliveryAddresses,
  getPlaceAutocompleteList,
  getPlaceDetailsFromPlaceId,
  computeStraightDistance,
} from '../utils/geoUtils';
import { IconGpsFixed, IconSearch, IconClose, IconBookmark } from './Icons';
import ErrorToast from './ErrorToast';
import './LocationPicker.scss';

class LocationPicker extends Component {
  static propTypes = {
    origin: PropTypes.exact({ lat: PropTypes.number.isRequired, lng: PropTypes.number.isRequired }),
    radius: PropTypes.number,
    country: PropTypes.string,
    mode: PropTypes.oneOf(['ORIGIN_STORE', 'ORIGIN_DEVICE']),
    onSelect: PropTypes.func,
  };
  static defaultProps = {
    mode: 'ORIGIN_DEVICE',
    onSelect: () => {},
  };

  constructor(props) {
    super(props);
    this.state = {
      searchText: '',
      searchResultList: [],
      isSearching: false,
      devicePositionInfo: null,
      isDetectingPosition: true,
      historicalAddresses: [],
      // isInitializing: true,
      // initializeError: '',
      isSubmitting: false,
      errorToast: null,
    };
  }

  componentDidMount() {
    this.detectDevicePosition();
    this.getHistoricalAddresses();
  }

  detectDevicePosition = async (withCache = true) => {
    this.setState({ isDetectingPosition: true });
    let devicePositionInfo = null;
    try {
      devicePositionInfo = await getDevicePositionInfo(withCache);
      devicePositionInfo.displayComponents = {
        mainText: devicePositionInfo.address,
        secondaryText: devicePositionInfo.address,
      };
    } catch (e) {
      console.error('Fail to detect device position', e);
    }
    this.setState({
      devicePositionInfo,
      isDetectingPosition: false,
    });
  };

  async getHistoricalAddresses() {
    try {
      const historicalAddresses = await getHistoricalDeliveryAddresses();
      this.setState({ historicalAddresses });
    } catch (e) {
      console.error('Failed to get historical addresses');
    }
  }

  async getPlaceDetailsFromSearchResult(searchResult) {
    const placeDetail = await getPlaceDetailsFromPlaceId(searchResult.place_id, {
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

  async selectPlace(placeInfoOrSearchResult) {
    const { t, mode, origin, onSelect } = this.props;
    try {
      let placeInfo;
      this.setState({ isSubmitting: true });
      if (!placeInfoOrSearchResult.coords) {
        // is searchResult
        placeInfo = await this.getPlaceDetailsFromSearchResult(placeInfoOrSearchResult);
      } else {
        placeInfo = placeInfoOrSearchResult;
      }
      this.setState({ isSubmitting: false });
      let straightDistance;
      let directionDistance;
      if (mode === 'ORIGIN_STORE') {
        try {
          straightDistance = computeStraightDistance(origin, placeInfo.coords);
        } catch (e) {
          console.error('Fail to compute straight distance', e);
          straightDistance = Infinity;
        }
        // We will temporarily not get direction distance until we are confident enough that the distance is accurate.
        // try {
        //   directionDistance = await computeDirectionDistance(origin, placeInfo.coords);
        // } catch (e) {
        //   console.error('Fail to compute straight distance', e);
        //   straightDistance = Infinity;
        // }
      }
      placeInfo.straightDistance = straightDistance;
      placeInfo.directionDistance = directionDistance;
      onSelect(placeInfo);
    } catch (e) {
      console.error(e);
      this.setState({ errorToast: t('FailToGetPlaceInfo'), isSubmitting: false });
    }
  }

  debounceSearchPlaces = debounce(async () => {
    const { searchText, devicePositionInfo } = this.state;
    const { mode } = this.props;
    let { origin, country, radius } = this.props;
    let location;
    if (!origin && devicePositionInfo && mode === 'ORIGIN_DEVICE') {
      origin = devicePositionInfo.coords;
    }
    if (!country && devicePositionInfo && devicePositionInfo.addressComponents && mode === 'ORIGIN_DEVICE') {
      country = devicePositionInfo.addressComponents.countryCode;
    }
    // location is used for biasing the result. it must be used along with radius
    if (mode === 'ORIGIN_DEVICE' && devicePositionInfo) {
      location = devicePositionInfo.coords;
    } else {
      location = origin;
    }
    if (!radius && mode === 'ORIGIN_DEVICE') {
      radius = 10000;
    }
    this.setState({ isSearching: true });
    try {
      const places = await getPlaceAutocompleteList(searchText, { location, origin, radius, country });
      this.setState({
        searchResultList: places,
      });
    } catch (e) {
      // do nothing for now, user can keep typing.
      console.error(e);
    } finally {
      this.setState({ isSearching: false });
    }
  }, 700);

  onSearchBoxChange = event => {
    const searchText = event.currentTarget.value;
    console.log('typed:', searchText);
    this.setState({ searchText }, () => {
      this.debounceSearchPlaces();
    });
  };

  clearSearchBox = () => {
    this.setState({ searchText: '' });
  };

  clearErrorToast = () => {
    this.setState({ errorToast: null });
  };

  renderSearchBox() {
    const { searchText } = this.state;
    const { t } = this.props;
    return (
      <div className="location-picker__search-box">
        <div className="form__group flex flex-middle">
          <IconSearch className="icon icon__normal icon__gray" onClick={this.tryGeolocation} />
          <input
            className="form__input"
            type="text"
            placeholder={t('SearchYourAddress')}
            onChange={this.onSearchBoxChange}
            value={searchText}
          />
          <IconClose
            className="form__search-icon icon icon__small icon__gray"
            onClick={this.clearSearchBox}
            style={{ visibility: searchText ? 'visible' : 'hidden' }}
          />
        </div>
      </div>
    );
  }

  renderAddressItem(summary, detail, distance) {
    return (
      <div className="location-picker__address-item">
        <div className="location-picker__address-title">{summary}</div>
        <div className="location-picker__address-detail">
          {/* will not display distance for now, because this distance is straight line distance and doesn't fit vendor's requirement */}
          {/* {typeof distance === 'number' && distance !== Infinity && (
            <span className="location-picker__address-distance">{(distance / 1000).toFixed(1)} KM</span>
          )} */}
          <span>{detail}</span>
        </div>
      </div>
    );
  }

  renderDetectedPositionStatus(message) {
    return <div className="location-picker__detected-position-status">{message}</div>;
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
      <div className="location-picker__detected-position">
        <div
          className="location-picker__detected-position-icon"
          onClick={() => {
            if (storePositionInfo) {
              this.detectDevicePosition(false);
            }
          }}
        >
          <IconGpsFixed style={{ width: '10px' }} />
        </div>
        <div className="location-picker__detected-position-address">
          {isDetectingPosition ? (
            this.renderDetectedPositionStatus(t('DetectingLocation'))
          ) : devicePositionInfo ? (
            <div onClick={() => this.selectPlace(devicePositionInfo)}>
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
                className="location-picker__historical-address"
                onClick={() => this.selectPlace(positionInfo)}
                key={positionInfo.address}
              >
                <div className="location-picker__historical-address-icon">
                  <IconBookmark />
                </div>
                <div className="location-picker__historical-address-content">
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
      <div className="location-picker__list">
        {searchResultList.map(searchResult => {
          return (
            <div key={searchResult.place_id} onClick={() => this.selectPlace(searchResult)}>
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
      <div className="location-picker__info">
        {this.renderSearchBox()}
        {!searchText ? this.renderPredictedPositions() : this.renderSearchResultList()}
      </div>
    );
  }

  renderLoadingMask() {
    return <div className="loader theme page-loader" />;
  }

  render() {
    const { isSubmitting, errorToast } = this.state;
    return (
      <div>
        {this.renderMainContent()}
        {errorToast && <ErrorToast message={errorToast} clearError={this.clearErrorToast} />}
        {isSubmitting && this.renderLoadingMask()}
      </div>
    );
  }
}

export * from '../utils/geoUtils';

export default withTranslation(['OrderingDelivery'])(LocationPicker);
