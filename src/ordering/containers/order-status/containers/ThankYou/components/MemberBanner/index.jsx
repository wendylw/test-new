import React, { useCallback } from 'react';
import PropTypes from 'prop-types';
import { CaretRight } from 'phosphor-react';
import { useTranslation } from 'react-i18next';
import { MemberIcon } from '../../../../../../../common/components/Icons';
import './MemberBanner.scss';

const MemberBanner = ({ onJoinMembershipClick }) => {
  const { t } = useTranslation('OrderingThankYou');
  const clickHandler = useCallback(() => {
    onJoinMembershipClick();
  }, [onJoinMembershipClick]);

  return (
    <div className="card member-banner__card-wrapper margin-small">
      <button
        data-test-id="ordering.thank-you.member-banner.card-btn"
        className="member-banner__card-container flex flex-middle flex-space-between padding-top-bottom-small padding-left-right-normal"
        onClick={clickHandler}
      >
        <MemberIcon
          className="member-banner__card-icon"
          crownStartColor="#F3F3F3"
          crownEndColor="#F3F3F3"
          backgroundStartColor="#CCCCCC"
          backgroundEndColor="#CCCCCC"
        />
        <p className="member-banner__card-title text-center padding-left-right-small">{t('NewMemberInvitation')}</p>
        <CaretRight size={24} weight="light" color="white" />
      </button>
    </div>
  );
};

MemberBanner.displayName = 'MemberBanner';

MemberBanner.propTypes = {
  onJoinMembershipClick: PropTypes.func,
};

MemberBanner.defaultProps = {
  onJoinMembershipClick: () => {},
};

export default MemberBanner;
