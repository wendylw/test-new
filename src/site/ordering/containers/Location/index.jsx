import React from 'react';
import PropTypes from 'prop-types';
import { bindActionCreators, compose } from 'redux';
import { withTranslation } from 'react-i18next';
import { connect } from 'react-redux';
import prefetch from '../../../../common/utils/prefetch-assets';
import { tryGetDeviceCoordinates } from '../../../../components/LocationPicker';
import { IconLeftArrow } from '../../../../components/Icons';
import { getAddressList } from '../../../redux/modules/addressList/selectors';
import { getUserIsLogin } from '../../../redux/modules/app';
import { loadAddressList as loadAddressListThunk } from '../../../redux/modules/addressList/thunks';
import { setAddressInfo as setAddressInfoThunk } from '../../../../redux/modules/address/thunks';
import { defaultLocations, getDefaultCoords } from './utils';
import AddressSelector from '../../../../containers/AddressSelector';
import CleverTap from '../../../../utils/clevertap';
import logger from '../../../../utils/monitoring/logger';
import './index.scss';

class Location extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      origin: null,
      status: 'fetch_location',
    };
  }

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
        logger.warn('Site_Location_FetchLocationFailed');
        this.setState({
          status: 'fetch_location_failed',
          origin: defaultCoords,
        });
      }
    }

    if (hasUserLoggedIn) {
      await loadAddressList();
    }

    prefetch(['SITE_HM'], ['SiteHome']);
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
        data-test-id="site.location.container"
      >
        <header className="header flex flex-space-between flex-middle sticky-wrapper">
          <div>
            <IconLeftArrow
              className="icon icon__big icon__default text-middle"
              data-test-id="site.location.back-btn"
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

Location.propTypes = {
  /* eslint-disable react/forbid-prop-types */
  addressList: PropTypes.array,
  location: PropTypes.shape({
    state: PropTypes.object,
  }),
  /* eslint-enable */
  hasUserLoggedIn: PropTypes.bool,
  setAddressInfo: PropTypes.func,
  loadAddressList: PropTypes.func,
};

Location.defaultProps = {
  location: {
    state: null,
  },
  addressList: [],
  hasUserLoggedIn: false,
  setAddressInfo: () => {},
  loadAddressList: () => {},
};

export default compose(
  withTranslation(['OrderingDelivery']),
  connect(
    state => ({
      addressList: getAddressList(state),
      hasUserLoggedIn: getUserIsLogin(state),
    }),
    dispatch => ({
      setAddressInfo: bindActionCreators(setAddressInfoThunk, dispatch),
      loadAddressList: bindActionCreators(loadAddressListThunk, dispatch),
    })
  )
)(Location);
