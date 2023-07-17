import React, { Component } from 'react';
import { withTranslation } from 'react-i18next';
import PropTypes from 'prop-types';
import {
  getHistoricalDeliveryAddresses,
  getPlaceInfoFromPlaceId,
  setHistoricalDeliveryAddresses,
} from '../utils/geoUtils';
import { IconBookmarks } from './Icons';
import ErrorToast from './ErrorToast';
import './LocationPicker.scss';
import logger from '../utils/monitoring/logger';

class LocationPicker extends Component {
  constructor(props) {
    super(props);
    this.state = {
      historicalAddresses: [],
      isSubmitting: false,
      errorToast: null,
    };
  }

  componentDidMount() {
    this.getHistoricalAddresses();
  }

  async getHistoricalAddresses() {
    try {
      const historicalAddresses = await getHistoricalDeliveryAddresses();
      this.setState({ historicalAddresses });
    } catch (error) {
      logger.error('Cashback_App_GetLoginStatusFailed', { message: error?.message || '' });
    }
  }

  async getPlaceDetailsFromSearchResult(searchResult) {
    const placeDetail = await getPlaceInfoFromPlaceId(searchResult.place_id, {
      fromAutocomplete: true,
    });
    const { main_text: mainText, secondary_text: secondaryText } = searchResult.structured_formatting;
    placeDetail.address = `${mainText}, ${secondaryText}`;
    placeDetail.displayComponents = {
      mainText,
      secondaryText,
    };
    return placeDetail;
  }

  clearErrorToast = () => {
    this.setState({ errorToast: null });
  };

  async selectSearchResultHandler(searchResult, index) {
    const { t, onSearchResultSelect } = this.props;
    try {
      this.setState({ isSubmitting: true });
      const placeInfo = await this.getPlaceDetailsFromSearchResult(searchResult);
      this.setState({ isSubmitting: false });
      await setHistoricalDeliveryAddresses(placeInfo);
      onSearchResultSelect(placeInfo, index);
    } catch (e) {
      this.setState({ errorToast: t('FailToGetPlaceInfo'), isSubmitting: false });
    }
  }

  renderAddressItem(summary, detail) {
    return (
      <summary
        className="location-picker__address-summary padding-top-bottom-small"
        data-testid="searchedAddressResult"
      >
        <div className="location-picker__address-title padding-top-bottom-small text-size-big text-weight-bolder text-omit__single-line">
          {summary}
        </div>
        <p className="location-picker__address-detail text-opacity">
          <span className="location-picker__address-detail-text text-omit__single-line">{detail}</span>
        </p>
      </summary>
    );
  }

  renderHistoricalAddressList() {
    // IMPORTANT: be careful to render historicalAddressList, because the data is cached in localStorage,
    // thing might be broken if you have change the data structure. So you must make sure the compat with old version.
    try {
      const { historicalAddresses } = this.state;
      const { onHistoricalResultSelect } = this.props;
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
                onClick={() => onHistoricalResultSelect(positionInfo)}
                role="button"
                tabIndex="0"
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
    } catch (error) {
      console.error('CommonComponent renderHistoricalAddressList:', error?.message || '');
      return null;
    }
  }

  renderSearchResultList() {
    const { searchResultList } = this.props;

    return (
      <div>
        {searchResultList.map((searchResult, index) => (
          <div
            className="location-picker__result-item"
            key={searchResult.place_id}
            onClick={() => this.selectSearchResultHandler(searchResult, index)}
            role="button"
            tabIndex="0"
            data-heap-name="common.location-picker.search-result-item"
          >
            {this.renderAddressItem(
              searchResult.structured_formatting.main_text,
              searchResult.structured_formatting.secondary_text,
              searchResult.distance_meters / 1000
            )}
          </div>
        ))}
      </div>
    );
  }

  renderMainContent() {
    const { searchResultList } = this.props;
    const shouldShowSearchResultList = !!searchResultList.length;
    return shouldShowSearchResultList ? this.renderSearchResultList() : this.renderHistoricalAddressList();
  }

  renderLoadingMask() {
    return <div className="loader theme full-page" />;
  }

  render() {
    const { isSubmitting, errorToast } = this.state;

    return (
      <div className="location-picker__container">
        {this.renderMainContent()}
        {errorToast && <ErrorToast className="fixed" message={errorToast} clearError={this.clearErrorToast} />}
        {isSubmitting && this.renderLoadingMask()}
      </div>
    );
  }
}
LocationPicker.displayName = 'LocationPicker';

LocationPicker.propTypes = {
  onSearchResultSelect: PropTypes.func,
  onHistoricalResultSelect: PropTypes.func,
  // eslint-disable-next-line react/forbid-prop-types
  searchResultList: PropTypes.array,
};
LocationPicker.defaultProps = {
  onSearchResultSelect: () => {},
  onHistoricalResultSelect: () => {},
  searchResultList: [],
};

export * from '../utils/geoUtils';

export default withTranslation(['OrderingDelivery'])(LocationPicker);
