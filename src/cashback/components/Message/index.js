import React from 'react';
import { connect } from 'react-redux';
import { bindActionCreators, compose } from 'redux';
import { withTranslation } from 'react-i18next';
import { actions as appActionCreators, getBusiness, getMessageInfo } from '../../redux/modules/app';
import { getBusinessByName } from '../../../redux/modules/entities/businesses';
import TopMessage from '../TopMessage';
import ClaimedMessage from '../ClaimedMessage';

const MESSAGE_TYPES = {
  PRIMARY: 'primary',
  ERROR: 'error',
};

const ERROR_STATUS = ['NotClaimed_Cancelled'];
const EARNED_STATUS = ['Claimed_FirstTime', 'Claimed_NotFirstTime'];

class Message extends React.Component {
  MESSAGES = {};
  animationSetTimeout = null;

  state = {
    modalStatus: [''],
  };

  componentDidUpdate() {
    this.initMessages();
  }

  initMessages() {
    const { businessInfo, t } = this.props;
    const { claimCashbackCountPerDay } = businessInfo || {};
    const messages = {
      Default: t('DefaultMessage'),
      /* get Cash Back messages */
      Invalid: t('InvalidMessage'),
      /* save Cash Back messages */
      Claimed_FirstTime: {
        title: t('ClaimedFirstTimeTitle'),
        description: t('ClaimedFirstTimeDescription'),
      },
      Claimed_NotFirstTime: {
        title: t('ClaimedNotFirstTimeTitle'),
      },
      Claimed_Processing: t('ClaimedProcessing'),
      Claimed_Someone_Else: t('ClaimedSomeoneElse'),
      Claimed_Repeat: t('ClaimedRepeat'),
      NotClaimed: t('NotClaimed'),
      NotClaimed_Expired: t('NotClaimedExpired'),
      NotClaimed_Cancelled: t('NotClaimedCancelled'),
      NotClaimed_ReachLimit: t('NotClaimedReachLimit', { claimCashbackCountPerDay: claimCashbackCountPerDay || 0 }),
      NotClaimed_ReachMerchantLimit: t('NotClaimedReachMerchantLimit'),
      /* set Otp */
      NotSent_OTP: t('NotSentOTP'),
      /* verify phone */
      Save_Cashback_Failed: t('SaveCashbackFailed'),
      /* Activity */
      Activity_Incorrect: t('ActivityIncorrect'),
    };

    this.MESSAGES = messages;
  }

  getMessage() {
    const { messageInfo } = this.props;
    const { key, message } = messageInfo || {};

    if (!key) {
      return message;
    }

    return this.MESSAGES[key] || this.MESSAGES.Default;
  }

  render() {
    const { appActions, messageInfo } = this.props;
    const { show, key, message } = messageInfo || {};

    if (!show || (!key && !message)) {
      return null;
    }

    return EARNED_STATUS.includes(key) ? (
      <ClaimedMessage isFirstTime={key === 'Claimed_FirstTime'} hideMessage={() => appActions.hideMessageInfo()} />
    ) : (
      <TopMessage
        className={ERROR_STATUS.includes(key) ? MESSAGE_TYPES.ERROR : MESSAGE_TYPES.PRIMARY}
        hideMessage={() => appActions.hideMessageInfo()}
        message={key ? this.MESSAGES[key] || this.MESSAGES.Default : message}
      />
    );
  }
}

export default compose(
  withTranslation('Common'),
  connect(
    state => {
      const business = getBusiness(state) || '';

      return {
        messageInfo: getMessageInfo(state),
        businessInfo: getBusinessByName(state, business),
      };
    },
    dispatch => ({
      appActions: bindActionCreators(appActionCreators, dispatch),
    })
  )
)(Message);
