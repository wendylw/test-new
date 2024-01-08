import React from 'react';
import PropTypes from 'prop-types';
// import { useTranslation } from 'react-i18next';
import { connect } from 'react-redux';
import { getHasUserJoinedBusinessMembership } from '../../../../../../redux/modules/app';
import './MemberCard.scss';

function MemberCard({ hasUserJoinedBusinessMembership }) {
  // const { t } = useTranslation('OrderingThankYou');

  return <section>{hasUserJoinedBusinessMembership ? <p>Existing Member Card</p> : <p>New Member Card</p>}</section>;
}

MemberCard.displayName = 'MemberCard';

MemberCard.propTypes = {
  hasUserJoinedBusinessMembership: PropTypes.bool,
};

MemberCard.defaultProps = {
  hasUserJoinedBusinessMembership: false,
};

export default connect(state => ({
  hasUserJoinedBusinessMembership: getHasUserJoinedBusinessMembership(state),
}))(MemberCard);
