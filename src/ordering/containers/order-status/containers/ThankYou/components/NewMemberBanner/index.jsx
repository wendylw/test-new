import React from 'react';
import { useTranslation } from 'react-i18next';
import { ObjectFitImage } from '../../../../../../../common/components/Image';
import MembershipLevelIcon from '../../../../../../../images/membership-level.svg';
import './NewMemberBanner.scss';

const NewMemberBanner = () => {
  const { t } = useTranslation('OrderingThankYou');

  return (
    <section className="card new-member-banner__card-wrapper margin-small">
      <div className="new-member-banner__card-container flex flex-middle flex-space-between padding-top-bottom-small padding-left-right-normal">
        <div className="new-member-banner__card-icon">
          <ObjectFitImage noCompression src={MembershipLevelIcon} alt="StoreHub New Member Icon" />
        </div>
        <p className="new-member-banner__card-title text-left padding-left-right-small">{t('NewMemberBannerTitle')}</p>
      </div>
    </section>
  );
};

NewMemberBanner.displayName = 'NewMemberBanner';

export default NewMemberBanner;
