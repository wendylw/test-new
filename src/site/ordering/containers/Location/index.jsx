import React from 'react';
import { bindActionCreators, compose } from 'redux';
import { connect } from 'react-redux';
import { tryGetDeviceCoordinates } from '../../../../components/LocationPicker';
import { withTranslation } from 'react-i18next';
import { IconLeftArrow } from '../../../../components/Icons';
import { getAddressList } from '../../../redux/modules/addressList/selectors';
import { getUserIsLogin } from '../../../redux/modules/app';
import { loadAddressList } from '../../../redux/modules/addressList/thunks';
import { setAddressInfo } from '../../../../redux/modules/address/thunks';
import { defaultLocations, getDefaultCoords } from './utils';
import AddressSelector from '../../../../containers/AddressSelector';
import CleverTap from '../../../../utils/clevertap';
import loggly from '../../../../utils/monitoring/loggly';
import './index.scss';

class Location extends React.Component {
  state = {
    origin: null,
    status: 'fetch_location',
  };

  componentDidMount = async () => {
    const { location, hasUserLoggedIn, loadAddressList } = this.props;
    const { state = {} } = location;
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
            lng: position.longitude,
            lat: position.latitude,
          },
        });
      } catch (e) {
        const defaultCoords = getDefaultCoords(defaultLocations.KualaLumpur);
        console.warn(
          '[Location] fetch_location_failed, to use default defaultCoords=%s city=%s',
          JSON.stringify(defaultCoords),
          defaultLocations.KualaLumpur
        );
        loggly.warn('Location.componentDidMount', {
          message: '[Location] fetch_location_failed, use default location',
        });
        this.setState({
          status: 'fetch_location_failed',
          origin: defaultCoords,
        });
        throw e;
      }
    }

    if (hasUserLoggedIn) {
      await loadAddressList();
    }
  };

  componentDidUpdate = async prevProps => {
    const { hasUserLoggedIn: prevHasUserLoggedIn } = prevProps;
    const { hasUserLoggedIn: currHasUserLoggedIn, loadAddressList } = this.props;

    if (!prevHasUserLoggedIn && currHasUserLoggedIn) {
      await loadAddressList();
    }
  };

  backToPreviousPage = () => {
    const { history, location } = this.props;
    const pathname = (location.state && location.state.from && location.state.from.pathname) || '/home';

    history.push({
      pathname,
      state: { from: location },
    });
  };

  handleMapSelected = async addressInfo => {
    const { setAddressInfo } = this.props;
    await setAddressInfo(addressInfo);
    this.backToPreviousPage();
  };

  handleBackClicked = () => {
    CleverTap.pushEvent('Location Page - Click back');
    this.backToPreviousPage();
  };

  render() {
    const { t, addressList, hasUserLoggedIn } = this.props;
    const { status, origin } = this.state;

    if (status !== 'fetch_location_failed' && !origin) {
      return <div>loading..</div>;
    }

    return (
      <main
        className="fixed-wrapper fixed-wrapper__main flex flex-column site-location__wrapper"
        data-heap-name="site.location.container"
      >
        <header className="header flex flex-space-between flex-middle sticky-wrapper">
          <div>
            <IconLeftArrow
              className="icon icon__big icon__default text-middle"
              data-heap-name="site.location.back-btn"
              onClick={this.handleBackClicked}
            />
            <h2 className="header__title text-middle text-size-big text-weight-bolder text-omit__single-line">
              {t('DeliverTo')}
            </h2>
          </div>
        </header>
        {origin ? (
          <AddressSelector
            placeInfo={{ origin }}
            addressList={addressList}
            addressPickerEnabled={hasUserLoggedIn}
            onSelect={this.handleMapSelected}
          />
        ) : null}
      </main>
    );
  }
}
Location.displayName = 'Location';

export default compose(
  withTranslation(['OrderingDelivery']),
  connect(
    state => ({
      addressList: getAddressList(state),
      hasUserLoggedIn: getUserIsLogin(state),
    }),
    dispatch => ({
      setAddressInfo: bindActionCreators(setAddressInfo, dispatch),
      loadAddressList: bindActionCreators(loadAddressList, dispatch),
    })
  )
)(Location);
