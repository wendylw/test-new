import React, { Component } from 'react';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import { actions as appActionCreators, getOnlineStoreInfoFavicon } from '../../redux/modules/app';
import Routes from '../Routes';
import DocumentFavicon from '../../../components/DocumentFavicon';
import faviconImage from '../../../images/favicon.ico';

class App extends Component {
  componentDidMount() {
    this.props.appActions.loadOnlineStoreInfo();
    this.props.appActions.loadBusinessInfo();
  }

  render() {
    const { favicon } = this.props;
    return (
      <main className="voucher-ordering">
        <Routes />
        <DocumentFavicon icon={favicon || faviconImage} />
      </main>
    );
  }
}

export default connect(
  state => ({
    favicon: getOnlineStoreInfoFavicon(state),
  }),
  dispatch => ({
    appActions: bindActionCreators(appActionCreators, dispatch),
  })
)(App);
