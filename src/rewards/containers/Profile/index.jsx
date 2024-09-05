import React, { useCallback, useEffect } from 'react';
import PropTypes from 'prop-types';
import { useTranslation } from 'react-i18next';
import { useUnmount } from 'react-use';
import { useDispatch } from 'react-redux';
import { init } from './redux/thunk';
import ProfileRewardsImage from '../../../images/profile-rewards.svg';
import { actions as profileActions } from './redux';
import CleverTap from '../../../utils/clevertap';
import Frame from '../../../common/components/Frame';
import ProfileFooter from './ProfileFooter';
import ProfileFields from './ProfileFields';
import './Profile.scss';

const Profile = ({ show, showSkipButton, onSave, onSkip }) => {
  const { t } = useTranslation(['Profile']);
  const dispatch = useDispatch();
  const className = ['profile flex flex-column flex-end aside fixed-wrapper active'];
  const onSkipButtonClick = useCallback(() => {
    CleverTap.pushEvent('Complete profile page - Click skip for now');
    onSkip();
    dispatch(profileActions.resetProfilePageData());
  }, [onSkip]);
  const onSaveButtonClick = useCallback(() => {
    onSave();
    dispatch(profileActions.resetProfilePageData());
  }, [onSave, dispatch]);

  useEffect(() => {
    if (show) {
      dispatch(init());
    }
  }, [dispatch, show]);

  if (!show) {
    return null;
  }

  return (
    <Frame>
      <aside className={className.join(' ')} data-test-id="ordering.profile.container">
        <div className="profile__container flex flex-column flex-space-between aside__content">
          <section>
            {showSkipButton && (
              <div className="text-right">
                <button
                  className="profile__skip-button button button__link flex__shrink-fixed padding-normal text-size-small text-weight-bolder"
                  data-test-id="ordering.profile.skip-btn"
                  onClick={onSkipButtonClick}
                >
                  {t('SkipForNow')}
                </button>
              </div>
            )}
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
                <h4 className="profile__tip-title text-weight-bolder">{t('UnlockRewards')}</h4>
                <p className="profile__tip">{t('UnlockMemberRewardsTip')}</p>
              </div>
            </div>
            <div className="padding-left-right-normal">
              <ProfileFields />
            </div>
          </section>
          <ProfileFooter onSave={onSaveButtonClick} />
        </div>
      </aside>
    </Frame>
  );
};

Profile.displayName = 'Profile';

Profile.propTypes = {
  show: PropTypes.bool,
  showSkipButton: PropTypes.bool,
  onSave: PropTypes.func,
  onSkip: PropTypes.func,
};

Profile.defaultProps = {
  show: false,
  showSkipButton: false,
  onSave: () => {},
  onSkip: () => {},
};

export default Profile;
