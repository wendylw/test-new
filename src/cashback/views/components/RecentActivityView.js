import React from 'react';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import { withRouter } from "react-router";
import InfiniteScroll from 'react-infinite-scroller';
import { setUserLoyalty, sendMessage } from '../../actions';
import api from '../../utils/api';
import Constants from '../../utils/Constants';
import CurrencyNumber from './CurrencyNumber';

class RecentActivityView extends React.Component {
  pageSize = 10;

  state = {
    hasMore: true,
  };

  async fetch(pageNum) {
    const { customerId, history } = this.props;

    if (!customerId) {
      console.error(new Error('custom id is required in RecentActivityView'));
      this.props.sendMessage('Activity incorrect, need retry.');
      history.push('/');
      return;
    }

    try {
      const { ok, data } = await api({
        url: Constants.api.LOYALTY(customerId),
        method: 'get',
        params: {
          page: pageNum, // TODO: endless query for new data for this view.
          count: this.pageSize,
        },
      });

      if (ok) {
        this.props.setUserLoyalty(data);

        if (!Array.isArray(data) || data.length < this.pageSize) {
          this.setState({ hasMore: false });
        }
      }

      if (pageNum > 200) {
        console.warn('code failure? ui component container needs maxHeight');
      }
    } catch (e) {
      console.error(e);
    } finally {
    }
  }

  render() {
    const { loyaltyList, customerId, fullScreen } = this.props;

    if (!Array.isArray(loyaltyList) || !customerId) {
      return null;
    }

    const items = loyaltyList.map((activity, i) => (
      <div key={`${i}`} className="activity__item flex flex-middle">
        <i className="activity__icon-checked"></i>
        <summary>
          <h4 className="activity__title">
            <label>{activity.eventType}</label> <CurrencyNumber money={activity.amount} />
          </h4>
          <time className="activity__time">{activity.eventTime}</time>
        </summary>
      </div>
    ));

    return (
      <div className="activity">
        <InfiniteScroll
          pageState={this.nextPageNum}
          loadMore={this.fetch.bind(this)}
          hasMore={this.state.hasMore}
          loader={<div className="loader" key={0}>Loading...</div>}
          useWindow={false}
        >
          {items}
        </InfiniteScroll>
      </div>
    );
  }
}

const mapStateToProps = state => ({
  loyaltyList: state.user.loyaltyList,
  customerId: state.user.customerId,
});

const mapDispatchToProps = dispatch => bindActionCreators({
  setUserLoyalty,
  sendMessage,
}, dispatch);

export default connect(mapStateToProps, mapDispatchToProps)(withRouter(RecentActivityView));