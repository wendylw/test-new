import React, { useCallback } from 'react';
import PropTypes from 'prop-types';
import { CaretRight } from 'phosphor-react';
import { useTranslation, Trans } from 'react-i18next';
import { connect } from 'react-redux';
import { getCashback, getShouldShowEarnedCashback } from '../../redux/selector';
import { getMerchantDisplayName } from '../../../../../../../redux/modules/merchant/selectors';
import {
  getCustomerTierLevelName,
  getMemberCardStyles,
  getMemberCardIconColors,
} from '../../../../../../redux/modules/app';
import CurrencyNumber from '../../../../../../components/CurrencyNumber';
import { Image } from '../../../../../../../common/components/Image';
import { MemberIcon } from '../../../../../../../common/components/Icons';
import EarnedCashbackIcon from '../../../../../../../images/rewards-earned-cashback.svg';
import './MemberCard.scss';

const MemberCard = ({
  cashback,
  merchantDisplayName,
  customerTierLevelName,
  memberCardStyles,
  memberCardIconColors,
  shouldShowEarnedCashback,
  onViewMembershipDetailClick,
}) => {
  const { t } = useTranslation('OrderingThankYou');
  const clickHandler = useCallback(() => {
    onViewMembershipDetailClick();
  }, [onViewMembershipDetailClick]);
  const { crownStartColor, crownEndColor, backgroundStartColor, backgroundEndColor } = memberCardIconColors;

  return (
    <div className="member-card__card-wrapper margin-small border-radius-base">
      <button
        data-test-id="ordering.thank-you.member-card"
        className="member-card__card-container flex flex__fluid-content flex-column flex-space-between"
        style={memberCardStyles}
        onClick={clickHandler}
      >
        <h1 className="member-card__card-header padding-normal text-left text-omit__single-line">
          {merchantDisplayName}
        </h1>
        <div className="member-card__card-content flex flex-middle flex-end padding-top-bottom-normal padding-left-right-small">
          <span className="member-card__card-content__member-level padding-left-right-small text-capitalize text-omit__multiple-line">
            {customerTierLevelName}
          </span>
          <MemberIcon
            className="margin-left-right-small flex__shrink-fixed"
            crownStartColor={crownStartColor}
            crownEndColor={crownEndColor}
            backgroundStartColor={backgroundStartColor}
            backgroundEndColor={backgroundEndColor}
          />
        </div>
        <div className="member-card__card-footer flex flex-middle flex-space-between padding-top-bottom-smaller padding-left-right-normal">
          <i className="member-card__card-footer__cashback-icon flex__shrink-fixed">
            <Image className="tw-m-4 sm:tw-m-4px" noCompression src={EarnedCashbackIcon} alt="StoreHub Cashback" />
          </i>
          {shouldShowEarnedCashback && (
            <p className="member-card__card-footer__cashback-title text-left padding-left-right-smaller">
              <Trans i18nKey="EarnedCashback">
                You’ve earned
                <CurrencyNumber className="text-weight-bolder padding-left-right-smaller" money={cashback} />
                <span className="text-weight-bolder">Cashback</span>
              </Trans>
            </p>
          )}
          <div className="member-card__card-footer__cashback-slot flex flex-middle flex__shrink-fixed">
            <span>{shouldShowEarnedCashback ? t('View') : t('ViewRewards')}</span>
            <CaretRight size={24} weight="light" />
          </div>
        </div>
      </button>
    </div>
  );
};

MemberCard.displayName = 'MemberCard';

MemberCard.propTypes = {
  cashback: PropTypes.number,
  merchantDisplayName: PropTypes.string,
  customerTierLevelName: PropTypes.string,
  memberCardStyles: PropTypes.shape({
    color: PropTypes.string,
    background: PropTypes.string,
  }),
  memberCardIconColors: PropTypes.shape({
    crownStartColor: PropTypes.string,
    crownEndColor: PropTypes.string,
    backgroundStartColor: PropTypes.string,
    backgroundEndColor: PropTypes.string,
  }),
  shouldShowEarnedCashback: PropTypes.bool,
  onViewMembershipDetailClick: PropTypes.func,
};

MemberCard.defaultProps = {
  cashback: 0,
  merchantDisplayName: '',
  customerTierLevelName: '',
  memberCardStyles: {
    color: '',
    background: '',
  },
  memberCardIconColors: {
    crownStartColor: '',
    crownEndColor: '',
    backgroundStartColor: '',
    backgroundEndColor: '',
  },
  shouldShowEarnedCashback: false,
  onViewMembershipDetailClick: () => {},
};

export default connect(state => ({
  cashback: getCashback(state),
  merchantDisplayName: getMerchantDisplayName(state),
  customerTierLevelName: getCustomerTierLevelName(state),
  memberCardIconColors: getMemberCardIconColors(state),
  memberCardStyles: getMemberCardStyles(state),
  shouldShowEarnedCashback: getShouldShowEarnedCashback(state),
}))(MemberCard);
