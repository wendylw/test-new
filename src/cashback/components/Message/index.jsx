import React from 'react';
import { connect } from 'react-redux';
import { bindActionCreators, compose } from 'redux';
import { withTranslation } from 'react-i18next';
import PropTypes from 'prop-types';
import { getMerchantClaimCashbackCountPerDay } from '../../../redux/modules/merchant/selectors';
import { actions as commonActionsCreator } from '../../redux/modules/common';
import { getMessageInfo } from '../../redux/modules/common/selectors';
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

  componentDidUpdate() {
    this.initMessages();
  }

  getMessage() {
    const { messageInfo } = this.props;
    const { key, message } = messageInfo || {};

    if (!key) {
      return message;
    }

    return this.MESSAGES[key] || this.MESSAGES.Default;
  }

  initMessages() {
    const { claimCashbackCountPerDay, t } = this.props;
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
      NotClaimed_ReachLimit: t('NotClaimedReachLimit', { claimCashbackCountPerDay }),
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

  render() {
    const { commonActions, messageInfo } = this.props;
    const { show, key, message } = messageInfo || {};

    if (!show || (!key && !message)) {
      return null;
    }

    return EARNED_STATUS.includes(key) ? (
      <ClaimedMessage isFirstTime={key === 'Claimed_FirstTime'} hideMessage={() => commonActions.messageInfoHide()} />
    ) : (
      <TopMessage
        className={ERROR_STATUS.includes(key) ? MESSAGE_TYPES.ERROR : MESSAGE_TYPES.PRIMARY}
        hideMessage={() => commonActions.messageInfoHide()}
        message={key ? this.MESSAGES[key] || this.MESSAGES.Default : message}
      />
    );
  }
}

Message.displayName = 'Message';

Message.propTypes = {
  messageInfo: PropTypes.shape({
    show: PropTypes.bool,
    key: PropTypes.string,
    message: PropTypes.string,
  }),
  claimCashbackCountPerDay: PropTypes.number,
  commonActions: PropTypes.shape({
    messageInfoHide: PropTypes.func,
  }),
};

Message.defaultProps = {
  messageInfo: {
    show: false,
    key: null,
    message: null,
  },
  claimCashbackCountPerDay: 0,
  commonActions: {
    messageInfoHide: () => {},
  },
};

export default compose(
  withTranslation('Common'),
  connect(
    state => ({
      messageInfo: getMessageInfo(state),
      claimCashbackCountPerDay: getMerchantClaimCashbackCountPerDay(state),
    }),
    dispatch => ({
      commonActions: bindActionCreators(commonActionsCreator, dispatch),
    })
  )
)(Message);
