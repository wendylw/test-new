import React from 'react';
import { withTranslation } from 'react-i18next';
import { connect } from 'react-redux';
import { bindActionCreators, compose } from 'redux';
import { toLocaleDateString } from '../../../../../utils/datetime-lib';
import CurrencyNumber from '../../../../components/CurrencyNumber';
import { IconPending, IconChecked, IconEarned } from '../../../../../components/Icons';
import HybridHeader from '../../../../../components/HybridHeader';
import { actions as appActionCreators, getOnlineStoreInfo, getUser } from '../../../../redux/modules/app';
import { actions as homeActionCreators, getCashbackHistory } from '../../../../redux/modules/home';
import './RecentActivities.scss';

const DATE_OPTIONS = {
  weekday: 'short',
  year: 'numeric',
  month: 'short',
  day: 'numeric',
};

class RecentActivities extends React.Component {
  componentDidMount() {
    const { user } = this.props;
    const { isLogin, customerId } = user || {};

    if (isLogin && customerId) {
      this.getLoyaltyHistory(customerId);
    }
    this.props.onModalVisibilityChanged(true);
  }

  componentWillUnmount() {
    this.props.onModalVisibilityChanged(false);
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
      <ul className="padding-left-right-small">
        {(cashbackHistory || []).map((activity, i) => {
          const { eventType, eventTime } = activity;
          const eventDateTime = new Date(Number.parseInt(eventTime, 10));
          const type = this.getType(eventType, {
            className: `recent-activities__list-icon icon  ${
              eventType === 'earned' ? 'icon__primary' : 'icon__default'
            }`,
          });

          return (
            <li
              key={`${i}`}
              className="recent-activities__list-item padding-normal margin-top-bottom-small flex flex-middle"
            >
              {type.icon}
              <summary className="padding-left-right-normal">
                <h4 className="margin-top-bottom-small">
                  <label>{type.text}&nbsp;</label>
                  {activity.eventType !== 'pending' ? <CurrencyNumber money={Math.abs(activity.amount || 0)} /> : null}
                </h4>
                <time className="recent-activities__time padding-top-bottom-smaller">
                  {toLocaleDateString(eventDateTime, country, DATE_OPTIONS)}
                </time>
              </summary>
            </li>
          );
        })}
      </ul>
    );
  }

  render() {
    const { t } = this.props;

    return (
      <>
        <HybridHeader
          data-heap-name="cashback.home.recent-activities.header"
          className="flex-middle text-center"
          contentClassName="flex-middle"
          isPage={true}
          title={t('CashbackHistory')}
        />

        <section className="recent-activities" data-heap-name="cashback.home.recent-activities.container">
          <article className="flex__shrink-fixed">{this.renderLogList()}</article>
        </section>
      </>
    );
  }
}

RecentActivities.displayName = 'RecentActivities';

RecentActivities.defaultProps = {
  onModalVisibilityChanged: () => {},
};

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
