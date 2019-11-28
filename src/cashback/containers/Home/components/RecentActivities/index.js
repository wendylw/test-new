import React from 'react';
import CurrencyNumber from '../../../../components/CurrencyNumber';
import {
  IconPending,
  IconChecked,
  IconEarned,
} from '../../../../../components/Icons';
import Header from '../../../../../components/Header';

import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import { actions as appActions, getOnlineStoreInfo, getUser } from '../../../../redux/modules/app';
import { actions as homeActions, getCashbackHistory } from '../../../../redux/modules/home';

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

  componentDidMount() {
    const { user } = this.props;
    const { isLogin, customerId } = user || {};

    if (isLogin && customerId) {
      this.getLoyaltyHistory(customerId);
    }
  }

  componentDidUpdate(prevProps) {
    const {
      isFetching,
      user,
    } = this.props;
    const { isLogin, customerId } = user || {};

    if (isFetching || !isLogin) {
      return;
    }

    if (customerId && prevProps.user.customerId !== customerId) {
      this.getLoyaltyHistory(customerId);
    }
  }

  getLoyaltyHistory(customerId) {
    const { homeActions } = this.props;

    if (customerId) {
      homeActions.getCashbackHistory(customerId);
    }
  }

  toggleFullScreen() {
    this.setState({ fullScreen: !this.state.fullScreen });
  }

  getType(type, props) {
    const TypesMap = {
      pending: {
        text: 'Cashback Pending',
        icon: <IconPending {...props} />,
      },
      /* expense is same as redeemed */
      expense: {
        text: 'Redeemed',
        icon: <IconChecked {...props} />,
      },
      earned: {
        text: 'You earned',
        icon: <IconEarned {...props} />,
      },
    };

    return TypesMap[type];
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
            const type = this.getType(eventType, { className: 'receipt-list__icon' });

            return (
              <li key={`${i}`} className="receipt-list__item flex flex-middle">
                {type.icon}
                <summary>
                  <h4 className="receipt-list__title">
                    <label>{type.text}&nbsp;</label>
                    {
                      activity.eventType !== 'pending'
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
    const { cashbackHistory, user } = this.props;
    const { customerId } = user || {};

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
    user: getUser(state),
    onlineStoreInfo: getOnlineStoreInfo(state),
    cashbackHistory: getCashbackHistory(state),
  }),
  (dispatch) => ({
    appActions: bindActionCreators(appActions, dispatch),
    homeActions: bindActionCreators(homeActions, dispatch),
  })
)(RecentActivities);