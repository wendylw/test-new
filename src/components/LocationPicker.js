import React, { Component } from 'react';
import { withTranslation } from 'react-i18next';
import PropTypes from 'prop-types';
import { debounce } from 'lodash';
import {
  getDevicePositionInfo,
  getHistoricalDeliveryAddresses,
  getPlaceAutocompleteList,
  getPlaceInfoFromPlaceId,
} from '../utils/geoUtils';
import { IconGpsFixed, IconSearch, IconClose, IconBookmarks } from './Icons';
import ErrorToast from './ErrorToast';
import './LocationPicker.scss';
import { captureException } from '@sentry/react';

class LocationPicker extends Component {
  static propTypes = {
    origin: PropTypes.exact({ lat: PropTypes.number.isRequired, lng: PropTypes.number.isRequired }),
    radius: PropTypes.number,
    country: PropTypes.string,
    mode: PropTypes.oneOf(['ORIGIN_STORE', 'ORIGIN_DEVICE']),
    onSelect: PropTypes.func,
    // FB-1409: we don't get user's place from device position for now, because it's accurate and cost a lot. but
    // we won't totally remove it. instead, we just provide an option which is by default disabled.
    detectPosition: PropTypes.bool,
  };
  static defaultProps = {
    mode: 'ORIGIN_DEVICE',
    onSelect: () => {},
    detectPosition: false,
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
      isSubmitting: false,
      errorToast: null,
    };
  }

  componentDidMount() {
    const { detectPosition } = this.props;
    if (detectPosition) {
      this.detectDevicePosition();
    }
    this.getHistoricalAddresses();

    this.props.outRangeSearchText &&
      this.setState({
        searchText: this.props.outRangeSearchText,
      });
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
      console.error('Failed to get historical addresses', e);
    }
  }

  async getPlaceDetailsFromSearchResult(searchResult) {
    const placeDetail = await getPlaceInfoFromPlaceId(searchResult.place_id, {
      fields: ['geometry', 'address_components'],
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
    const { t, mode, onSelect } = this.props;
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
        // try {
        //   straightDistance = computeStraightDistance(origin, placeInfo.coords);
        // } catch (e) {
        //   console.error('Fail to compute straight distance', e);
        //   straightDistance = Infinity;
        // }
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
      captureException(e);
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
      let places = await getPlaceAutocompleteList(searchText, { location, origin, radius, country });

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
    this.setState({ searchText }, () => {
      this.debounceSearchPlaces();
    });
  };

  clearSearchBox = () => {
    this.setState({ searchText: '' }, () => {
      this.debounceSearchPlaces();
    });
  };

  clearErrorToast = () => {
    this.setState({ errorToast: null });
  };

  renderSearchBox() {
    const { searchText } = this.state;
    const { t } = this.props;
    return (
      <div className="location-picker__search-box sticky-wrapper padding-normal">
        <div className="form__group flex flex-middle flex-space-between margin-top-bottom-small">
          <IconSearch className="icon icon__big icon__default" onClick={this.tryGeolocation} />
          <input
            className="location-picker__input form__input text-size-big"
            data-testid="searchAddress"
            data-heap-name="common.location-picker.search-box"
            type="text"
            placeholder={t('SearchYourAddress')}
            onChange={this.onSearchBoxChange}
            value={searchText}
          />
          <IconClose
            className="icon icon__normal icon__default"
            onClick={this.clearSearchBox}
            data-heap-name="common.location-picker.search-box-clear-icon"
            style={{ visibility: searchText ? 'visible' : 'hidden' }}
          />
        </div>
      </div>
    );
  }

  isRenderDistance = distance => {
    return (
      typeof distance === 'number' && distance !== Infinity && !isNaN(distance) && this.props.mode === 'ORIGIN_STORE'
    );
  };

  renderAddressItem(summary, detail, distance) {
    return (
      <summary
        className="location-picker__address-summary padding-top-bottom-small"
        data-testid="searchedAddressResult"
      >
        <div className="location-picker__address-title padding-top-bottom-small text-size-big text-weight-bolder text-omit__single-line">
          {summary}
        </div>
        <p className="location-picker__address-detail text-opacity">
          {/* will not display distance for now, because this distance is straight line distance and doesn't fit vendor's requirement */}
          {/* {typeof distance === 'number' && distance !== Infinity && (
            <span className="location-picker__address-distance">{(distance / 1000).toFixed(1)} KM</span>
          )} */}
          {/* {this.isRenderDistance(distance) && (
             <span className="location-picker__address-distance">{distance.toFixed(1)} KM</span>
           )} */}
          <span className="location-picker__address-detail-text text-omit__single-line">{detail}</span>
        </p>
      </summary>
    );
  }

  renderDetectedPositionStatus(message) {
    return <p className="padding-top-bottom-normal text-size-big text-weight-bolder">{message}</p>;
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
      <div className="location-picker__detected-position flex flex-top border__bottom-divider">
        <button
          className="location-picker__button-detected-position button flex__shrink-fixed padding-left-right-small"
          onClick={() => {
            if (storePositionInfo) {
              this.detectDevicePosition(false);
            }
          }}
        >
          <IconGpsFixed className="icon icon__small icon__primary" />
        </button>
        <div className="location-picker__detected-position-address">
          {isDetectingPosition ? (
            this.renderDetectedPositionStatus(t('DetectingLocation'))
          ) : devicePositionInfo ? (
            <div
              onClick={() => this.selectPlace(devicePositionInfo)}
              data-heap-name="common.location-picker.detected-location-item"
            >
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
                className="location-picker__historical-address flex flex-top border__bottom-divider"
                onClick={() => this.selectPlace(positionInfo)}
                key={positionInfo.address}
              >
                <div className="margin-smaller">
                  <IconBookmarks className="icon icon__smaller icon__primary-light margin-small" />
                </div>
                <div
                  className="location-picker__historical-container"
                  data-heap-name="common.location-picker.historical-location-item"
                >
                  {this.renderAddressItem(mainText, secondaryText)}
                </div>
              </div>
            );
          })}
        </div>
      );
    } catch (e) {
      console.error(e);
      captureException(e);
      return null;
    }
  }

  renderSearchResultList() {
    const { searchResultList } = this.state;

    return (
      <div>
        {searchResultList.map(searchResult => {
          return (
            <div
              className="location-picker__result-item"
              key={searchResult.place_id}
              onClick={() => this.selectPlace(searchResult)}
              data-heap-name="common.location-picker.search-result-item"
            >
              {this.renderAddressItem(
                searchResult.structured_formatting.main_text,
                searchResult.structured_formatting.secondary_text,
                searchResult.distance_meters / 1000
              )}
            </div>
          );
        })}
      </div>
    );
  }

  renderPredictedPositions() {
    const { detectPosition } = this.props;

    return (
      <div>
        {detectPosition && this.renderDetectedPosition()}
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
    return <div className="loader theme full-page" />;
  }

  render() {
    const { isSubmitting, errorToast } = this.state;

    return (
      <div className="location-picker">
        {this.renderMainContent()}
        {errorToast && <ErrorToast message={errorToast} clearError={this.clearErrorToast} />}
        {isSubmitting && this.renderLoadingMask()}
      </div>
    );
  }
}

export * from '../utils/geoUtils';

export default withTranslation(['OrderingDelivery'])(LocationPicker);
