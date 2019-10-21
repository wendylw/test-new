import React from 'react';
import CurrencyNumber from '../../../../components/CurrencyNumber';
import { IconTicket } from '../../../../../components/Icons';
import Header from '../../../../../components/Header';

import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import { getOnlineStoreInfo } from '../../../../redux/modules/app';
import { actions as homeActions, getCustomerId, getCashbackHistory } from '../../../../redux/modules/home';

const LANGUAGES = {
  MY: 'EN',
  TH: 'EN',
  PH: 'EN',
};
const DATE_OPTIONS = {
  weekday: 'short',
  year: 'numeric',
  month: 'short',
  day: 'numeric',
};

class RecentActivities extends React.Component {
  state = {
    fullScreen: false,
  }

  componentWillMount() {
    const { homeActions, customerId } = this.props;

    if (customerId) {
      homeActions.getCashbackHistory(customerId);
    }
  }

  toggleFullScreen() {
    this.setState({ fullScreen: !this.state.fullScreen });
  }

  renderLogList() {
    const {
      cashbackHistory,
      onlineStoreInfo,
    } = this.props;
    const { country } = onlineStoreInfo || {};

    return (
      <ul className={`receipt-list ${this.state.fullScreen ? 'full' : ''}`}>
        {
          (cashbackHistory || []).map((activity, i) => {
            const {
              eventType,
              eventTime,
            } = activity;
            const eventDateTime = new Date(Number.parseInt(eventTime, 10));

            return (
              <li key={`${i}`} className="receipt-list__item flex flex-middle">
                <IconTicket className="activity__icon ticket" />
                <summary>
                  <h4 className="receipt-list__title">
                    <label>Receipt - </label>
                    {
                      eventType !== 'pending'
                        ? <CurrencyNumber money={Math.abs(activity.amount || 0)} />
                        : null
                    }
                  </h4>
                  <time className="receipt-list__time">
                    {eventDateTime.toLocaleDateString(LANGUAGES[country || 'MY'], DATE_OPTIONS)}
                  </time>
                </summary>
              </li>
            );
          })
        }
      </ul>
    );
  }

  render() {
    const { cashbackHistory, customerId } = this.props;

    if (!Array.isArray(cashbackHistory) || !customerId) {
      return null;
    }

    return (
      <div className={`aside-section ${this.state.fullScreen ? 'full' : ''}`}>
        <aside className="aside-bottom">
          {
            !this.state.fullScreen
              ? <i className="aside-bottom__slide-button" onClick={this.toggleFullScreen.bind(this)}></i>
              : <Header navFunc={this.toggleFullScreen.bind(this)} />
          }
          <h3 className="aside-bottom__title text-center" onClick={this.toggleFullScreen.bind(this)}>Recent Activities</h3>
          {this.renderLogList()}
        </aside>
      </div>
    );
  }
}

export default connect(
  (state) => ({
    onlineStoreInfo: getOnlineStoreInfo(state),
    customerId: getCustomerId(state),
    cashbackHistory: getCashbackHistory(state),
  }),
  (dispatch) => ({
    homeActions: bindActionCreators(homeActions, dispatch),
  })
)(RecentActivities);