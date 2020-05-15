import React from 'react';
import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';
import Constants from '../../../../utils/constants';
import { getPlaceInfo } from '../../../home/utils';
import { appActionCreators } from '../../../redux/modules/app';

const { ROUTER_PATHS } = Constants;

// alwayUpdate means each time we enter the page, we will try to update currentPlaceInfo again, no matter
// whether currentPlaceInfo already exist. This is used in pages that has location bar.
export default (source = {}, alwaysUpdate = false) => InnerComponent => {
  const getPlaceInfoOptions = {
    fromLocationPage: true,
    fromCache: true,
    fromDevice: false,
    fromIp: false,
    ...source,
  };
  class withPlaceInfo extends React.Component {
    state = {
      placeInfoUpdated: false,
    };
    async componentDidMount() {
      const { location, setCurrentPlaceInfo } = this.props;

      if (!this.hasPlaceInfo || alwaysUpdate) {
        const { placeInfo, source } = await getPlaceInfo({
          ...getPlaceInfoOptions,
          location,
        });
        if (placeInfo) {
          setCurrentPlaceInfo(placeInfo, source);
        } else {
          this.gotoLocationPage();
          return;
        }
      }
      this.setState({ placeInfoUpdated: true });
    }

    get hasPlaceInfo() {
      return !!this.props.currentPlaceId;
    }

    gotoLocationPage = () => {
      const { history, location } = this.props;

      history.push({
        pathname: `${ROUTER_PATHS.ORDERING_BASE}${ROUTER_PATHS.ORDERING_LOCATION}`,
        state: { from: location },
      });
    };

    render() {
      return (
        <>{this.hasPlaceInfo && (!alwaysUpdate || this.state.placeInfoUpdated) && <InnerComponent {...this.props} />}</>
      );
    }
  }
  return connect(
    state => ({ currentPlaceId: state.app.currentPlaceId }),
    dispatch => bindActionCreators({ setCurrentPlaceInfo: appActionCreators.setCurrentPlaceInfo }, dispatch)
  )(withPlaceInfo);
};
