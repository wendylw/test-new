import React from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { bindActionCreators, compose } from 'redux';
import '../../../common/styles/base.scss';
import ErrorToast from '../../../components/ErrorToast';
import { appActionCreators, getError } from '../../redux/modules/app';
import Routes from '../../Routes';

class SiteApp extends React.Component {
  componentDidMount = async () => {
    const { appActions } = this.props;

    await appActions.ping();
  };

  render() {
    const { error, appActions } = this.props;

    return (
      <div className="tw-font-sans">
        {error ? (
          <ErrorToast
            className="fixed-wrapper padding-normal"
            message={JSON.stringify(error)}
            clearError={appActions.clearError}
          />
        ) : null}
        <Routes />
      </div>
    );
  }
}

SiteApp.displayName = 'SiteApp';

SiteApp.propTypes = {
  error: PropTypes.oneOfType([PropTypes.string, PropTypes.object]),
  appActions: PropTypes.shape({
    ping: PropTypes.func,
    clearError: PropTypes.func,
  }),
};

SiteApp.defaultProps = {
  error: '',
  appActions: {
    ping: () => {},
    clearError: () => {},
  },
};

export default compose(
  connect(
    state => ({
      error: getError(state),
    }),
    dispatch => ({
      appActions: bindActionCreators(appActionCreators, dispatch),
    })
  )
)(SiteApp);
