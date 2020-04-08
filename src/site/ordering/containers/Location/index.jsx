import React from 'react';
import LocationPicker, {
  setHistoricalDeliveryAddresses,
  tryGetDeviceCoordinates,
} from '../../../../components/LocationPicker';
import { withTranslation } from 'react-i18next';
import { IconLeftArrow } from '../../../../components/Icons';
import { defaultLocations, getDefaultCoords } from './utils';

class Location extends React.Component {
  state = {
    origin: null,
    status: 'fetch_location',
  };

  componentDidMount = async () => {
    const { state = {} } = this.props.location;
    const { coords } = state;

    if (coords && coords.lng && coords.lat) {
      this.setState({
        origin: coords,
      });
    } else {
      // this case is only happens when page is airdrop
      try {
        const position = await tryGetDeviceCoordinates();
        this.setState({
          origin: {
            lng: position.coords.longitude,
            lat: position.coords.latitude,
          },
        });
      } catch (e) {
        const defaultCoords = getDefaultCoords(defaultLocations.KualaLumpur);
        console.warn(
          '[Location] fetch_location_failed, to use default defaultCoords=%s city=%s',
          JSON.stringify(defaultCoords),
          defaultLocations.KualaLumpur
        );
        this.setState({
          status: 'fetch_location_failed',
          origin: defaultCoords,
        });
        throw e;
      }
    }
  };

  backToPreviousPage = data => {
    const { history, location } = this.props;
    const pathname = (location.state && location.state.from && location.state.from.pathname) || '/home';

    history.push({
      pathname,
      state: {
        from: location,
        data,
      },
    });
  };

  handleMapSelected = async placeInfo => {
    await setHistoricalDeliveryAddresses(placeInfo);
    this.backToPreviousPage({ placeInfo });
  };

  handleBackClicked = () => {
    this.backToPreviousPage();
  };

  render() {
    const { t } = this.props;

    if (this.state.status !== 'fetch_location_failed' && !this.state.origin) {
      return <div>loading..</div>;
    }

    return (
      <main className="fixed-wrapper">
        <header className="header flex flex-space-between flex-middle sticky-wrapper">
          <div>
            <IconLeftArrow className="icon icon__big icon__gray text-middle" onClick={this.handleBackClicked} />
            <h2 className="header__title text-middle text-size-big text-weight-bold text-uppercase text-omit__single-line">
              {t('DeliverTo')}
            </h2>
          </div>
        </header>
        {this.state.origin ? (
          <LocationPicker mode="ORIGIN_DEVICE" origin={this.state.origin} onSelect={this.handleMapSelected} />
        ) : null}
      </main>
    );
  }
}

export default withTranslation(['OrderingDelivery'])(Location);
