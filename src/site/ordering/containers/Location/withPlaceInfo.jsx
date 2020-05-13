import React from 'react';
import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';
import Constants from '../../../../utils/constants';
import { getPlaceInfo } from '../../../home/utils';
import { appActionCreators } from '../../../redux/modules/app';

const { ROUTER_PATHS } = Constants;

export default (source = {}) => InnerComponent => {
  const getPlaceInfoOptions = {
    fromLocationPage: true,
    fromCache: true,
    fromDevice: false,
    fromIp: false,
    ...source,
  };
  class withPlaceInfo extends React.Component {
    async componentDidMount() {
      const { location, setCurrentPlaceInfo } = this.props;

      if (!this.hasPlaceInfo) {
        const { placeInfo } = await getPlaceInfo({
          ...getPlaceInfoOptions,
          location,
        });
        if (placeInfo) {
          setCurrentPlaceInfo(placeInfo);
        } else {
          this.gotoLocationPage();
        }
      }
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
      return <>{this.hasPlaceInfo && <InnerComponent {...this.props} />}</>;
    }
  }
  return connect(
    state => ({ currentPlaceId: state.app.currentPlaceId }),
    dispatch => bindActionCreators({ setCurrentPlaceInfo: appActionCreators.setCurrentPlaceInfo }, dispatch)
  )(withPlaceInfo);
};
