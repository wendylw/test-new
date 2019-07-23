import React from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import qs from 'qs';
// import Message from './components/Message';
import { getCashbackAndHashData } from '../actions';
import HomeBody from './components/HomeBody';
import PhoneView from './components/PhoneView';

class PageClaim extends React.Component {
  state = {}

  componentWillMount() {
    const {
      history,
      getCashbackAndHashData,
    } = this.props;
    const { h = '' } = qs.parse(history.location.search, { ignoreQueryPrefix: true });

    getCashbackAndHashData(encodeURIComponent(h));
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
  getCashbackAndHashData,
}, dispatch);

PageClaim.propTypes = {
  onlineStoreInfo: PropTypes.object,
};

PageClaim.defaultProps = {
  onlineStoreInfo: {}
};

export default connect(mapStateToProps, mapDispatchToProps)(PageClaim);
