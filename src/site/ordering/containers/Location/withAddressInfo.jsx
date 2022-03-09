import React from 'react';
import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';
import Constants from '../../../../utils/constants';
import { getPlaceInfo } from '../../../home/utils';
import { getIfAddressInfoExists } from '../../../../redux/modules/address/selectors';
import { getAddressInfo, setAddressInfo } from '../../../../redux/modules/address/thunks';

const { ROUTER_PATHS } = Constants;

// alwayUpdate means each time we enter the page, we will try to update currentPlaceInfo again, no matter
// whether currentPlaceInfo already exist. This is used in pages that has location bar.
export const withAddressInfo = (source = {}, alwaysUpdate = false) => InnerComponent => {
  class WithAddressInfo extends React.Component {
    state = {
      addressInfoUpdated: false,
      loadingAddressInfo: false,
    };
    async componentDidMount() {
      const { ifAddressInfoExists } = this.props;

      if (!ifAddressInfoExists || alwaysUpdate) {
        this.setState({ loadingAddressInfo: true });
        await this.loadAddressInfo();
        this.setState({ loadingAddressInfo: false });
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

      if (this.props.ifAddressInfoExists) return;

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

      if (this.state.loadingAddressInfo) {
        return <div className="loader theme"></div>;
      }

      return (
        <>
          {ifAddressInfoExists && (!alwaysUpdate || this.state.addressInfoUpdated) && (
            <InnerComponent {...this.props} />
          )}
        </>
      );
    }
  }
  WithAddressInfo.displayName = 'WithAddressInfo';
  return connect(
    state => ({ ifAddressInfoExists: getIfAddressInfoExists(state) }),
    dispatch => ({
      getAddressInfo: bindActionCreators(getAddressInfo, dispatch),
      setAddressInfo: bindActionCreators(setAddressInfo, dispatch),
    })
  )(WithAddressInfo);
};
