import React from 'react';
import PropTypes from 'prop-types';
import { withTranslation } from 'react-i18next';
import { connect } from 'react-redux';
import { bindActionCreators, compose } from 'redux';
import { toLocaleDateString } from '../../../utils/datetime-lib';
import CurrencyNumber from '../../components/CurrencyNumber';
import { IconPending, IconChecked, IconEarned } from '../../../components/Icons';
import HybridHeader from '../../../components/HybridHeader';
import {
  actions as appActionCreators,
  getOnlineStoreInfo,
  getIsUserLogin,
  getUserCustomerId,
  getCashbackHistory,
} from '../../redux/modules/app';
import './RecentActivities.scss';

const DATE_OPTIONS = {
  weekday: 'short',
  year: 'numeric',
  month: 'short',
  day: 'numeric',
};

class RecentActivities extends React.Component {
  componentDidMount() {
    const { isUserLogin, userCustomerId, onModalVisibilityChanged } = this.props;

    if (isUserLogin && userCustomerId) {
      this.getLoyaltyHistory(userCustomerId);
    }
    onModalVisibilityChanged(true);
  }

  componentDidUpdate(prevProps) {
    const { userCustomerId: prevUserCustomerId } = prevProps;
    const { userCustomerId: currUserCustomerId, isFetching, isUserLogin } = this.props;

    if (isFetching || !isUserLogin) {
      return;
    }

    if (currUserCustomerId && prevUserCustomerId !== currUserCustomerId) {
      this.getLoyaltyHistory(currUserCustomerId);
    }
  }

  componentWillUnmount() {
    const { onModalVisibilityChanged } = this.props;
    onModalVisibilityChanged(false);
  }

  getLoyaltyHistory(customerId) {
    const { appActions } = this.props;

    if (customerId) {
      appActions.getCashbackHistory(customerId);
    }
  }

  getType(type, props) {
    const { t } = this.props;
    const TypesMap = {
      pending: {
        text: t('CashbackPending'),
        // eslint-disable-next-line react/jsx-props-no-spreading
        icon: <IconPending {...props} />,
      },
      /* expense is same as redeemed */
      expense: {
        text: t('Redeemed'),
        // eslint-disable-next-line react/jsx-props-no-spreading
        icon: <IconChecked {...props} />,
      },
      earned: {
        text: t('YouEarned'),
        // eslint-disable-next-line react/jsx-props-no-spreading
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
              // eslint-disable-next-line react/no-array-index-key
              key={`${i}`}
              className="recent-activities__list-item padding-normal margin-top-bottom-small flex flex-middle"
            >
              {type.icon}
              <summary className="padding-left-right-normal">
                <h4 className="margin-top-bottom-small">
                  <span>{type.text}&nbsp;</span>
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
          data-test-id="cashback.home.recent-activities.header"
          className="flex-middle text-center"
          contentClassName="flex-middle"
          isPage
          title={t('CashbackHistory')}
        />

        <section className="recent-activities" data-test-id="cashback.home.recent-activities.container">
          <article className="flex__shrink-fixed">{this.renderLogList()}</article>
        </section>
      </>
    );
  }
}

RecentActivities.displayName = 'RecentActivities';

RecentActivities.propTypes = {
  isFetching: PropTypes.bool,
  isUserLogin: PropTypes.bool,
  userCustomerId: PropTypes.string,
  onModalVisibilityChanged: PropTypes.func,
  cashbackHistory: PropTypes.arrayOf(PropTypes.object),
  onlineStoreInfo: PropTypes.shape({
    country: PropTypes.string,
  }),
  appActions: PropTypes.shape({
    getCashbackHistory: PropTypes.func,
  }),
};

RecentActivities.defaultProps = {
  isFetching: false,
  isUserLogin: false,
  userCustomerId: '',
  onModalVisibilityChanged: () => {},
  cashbackHistory: [],
  onlineStoreInfo: {
    country: '',
  },
  appActions: {
    getCashbackHistory: () => {},
  },
};

export default compose(
  withTranslation(['Cashback']),
  connect(
    state => ({
      isUserLogin: getIsUserLogin(state),
      userCustomerId: getUserCustomerId(state),
      onlineStoreInfo: getOnlineStoreInfo(state),
      cashbackHistory: getCashbackHistory(state),
    }),
    dispatch => ({
      appActions: bindActionCreators(appActionCreators, dispatch),
    })
  )
)(RecentActivities);
