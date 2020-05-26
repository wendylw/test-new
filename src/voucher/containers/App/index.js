import React, { Component } from 'react';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import { actions as appActionCreators, getOnlineStoreInfoFavicon } from '../../redux/modules/app';
import Routes from '../Routes';
import DocumentFavicon from '../../../components/DocumentFavicon';
import faviconImage from '../../../images/favicon.ico';

class App extends Component {
  state = {
    loadingBaseData: true,
  };

  componentDidMount() {
    this.loadBaseData();
  }

  loadBaseData = () => {
    const { appActions } = this.props;
    this.setState({
      loadingBaseData: true,
    });
    const baseDataRequestList = [appActions.loadOnlineStoreInfo(), appActions.loadBusinessInfo()];

    return Promise.all(baseDataRequestList).finally(() => {
      this.setState({
        loadingBaseData: false,
      });
    });
  };

  renderPageLoader() {
    return <div className="loader theme page-loader"></div>;
  }

  render() {
    if (this.state.loadingBaseData) {
      return this.renderPageLoader();
    }

    return (
      <main className="voucher-ordering">
        <Routes />
        <DocumentFavicon icon={this.props.favicon || faviconImage} />
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
