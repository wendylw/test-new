import React from 'react';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import { withRouter } from "react-router";
import InfiniteScroll from 'react-infinite-scroller';
import { sendMessage, getCashbackHistory } from '../../actions';
import CurrencyNumber from './CurrencyNumber';
import { IconPending, IconChecked, IconEarned } from './Icons';

class RecentActivityView extends React.Component {
  pageSize = 10;

  async fetch(pageNum) {
    const { customerId, history, getCashbackHistory } = this.props;

    if (!customerId) {
      console.error(new Error('custom id is required in RecentActivityView'));
      this.props.sendMessage('Activity incorrect, need retry.');
      history.push('/');
      return;
    }

    try {
      await getCashbackHistory({
        customerId,
        page: pageNum,
        size: this.pageSize,
      });

      if (pageNum > 200) {
        console.warn('code failure? ui component container needs maxHeight');
      }
    } catch (e) {
      console.error(e);
    } finally {
    }
  }

  renderEventType(eventType) {
    const eventTypesMap = {
      pending: "Cashback Pending",
      /* expense is same as redeemed */
      expense: "Redeemed",
      earned: "You earned",
    };

    return eventTypesMap[eventType] || eventType;
  }

  renderIcon(eventType, props) {
    const eventTypesMap = {
      pending: IconPending,
      expense: IconChecked,
      earned: IconEarned,
    };

    const IconComponent = eventTypesMap[eventType];

    if (!IconComponent) return null;

    return (
      <IconComponent {...props} />
    );
  }

  renderEventTime(eventTime) {
    // const { onlineStoreInfo: { locale } = {} } = this.props || {};
    const dateOptions = { weekday: 'short', year: 'numeric', month: 'short', day: 'numeric' };
    const eventDateTime = new Date(Number.parseInt(eventTime, 10));
    const locale = 'en'; // use English by now.

    if (locale) {
      return eventDateTime.toLocaleDateString(locale, dateOptions);
    }

    return eventDateTime.toDateString(dateOptions);
  }

  render() {
    const { cashbackHistory, customerId } = this.props;
    const { logs, hasMore } = cashbackHistory;

    if (!Array.isArray(logs) || !customerId) {
      return null;
    }

    const items = logs.map((activity, i) => (
      <div key={`${i}`} className="activity__item flex flex-middle">
        {this.renderIcon(activity.eventType, { className: 'activity__icon' })}
        <summary>
          <h4 className="activity__title">
            <label>{this.renderEventType(activity.eventType)}</label>
            {
              activity.eventType !== 'pending'
              ? <CurrencyNumber money={activity.amount || 0} />
              : null
            }
          </h4>
          <time className="activity__time">{this.renderEventTime(activity.eventTime)}</time>
        </summary>
      </div>
    ));

    return (
      <div className="activity">
        <InfiniteScroll
          pageStart={0}
          loadMore={this.fetch.bind(this)}
          hasMore={hasMore}
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
  cashbackHistory: state.user.cashbackHistory,
  customerId: state.user.customerId,
});

const mapDispatchToProps = dispatch => bindActionCreators({
  sendMessage,
  getCashbackHistory,
}, dispatch);

export default connect(mapStateToProps, mapDispatchToProps)(withRouter(RecentActivityView));