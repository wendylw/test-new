import React from 'react';
import qs from 'qs';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import { getCashbackHashData } from '../actions';

const withCashbackHash = TheComponent =>
  class WithCashbackHash extends React.Component {
    componentWillMount() {
      const { history, getCashbackHashData } = this.props;
      const { h = '' } = qs.parse(history.location.search, { ignoreQueryPrefix: true });
      getCashbackHashData(encodeURIComponent(h));
    }

    render() {
      const { children, h, ...props } = this.props;

      if (!h) return null;

      return (
        <TheComponent {...props}>{children}</TheComponent>
      );
    }
  }

const mapStateToProps = state => ({
  h: (state.common.hashData || {}).h,
});

const mapDispatchToProps = dispatch => bindActionCreators({
  getCashbackHashData,
}, dispatch);

export default connect(mapStateToProps, mapDispatchToProps)(withCashbackHash);
