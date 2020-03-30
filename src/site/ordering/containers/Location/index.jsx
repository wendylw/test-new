import React from 'react';
import LocationPicker, {
  setHistoricalDeliveryAddresses,
  tryGetDeviceCoordinates,
} from '../../../../components/LocationPicker';
import Header from '../../../../components/Header';
import { withTranslation } from 'react-i18next';

class Location extends React.Component {
  state = {
    origin: null,
    status: 'fetch_location',
  };

  componentDidMount = async () => {
    const { state = {} } = this.props.location;
    const { coords } = state;

    console.log('[Location] location.state =', this.props.location.state);

    if (coords && coords.lng && coords.lat) {
      this.setState({
        origin: coords,
      });
    } else {
      // this case is only happens when page is airdrop
      try {
        console.warn('[Location] this page is airdrop');
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
    const { t } = this.props;

    if (this.state.status !== 'fetch_location_failed' && !this.state.origin) {
      return <div>loading..</div>;
    }

    return (
      <div>
        <Header
          className="has-right flex-middle"
          isPage={true}
          title={t('DeliverTo')}
          navFunc={() => {
            alert('nav back');
          }}
        />
        <LocationPicker mode="ORIGIN_DEVICE" origin={this.state.origin} onSelect={this.handleMapSelected} />
      </div>
    );
  }
}

export default withTranslation(['OrderingDelivery'])(Location);
