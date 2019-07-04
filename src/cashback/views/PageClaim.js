import React from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import qs from 'qs';
// import Message from './components/Message';
import { setOnlineStoreInfo, getCashbackAndHashData } from '../actions';
import HomeBody from './components/HomeBody';
import PhoneView from './components/PhoneView';

class PageClaim extends React.Component {
  state = {}

  componentWillMount() {
    const {
      history,
      getCashbackAndHashData,
      onlineStoreInfo,
      setOnlineStoreInfo
    } = this.props;
    const { h = '' } = qs.parse(history.location.search, { ignoreQueryPrefix: true });

    getCashbackAndHashData(encodeURIComponent(h));
    setOnlineStoreInfo(onlineStoreInfo);
  }

  render() {
    return (
      <main className="cash-back flex-column" style={{
        // backgroundImage: `url(${theImage})`,
      }}>
        <HomeBody />
        <PhoneView />
      </main>
    );
  }
}

const mapStateToProps = () => ({});

const mapDispatchToProps = dispatch => bindActionCreators({
  setOnlineStoreInfo,
  getCashbackAndHashData,
}, dispatch);

PageClaim.propTypes = {
  onlineStoreInfo: PropTypes.object,
};

PageClaim.defaultProps = {
  onlineStoreInfo: {}
};

export default connect(mapStateToProps, mapDispatchToProps)(PageClaim);
