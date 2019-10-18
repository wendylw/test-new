import qs from 'qs';
import React from 'react';
import CurrencyNumber from '../../components/CurrencyNumber';
import {
  IconPending,
  IconChecked,
  IconEarned,
} from '../../../components/Icons';
import Header from '../../../components/Header';
import Constants from '../../../utils/constants';

import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import { getOnlineStoreInfo } from '../../redux/modules/app';
import { actions as homeActions, getCustomerId, getCashbackHistory } from '../../redux/modules/home';

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
  }

  componentWillMount() {
    const {
      history,
      homeActions,
    } = this.props;
    const { customerId = '' } = qs.parse(history.location.search, { ignoreQueryPrefix: true });

    homeActions.setCustomerId(customerId);

    if (customerId) {
      homeActions.getCashbackHistory(customerId);
    }
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
      <ul className="activity">
        {
          (cashbackHistory || []).map((activity, i) => {
            const {
              eventType,
              eventTime,
            } = activity;
            const eventDateTime = new Date(Number.parseInt(eventTime, 10));
            const type = this.getType(eventType, { className: `activity__icon ${eventType}` });

            return (
              <li key={`${i}`} className="activity__item flex flex-middle">
                {type.icon}
                <summary>
                  <h4 className="activity__title">
                    <label>{type.text}&nbsp;</label>
                    {
                      activity.eventType !== 'pending'
                        ? <CurrencyNumber money={Math.abs(activity.amount || 0)} />
                        : null
                    }
                  </h4>
                  <time className="activity__time">
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
    const {
      history,
      customerId,
    } = this.props;

    return (
      <section className="loyalty__activities" style={{
        // backgroundImage: `url(${theImage})`,
      }}>
        <Header
          className="transparent text-center"
          title="Cashback History"
          isPage={true}
          navFunc={() => {
            history.push({
              pathname: Constants.ROUTER_PATHS.CASHBACK_HOME,
              search: `?customerId=${customerId || ''}`
            });
          }}
        />
        <article className="loyalty__content">
          {this.renderLogList()}
        </article>
      </section>
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