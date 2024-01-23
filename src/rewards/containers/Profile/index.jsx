import React, { useCallback, useMemo, useEffect } from 'react';
import PropTypes from 'prop-types';
import { useTranslation } from 'react-i18next';
import { useDispatch, useSelector } from 'react-redux';
import { useMount } from 'react-use';
import { init, callNativeProfile } from './redux/thunk';
import ProfileRewardsImage from '../../../images/profile-rewards.svg';
import { actions as profileActions } from './redux';
import { getShouldShowSkipButton } from './redux/selectors';
import { getIsWebview } from '../../redux/modules/common/selectors';
import CleverTap from '../../../utils/clevertap';
import Frame from '../../../common/components/Frame';
import ProfileFooter from './ProfileFooter';
import ProfileFields from './ProfileFields';
import './Profile.scss';

const WebProfile = ({ show, onSave, onSkip }) => {
  const { t } = useTranslation(['Profile']);
  const dispatch = useDispatch();
  const shouldShowSkipButton = useSelector(getShouldShowSkipButton);
  const className = ['profile flex flex-column flex-end aside fixed-wrapper active'];
  const onSkipButtonClick = useCallback(() => {
    CleverTap.pushEvent('Complete profile page - Click skip for now');
    onSkip();
  }, [onSkip]);
  const onSaveButtonClick = useCallback(() => {
    onSave();
    dispatch(profileActions.resetProfilePageData());
  }, [onSave, dispatch]);

  useMount(() => {
    dispatch(init());
  });

  if (!show) {
    return null;
  }

  return (
    <Frame>
      <aside className={className.join(' ')} data-test-id="ordering.profile.container">
        <div className="profile__container flex flex-column flex-space-between aside__content">
          <section>
            {shouldShowSkipButton && (
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
                <h4 className="profile__tip-title text-weight-bolder">{t('GetRewarded')}</h4>
                <p className="profile__tip">{t('CompleteProfileTip')}</p>
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

WebProfile.displayName = 'WebProfile';

WebProfile.propTypes = {
  show: PropTypes.bool,
  onSave: PropTypes.func,
  onSkip: PropTypes.func,
};

WebProfile.defaultProps = {
  show: false,
  onSave: () => {},
  onSkip: () => {},
};

const Profile = ({ show, onSave, onSkip }) => {
  const dispatch = useDispatch();
  const isWebview = useSelector(getIsWebview);
  const shouldShowNativeProfile = useMemo(() => show && isWebview, [show, isWebview]);

  useEffect(() => {
    if (shouldShowNativeProfile) {
      dispatch(callNativeProfile({ saveCallback: onSave, skipCallback: onSkip }));
    }
  }, [shouldShowNativeProfile, onSave, onSkip, dispatch]);

  if (shouldShowNativeProfile) {
    return null;
  }

  return <WebProfile show={show} onSkip={onSkip} onSave={onSave} />;
};

Profile.displayName = 'Profile';

Profile.propTypes = {
  show: PropTypes.bool,
  onSave: PropTypes.func,
  onSkip: PropTypes.func,
};

Profile.defaultProps = {
  show: false,
  onSave: () => {},
  onSkip: () => {},
};

export default Profile;
