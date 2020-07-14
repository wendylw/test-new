import React from 'react';
import { withTranslation } from 'react-i18next';
import CurrencyNumber from '../../../../components/CurrencyNumber';
import { IconPending, IconChecked, IconEarned } from '../../../../../components/Icons';
import Header from '../../../../../components/Header';
import Constants from '../../../../../utils/constants';

import { connect } from 'react-redux';
import { bindActionCreators, compose } from 'redux';
import { actions as appActionCreators, getOnlineStoreInfo, getUser } from '../../../../redux/modules/app';
import { actions as homeActionCreators, getCashbackHistory } from '../../../../redux/modules/home';
import { toLocaleDateString } from '../../../../../utils/datetime-lib';

const DATE_OPTIONS = {
  weekday: 'short',
  year: 'numeric',
  month: 'short',
  day: 'numeric',
};

class RecentActivities extends React.Component {
  state = {
    fullScreen: false,
  };

  componentDidMount() {
    const { user } = this.props;
    const { isLogin, customerId } = user || {};

    if (isLogin && customerId) {
      this.getLoyaltyHistory(customerId);
    }
  }

  componentDidUpdate(prevProps) {
    const { isFetching, user } = this.props;
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
    const { t } = this.props;
    const TypesMap = {
      pending: {
        text: t('CashbackPending'),
        icon: <IconPending {...props} />,
      },
      /* expense is same as redeemed */
      expense: {
        text: t('Redeemed'),
        icon: <IconChecked {...props} />,
      },
      earned: {
        text: t('YouEarned'),
        icon: <IconEarned {...props} />,
      },
    };

    return TypesMap[type];
  }

  renderLogList() {
    const { cashbackHistory, onlineStoreInfo } = this.props;
    const { country } = onlineStoreInfo || {};

    return (
      <ul className="activity">
        {(cashbackHistory || []).map((activity, i) => {
          const { eventType, eventTime } = activity;
          const eventDateTime = new Date(Number.parseInt(eventTime, 10));
          const type = this.getType(eventType, { className: `activity__icon ${eventType}` });

          return (
            <li key={`${i}`} className="activity__item flex flex-middle">
              {type.icon}
              <summary>
                <h4 className="activity__title">
                  <label>{type.text}&nbsp;</label>
                  {activity.eventType !== 'pending' ? <CurrencyNumber money={Math.abs(activity.amount || 0)} /> : null}
                </h4>
                <time className="activity__time">{toLocaleDateString(eventDateTime, country, DATE_OPTIONS)}</time>
              </summary>
            </li>
          );
        })}
      </ul>
    );
  }

  render() {
    const { t, history, customerId, closeActivity } = this.props;

    return (
      <section
        className="loyalty__activities"
        style={
          {
            // backgroundImage: `url(${theImage})`,
          }
        }
        data-heap-name="cashback.home.recent-activities.container"
      >
        <Header
          className="flex-middle text-center"
          contentClassName="flex-middle"
          data-heap-name="cashback.home.recent-activities.header"
          title={t('CashbackHistory')}
          isPage={true}
          navFunc={() => {
            history.push({
              pathname: Constants.ROUTER_PATHS.CASHBACK_HOME,
              search: `?customerId=${customerId || ''}`,
            });
            closeActivity();
          }}
        />
        <article className="flex__shrink-fixed loyalty__content">{this.renderLogList()}</article>
      </section>
    );
  }
}

export default compose(
  withTranslation(['Cashback']),
  connect(
    state => ({
      user: getUser(state),
      onlineStoreInfo: getOnlineStoreInfo(state),
      cashbackHistory: getCashbackHistory(state),
    }),
    dispatch => ({
      appActions: bindActionCreators(appActionCreators, dispatch),
      homeActions: bindActionCreators(homeActionCreators, dispatch),
    })
  )
)(RecentActivities);
