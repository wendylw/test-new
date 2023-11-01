import React from 'react';
import PropTypes from 'prop-types';
import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';
import Constants from '../../../../utils/constants';
import { getPlaceInfo } from '../../../home/utils';
import { getIfAddressInfoExists } from '../../../../redux/modules/address/selectors';
import {
  getAddressInfo as getAddressInfoThunk,
  setAddressInfo as setAddressInfoThunk,
} from '../../../../redux/modules/address/thunks';

const { ROUTER_PATHS } = Constants;

// alwayUpdate means each time we enter the page, we will try to update currentPlaceInfo again, no matter
// whether currentPlaceInfo already exist. This is used in pages that has location bar.
export const withAddressInfo = (source = {}, alwaysUpdate = false) => InnerComponent => {
  class WithAddressInfo extends React.Component {
    constructor(props) {
      super(props);
      this.state = {
        addressInfoUpdated: false,
        loadingAddressInfo: false,
      };
    }

    async componentDidMount() {
      const { ifAddressInfoExists } = this.props;

      if (!ifAddressInfoExists || alwaysUpdate) {
        this.setState({ loadingAddressInfo: true });
        await this.loadAddressInfo();
        this.setState({ loadingAddressInfo: false });
        // eslint-disable-next-line react/destructuring-assignment
        if (!this.props.ifAddressInfoExists) {
          this.gotoLocationPage();
          return;
        }
      }
      this.setState({ addressInfoUpdated: true });
    }

    loadAddressInfo = async () => {
      const { getAddressInfo } = this.props;

      await getAddressInfo();

      const { ifAddressInfoExists } = this.props;

      if (ifAddressInfoExists) return;

      const getPlaceInfoOptions = {
        fromDevice: false,
        fromIp: false,
        ...source,
      };
      const { placeInfo } = await getPlaceInfo({ ...getPlaceInfoOptions });

      if (placeInfo) await this.updateAddressInfo(placeInfo);
    };

    updateAddressInfo = async placeInfo => {
      const { setAddressInfo } = this.props;
      const {
        placeId,
        name: shortName,
        coords,
        address: fullName,
        addressComponents: { countryCode, postCode, city },
      } = placeInfo;

      await setAddressInfo({
        placeId,
        shortName,
        fullName,
        coords,
        countryCode,
        postCode,
        city,
      });
    };

    gotoLocationPage = () => {
      const { history, location } = this.props;

      history.push({
        pathname: `${ROUTER_PATHS.ORDERING_BASE}${ROUTER_PATHS.ORDERING_LOCATION}`,
        state: { from: location },
      });
    };

    render() {
      const { ifAddressInfoExists } = this.props;
      const { loadingAddressInfo, addressInfoUpdated } = this.state;

      if (loadingAddressInfo) {
        return <div className="loader theme" />;
      }

      return (
        <>
          {ifAddressInfoExists && (!alwaysUpdate || addressInfoUpdated) && (
            // eslint-disable-next-line react/jsx-props-no-spreading
            <InnerComponent {...this.props} />
          )}
        </>
      );
    }
  }

  WithAddressInfo.displayName = 'WithAddressInfo';

  WithAddressInfo.propTypes = {
    // eslint-disable-next-line react/forbid-prop-types
    location: PropTypes.object,
    ifAddressInfoExists: PropTypes.bool,
    getAddressInfo: PropTypes.func,
    setAddressInfo: PropTypes.func,
  };

  WithAddressInfo.defaultProps = {
    location: null,
    ifAddressInfoExists: false,
    getAddressInfo: () => {},
    setAddressInfo: () => {},
  };

  return connect(
    state => ({ ifAddressInfoExists: getIfAddressInfoExists(state) }),
    dispatch => ({
      getAddressInfo: bindActionCreators(getAddressInfoThunk, dispatch),
      setAddressInfo: bindActionCreators(setAddressInfoThunk, dispatch),
    })
  )(WithAddressInfo);
};
