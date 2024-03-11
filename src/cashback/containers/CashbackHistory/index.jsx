import React from 'react';
import PropTypes from 'prop-types';
import { withTranslation } from 'react-i18next';
import { connect } from 'react-redux';
import { bindActionCreators, compose } from 'redux';
import { PlusCircle, CheckCircle, ClockCounterClockwise } from 'phosphor-react';
import { toLocaleDateString } from '../../../utils/datetime-lib';
import { goBack } from '../../../utils/native-methods';
import { getConsumerId } from '../../../redux/modules/user/selectors';
import { initUserInfo } from '../../../redux/modules/user/thunks';
import { getMerchantCountry } from '../../../redux/modules/merchant/selectors';
import { getIsWebview } from '../../redux/modules/common/selectors';
import { getCustomerId } from '../../redux/modules/customer/selectors';
import { loadConsumerCustomerInfo as loadConsumerCustomerInfoThunk } from '../../redux/modules/customer/thunks';
import { getCashbackHistoryList } from './redux/selectors';
import { mounted as mountedThunk, fetchCashbackHistoryList as fetchCashbackHistoryListThunk } from './redux/thunks';
import { getIsUserLogin } from '../../redux/modules/app';
import CurrencyNumber from '../../components/CurrencyNumber';
import HybridHeader from '../../../components/HybridHeader';
import './CashbackHistory.scss';

const DATE_OPTIONS = {
  weekday: 'short',
  year: 'numeric',
  month: 'short',
  day: 'numeric',
};

class CashbackHistory extends React.Component {
  componentDidMount() {
    const { mounted } = this.props;

    mounted();
  }

  async componentDidUpdate(prevProps) {
    const { isUserLogin: prevIsUserLogin } = prevProps;
    const { isUserLogin, loadConsumerCustomerInfo, fetchCashbackHistoryList } = this.props;

    if (isUserLogin && isUserLogin !== prevIsUserLogin) {
      await initUserInfo();

      const { consumerId } = this.props;

      await loadConsumerCustomerInfo(consumerId);
      fetchCashbackHistoryList();
    }
  }

  getType(type, props) {
    const { t } = this.props;
    const TypesMap = {
      pending: {
        text: t('CashbackPending'),
        // eslint-disable-next-line react/jsx-props-no-spreading
        icon: <ClockCounterClockwise size={32} weight="fill" {...props} />,
      },
      /* expense is same as redeemed */
      expense: {
        text: t('Redeemed'),
        // eslint-disable-next-line react/jsx-props-no-spreading
        icon: <CheckCircle size={32} weight="fill" {...props} />,
      },
      earned: {
        text: t('YouEarned'),
        // eslint-disable-next-line react/jsx-props-no-spreading
        icon: <PlusCircle size={32} weight="fill" {...props} />,
      },
      adjustment: {
        text: t('Adjustment'),
        // eslint-disable-next-line react/jsx-props-no-spreading
        icon: <PlusCircle size={32} weight="fill" {...props} />,
      },
    };

    return TypesMap[type];
  }

  renderLogList() {
    const { cashbackHistoryList, country } = this.props;

    return (
      <ul className="padding-left-right-small">
        {cashbackHistoryList.map((activity, i) => {
          const { eventType, eventTime } = activity;
          const eventDateTime = new Date(Number.parseInt(eventTime, 10));
          const type = this.getType(eventType, {
            className: `recent-activities__list-icon icon  ${
              eventType === 'earned' || eventType === 'adjustment' ? 'icon__primary' : 'icon__default'
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
    const { t, history, isWebview } = this.props;

    return (
      <>
        <HybridHeader
          data-test-id="cashback.home.recent-activities.header"
          className="flex-middle text-center"
          contentClassName="flex-middle"
          isPage
          title={t('CashbackHistory')}
          navFunc={() => {
            if (isWebview) {
              goBack();

              return;
            }

            history.goBack();
          }}
        />

        <section className="recent-activities" data-test-id="cashback.home.recent-activities.container">
          <article className="flex__shrink-fixed">{this.renderLogList()}</article>
        </section>
      </>
    );
  }
}

CashbackHistory.displayName = 'CashbackHistory';

CashbackHistory.propTypes = {
  isUserLogin: PropTypes.bool,
  isWebview: PropTypes.bool,
  consumerId: PropTypes.string,
  customerId: PropTypes.string,
  cashbackHistoryList: PropTypes.arrayOf(PropTypes.object),
  country: PropTypes.string,
  mounted: PropTypes.func,
  loadConsumerCustomerInfo: PropTypes.func,
  fetchCashbackHistoryList: PropTypes.func,
};

CashbackHistory.defaultProps = {
  isUserLogin: false,
  isWebview: false,
  consumerId: '',
  customerId: '',
  cashbackHistoryList: [],
  country: '',
  mounted: () => {},
  loadConsumerCustomerInfo: () => {},
  fetchCashbackHistoryList: () => {},
};

export default compose(
  withTranslation(['Cashback']),
  connect(
    state => ({
      isUserLogin: getIsUserLogin(state),
      isWebview: getIsWebview(state),
      consumerId: getConsumerId(state),
      country: getMerchantCountry(state),
      customerId: getCustomerId(state),
      cashbackHistoryList: getCashbackHistoryList(state),
    }),
    dispatch => ({
      mounted: bindActionCreators(mountedThunk, dispatch),
      loadConsumerCustomerInfo: bindActionCreators(loadConsumerCustomerInfoThunk, dispatch),
      fetchCashbackHistoryList: bindActionCreators(fetchCashbackHistoryListThunk, dispatch),
    })
  )
)(CashbackHistory);
