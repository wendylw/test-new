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
    const { errorMessageKey } = this.props;

    return (
      <main className="cash-back flex-column" style={{
        // backgroundImage: `url(${theImage})`,
      }}>
        <HomeBody />
        {
          errorMessageKey === 'Merchant_Limited'
            ? (
              <section className="asdie-section">
                <aside className="aside-bottom not-full">
                  <label className="phone-view-form__label text-center">Sorry, cashback claims are unavailable at the moment.</label>
                  <label className="phone-view-form__label text-center">Please speak to the cashier for more information.</label>
                </aside>
              </section>
            )
            : <PhoneView />
        }
      </main>
    );
  }
}

const mapStateToProps = (state) => ({
  errorMessageKey: state.message.errorStatus,
});

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
