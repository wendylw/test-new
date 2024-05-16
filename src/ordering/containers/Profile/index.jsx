import React, { useCallback } from 'react';
import PropTypes from 'prop-types';
import { useTranslation } from 'react-i18next';
import { useDispatch } from 'react-redux';
import { useMount } from 'react-use';
import { init } from './redux/thunk';
import { useBackButtonSupport } from '../../../utils/modal-back-button-support';
import ProfileRewardsImage from '../../../images/profile-rewards.svg';
import { actions as profileActions } from './redux';
import CleverTap from '../../../utils/clevertap';
import ProfileFooter from './ProfileFooter';
import ProfileFields from './ProfileFields';
import './Profile.scss';

const Profile = ({ show, onClose }) => {
  const { t } = useTranslation(['Profile']);
  const dispatch = useDispatch();
  const className = ['profile flex flex-column flex-end aside fixed-wrapper active'];
  const onSkipProfilePage = useCallback(() => {
    CleverTap.pushEvent('Complete profile page - Click skip for now');
    onClose();
  }, [onClose]);
  const onHistoryBackReceived = useCallback(() => {
    onClose();
    return true;
  }, [onClose]);

  useBackButtonSupport({
    visibility: show,
    onHistoryBackReceived,
  });

  useMount(() => {
    CleverTap.pushEvent('Complete Profile Page - View Page');

    dispatch(init());
  });

  if (!show) {
    return null;
  }

  return (
    <aside className={className.join(' ')} data-test-id="ordering.profile.container">
      <div className="profile__container flex flex-column flex-space-between aside__content">
        <section>
          <div className="text-right">
            <button
              className="profile__skip-button button button__link flex__shrink-fixed padding-normal text-size-small text-weight-bolder"
              data-test-id="ordering.profile.skip-btn"
              onClick={onSkipProfilePage}
            >
              {t('SkipForNow')}
            </button>
          </div>
          <h2 className="profile__title margin-top-bottom-small margin-left-right-normal text-size-huge text-weight-bolder">
            {t('CompleteProfile')}
          </h2>
          <div className="profile__tip-container margin-top-bottom-normal margin-left-right-normal flex flex-top padding-small border-radius-large">
            <img
              className="profile__tip-reward-image padding-smaller"
              src={ProfileRewardsImage}
              alt="StoreHub profile rewards"
            />
            <div className="padding-smaller">
              <h4 className="profile__tip-title text-weight-bolder">{t('GetRewarded')}</h4>
              <p className="profile__tip">{t('CompleteProfileTip')}</p>
            </div>
          </div>
          <div className="padding-left-right-normal">
            <ProfileFields />
          </div>
        </section>
        <ProfileFooter
          onCloseProfile={() => {
            onClose();
            dispatch(profileActions.resetProfilePageData());
          }}
        />
      </div>
    </aside>
  );
};

Profile.displayName = 'Profile';

Profile.propTypes = {
  show: PropTypes.bool,
  onClose: PropTypes.func,
};

Profile.defaultProps = {
  show: false,
  onClose: () => {},
};

export default Profile;
