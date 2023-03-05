import React, { useCallback } from 'react';
import PropTypes from 'prop-types';
import { useTranslation } from 'react-i18next';
import { useDispatch, useSelector } from 'react-redux';
import { useMount } from 'react-use';
import { getIsUserProfileStatusPending } from '../../redux/modules/app';
import { init } from './redux/thunk';
import { useBackButtonSupport } from '../../../utils/modal-back-button-support';
import ProfileRewardsImage from '../../../images/profile-rewards.svg';
import PageLoader from '../../../components/PageLoader';
import CleverTap from '../../../utils/clevertap';
import ProfileFooter from './ProfileFooter';
import ProfileFields from './ProfileFields';
import './Profile.scss';

const Profile = ({ show, onClose }) => {
  const { t } = useTranslation(['Profile']);
  const dispatch = useDispatch();
  const isUserProfileStatusPending = useSelector(getIsUserProfileStatusPending);
  const className = ['profile flex flex-column flex-end aside fixed-wrapper'];
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
    dispatch(init());
  });

  if (show) {
    className.push('active');
  }

  return (
    <aside className={className.join(' ')} data-heap-name="ordering.home.profile.container">
      <div className="profile__container flex flex-column flex-space-between aside__content">
        {isUserProfileStatusPending && show ? (
          <PageLoader />
        ) : (
          <>
            <section>
              <div className="text-right">
                <button
                  className="profile__skip-button button button__link flex__shrink-fixed padding-normal text-size-small text-weight-bolder"
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
            <ProfileFooter onCloseProfile={onClose} />
          </>
        )}
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
