import React from 'react';
import LocationPicker, {
  setHistoricalDeliveryAddresses,
  tryGetDeviceCoordinates,
} from '../../../../components/LocationPicker';

export default class Location extends React.Component {
  state = {
    origin: null,
    status: 'fetch_location',
  };

  componentDidMount = async () => {
    try {
      const position = await tryGetDeviceCoordinates();
      this.setState({
        origin: {
          lng: position.coords.longitude,
          lat: position.coords.latitude,
        },
      });
      console.log('[Location] position =', position);
    } catch (e) {
      console.warn('[Location] fetch_location_failed');
      this.setState({
        status: 'fetch_location_failed',
      });
      throw e;
    }
  };

  handleMapSelected = async placeInfo => {
    console.log('[LocationWrapper] placeInfo of onSelect(__) =>', placeInfo);
    await setHistoricalDeliveryAddresses(placeInfo);

    const { history, location } = this.props;
    const pathname = (location.state && location.state.from && location.state.from.pathname) || '/home';

    history.push({
      pathname,
      state: {
        from: location,
        data: { placeInfo },
      },
    });
  };

  render() {
    if (this.state.status !== 'fetch_location_failed' && !this.state.origin) {
      return 'loading..';
    }

    return <LocationPicker mode="ORIGIN_DEVICE" origin={this.state.origin} onSelect={this.handleMapSelected} />;
  }
}
