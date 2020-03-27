import React, { Component } from 'react';
import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';
import { actions as appActionCreators, getError } from '../redux/modules/app';
import Error from './components/Error';
import Routes from '../Routes.js';
import DocumentFavicon from '../../components/DocumentFavicon';
import faviconImage from '../../images/favicon.ico';
import '../styles.scss';

class App extends Component {
  render() {
    return (
      <div className="qr-scanner-app">
        {/* Routes */}
        <Routes />
        <DocumentFavicon icon={faviconImage} />
        {this.renderError()}
      </div>
    );
  }

  renderError() {
    const { error, appActions } = this.props;

    if (!error) {
      return null;
    }

    return <Error message={error} clearError={appActions.clearError} />;
  }
}

export default connect(
  (state, props) => {
    return {
      error: getError(state),
    };
  },
  dispatch => ({
    appActions: bindActionCreators(appActionCreators, dispatch),
  })
)(App);
