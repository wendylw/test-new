import React from 'react';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import { Query } from 'react-apollo';
import qs from 'qs';
import Message from './components/Message';
import { setOnlineStoreInfo, getCashbackAndHashData } from '../actions';
import HomeBody from './components/HomeBody';
import PhoneView from './components/PhoneView';
import theImage from '../images/cash-back-bg-temp.png';
import apiGql from '../../apiGql';
import config from '../../config';

class PageClaim extends React.Component {
  state = {  }

  componentWillMount() {
    const { history, getCashbackAndHashData } = this.props;
    const { h = '' } = qs.parse(history.location.search, { ignoreQueryPrefix: true });
    getCashbackAndHashData(encodeURIComponent(h));
  }

  renderMainContents() {
    return (
      <React.Fragment>
        <Message />
        <HomeBody />
        <PhoneView />
      </React.Fragment>
    );
  }

  render() {
    return (
      <main className="cash-back flex-column" style={{
        // backgroundImage: `url(${theImage})`,
      }}>
        <Query
          query={apiGql.GET_ONLINE_STORE_INFO}
          variables={{ business: config.business }}
          onCompleted={({ onlineStoreInfo }) => this.props.setOnlineStoreInfo(onlineStoreInfo)}>
            {this.renderMainContents.bind(this)}
        </Query>
      </main>
    );
  }
}

const mapStateToProps = () => ({ });

const mapDispatchToProps = dispatch => bindActionCreators({
  setOnlineStoreInfo,
  getCashbackAndHashData,
}, dispatch);

export default connect(mapStateToProps, mapDispatchToProps)(PageClaim);