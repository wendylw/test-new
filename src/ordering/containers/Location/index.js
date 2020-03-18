import React, { Component } from 'react';
import { withTranslation } from 'react-i18next';
import Header from '../../../components/Header';
import _ from 'lodash';
import { IconPin, IconAdjust } from '../../../components/Icons';
import DeliveryErrorImage from '../../../images/delivery-error.png';
import Constant from '../../../utils/constants';
import {
  getCurrentAddressInfo,
  getStoreInfo,
  getStorePosition,
  getPlacesByText,
  getPlaceDetails,
  standardizeGeoAddress,
  fetchDevicePosition,
} from './utils';

class Location extends Component {
  state = {
    address: '', // user address
    placeId: '', // placeId of the address user selected,
    place: null,
    hasError: false,
    places: [],
    isFetching: false,
  };

  position = null; // user position
  devicePosition = null;
  store = null;
  storePosition = null;

  initializeAddress = async () => {
    const currentAddress = JSON.parse(sessionStorage.getItem('currentAddress'));
    const devicePosition = fetchDevicePosition();
    if (currentAddress && devicePosition) {
      console.log('use address info from sessionStorage');
      this.position = currentAddress.coords;
      this.devicePosition = devicePosition;
      return this.setState({
        address: currentAddress.address,
      });
    }
    await this.tryGeolocation();
  };

  fetchPlacesByText = async (needDefault = false) => {
    this.setState({ isFetching: true });
    // todo: later need to use store position after we have exact position
    const places = await getPlacesByText(this.state.address);
    console.log('fetchPlacesByText: places =', places);

    if (needDefault && places[0]) {
      this.selectPlace(places[0]);
    }

    this.setState({
      places,
      isFetching: false,
    });
  };

  debounceFetchPlaces = _.debounce(this.fetchPlacesByText, 700);

  componentDidMount = async () => {
    try {
      // will show prompt of permission once entry the page
      await this.initializeAddress();
      this.store = await getStoreInfo();
      this.storePosition = await getStorePosition(this.store);
      console.log('this.storePosition', this.storePosition);
      this.fetchPlacesByText(true);
    } catch (e) {
      console.error(e);
      this.setState({
        isFetching: false,
      });
    }
  };

  handleBackLicked = async () => {
    const { history } = this.props;

    try {
      history.goBack();
    } catch (e) {
      console.error(e);
    }
  };

  tryGeolocation = async () => {
    console.warn('tryGeolocation entry');

    try {
      // getCurrentAddress with fire a permission prompt
      const currentAddress = await getCurrentAddressInfo();
      const { address, coords } = currentAddress;
      this.position = coords;
      console.log('coords', coords);

      // Save into localstorage
      sessionStorage.setItem('currentAddress', JSON.stringify(currentAddress));

      this.setState({
        address,
        hasError: false,
      });
    } catch (e) {
      console.error(e);
      this.setState({ hasError: true, isFetching: false });
    }
  };

  selectPlace = place => {
    if (!place) return null;

    this.setState({
      address: place.description,
      placeId: place.place_id,
      place: place,
    });
  };

  render() {
    const { t, history } = this.props;
    const { hasError } = this.state;

    return (
      <section className="table-ordering__location">
        <Header className="has-right" isPage={true} title={t('DeliverTo')} navFunc={this.handleBackLicked} />
        <div className="location-page__info">
          <div className="location-page__form">
            <div className="input-group outline flex flex-middle flex-space-between border-radius-base">
              <i className="location-page__icon-pin" onClick={this.tryGeolocation}>
                <IconPin />
              </i>
              <input
                className="input input__block"
                type="text"
                placeholder={'Type in address'}
                onChange={event => {
                  console.log('typed:', event.currentTarget.value);
                  this.setState(
                    {
                      address: event.currentTarget.value,
                    },
                    this.debounceFetchPlaces
                  );
                }}
              />
            </div>
          </div>
          {this.state.place ? (
            <address
              className="location-page__address item border__bottom-divider"
              onClick={async () => {
                const placeDetails = await getPlaceDetails(this.state.place.place_id);
                console.log('user placeDetails =', placeDetails);
                const addressInfo = standardizeGeoAddress(placeDetails.address_components);
                const currentAddress = {
                  addressInfo,
                  address: this.state.place.description, // save place description as user address
                  coords: {
                    latitude: placeDetails.geometry.location.lat(),
                    longitude: placeDetails.geometry.location.lng(),
                  },
                };
                sessionStorage.setItem('currentAddress', JSON.stringify(currentAddress));
                console.log('user currentAddress =', currentAddress);

                // todo: should use modal to hide this address picker
                history.push({
                  pathname: Constant.ROUTER_PATHS.ORDERING_HOME,
                  search: window.location.search,
                });
              }}
            >
              <div className="item__detail-content">
                <summary className="item__title font-weight-bold">
                  {this.state.place.structured_formatting.main_text}
                </summary>
                <p className="gray-font-opacity">{this.state.place.structured_formatting.secondary_text}</p>
              </div>
            </address>
          ) : (
            <address className="location-page__address item border__bottom-divider">No available address</address>
          )}
        </div>
        <div className="location-page__list-wrapper">
          {this.state.isFetching ? <div className="loader theme"></div> : null}
          <ul className="location-page__list">
            {this.state.places.length
              ? this.state.places.map(place => (
                  <li
                    className="location-page__item flex flex-middle"
                    key={place.id}
                    onClick={e => {
                      e.preventDefault();
                      this.selectPlace(place);
                    }}
                  >
                    <i className="location-page__icon-adjust">
                      <IconAdjust />
                    </i>
                    <div className="item border__bottom-divider">
                      <summary>{place.structured_formatting.main_text}</summary>
                      <p className="gray-font-opacity">
                        {place.distance_meters ? `${place.distance_meters / 1000}km . ` : null}
                        {place.structured_formatting.secondary_text}
                      </p>
                    </div>
                  </li>
                ))
              : null}
          </ul>
          {false && hasError ? (
            <div className="text-center">
              <img src={DeliveryErrorImage} alt="" />
              <p className="gray-font-opacity">{t('DeliverToErrorMessage')}</p>
            </div>
          ) : null}
        </div>
      </section>
    );
  }
}

Location.propTypes = {};

Location.defaultProps = {};

export default withTranslation()(Location);
