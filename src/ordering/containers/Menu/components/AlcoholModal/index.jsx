import React, { useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useSelector, useDispatch } from 'react-redux';
import { withRouter } from 'react-router-dom';
import { actions } from './redux';
import {
  getShouldShowAlcoholModal,
  isLegalForAlcohol,
  getAlcoholModalVisibility,
  getConfirmNotLegal,
} from './redux/selectors';
import { acceptAlcoholConsent, getUserAlcoholConsent, confirmAlcoholDenied } from './redux/thunks';
import { getMerchantCountry, getStoreInfoForCleverTap } from '../../../../redux/modules/app';
import Button from '../../../../../common/components/Button';
import Modal from '../../../../../common/components/Modal';
import TermsAndPrivacy from '../../../../../components/TermsAndPrivacy';
import beepAlcoholImage from '../../../../../images/beep-alcohol-consent-new.png';
import styles from './AlcoholModal.module.scss';
import Clevertap from '../../../../../utils/clevertap';

const AlcoholModal = ({ history }) => {
  const dispatch = useDispatch();
  const { t } = useTranslation();
  const shouldModal = useSelector(getShouldShowAlcoholModal);
  const shouldShowAlcoholModal = useSelector(getAlcoholModalVisibility);
  const legalForAlcohol = useSelector(isLegalForAlcohol);
  const country = useSelector(getMerchantCountry);
  const confirmNotLegal = useSelector(getConfirmNotLegal);
  const storeInfoForCleverTap = useSelector(getStoreInfoForCleverTap);

  useEffect(() => {
    if (!legalForAlcohol) {
      dispatch(getUserAlcoholConsent());
    }
  }, [dispatch, legalForAlcohol]);

  useEffect(() => {
    if (shouldShowAlcoholModal) {
      Clevertap.pushEvent('Menu Page - Alcohol Consent - Pop up', storeInfoForCleverTap);
    }
    // push clevertap event only when shouldShowAlcoholModal changes
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [shouldShowAlcoholModal]);

  useEffect(() => {
    if (shouldModal) {
      dispatch(actions.setAlcoholModalVisibility(true));
    }
  }, [dispatch, shouldModal]);

  const handleClick = value => {
    if (value) {
      Clevertap.pushEvent('Menu Page - Alcohol Consent - Click yes', storeInfoForCleverTap);
      dispatch(acceptAlcoholConsent());
      dispatch(actions.setAlcoholModalVisibility(false));
    } else {
      Clevertap.pushEvent('Menu Page - Alcohol Consent - Click no', storeInfoForCleverTap);
      dispatch(actions.setConfirmNotLegal(true));
    }
  };

  return (
    <Modal
      onClose={() => dispatch(actions.setConfirmNotLegal(true))}
      show={shouldShowAlcoholModal}
      className={styles.AlcoholContainer}
      disableBackButtonSupport
    >
      {!confirmNotLegal ? (
        <>
          <div className={styles.AlcoholImage}>
            <img src={beepAlcoholImage} alt="Beep alcohol" />
          </div>
          <h2 className={styles.AlcoholDesTitle}>{t('CheckIfDrinkingAge')}</h2>
          <p className={styles.AlcoholDes}>
            <span>
              {country === 'MY' && t('AlcoholLimitationsMY')}
              {country === 'PH' && t('AlcoholLimitationsPH')}
            </span>
          </p>

          <div className={styles.AlcoholButton}>
            <Button
              block
              type="secondary"
              className={styles.AlcoholCloseButton}
              data-testid="noIamNot"
              data-test-id="ordering.home.confirm.reject"
              onClick={() => handleClick(false)}
            >
              {t('AlcoholNo')}
            </Button>
            <Button
              block
              type="primary"
              className={styles.AlcoholOkButton}
              data-testid="yesIam"
              data-test-id="ordering.home.confirm.accept"
              onClick={() => handleClick(true)}
            >
              {t('AlcoholYes')}
            </Button>
          </div>
          <p className={styles.AlcoholDesEnd}>
            <TermsAndPrivacy buttonLinkClassName="tw-text-sm tw-text-blue tw-leading-normal" />
          </p>
        </>
      ) : (
        <>
          <div className={styles.AlcoholImage}>
            <img src={beepAlcoholImage} alt="Beep alcohol" />
          </div>
          <h2 className={styles.AlcoholDesTitleDenied}>{t('AlcoholDenied')}</h2>
          <p className={styles.AlcoholDesDenied}>{t('AlcoholNotAllowed')}</p>
          <div className={styles.AlcoholButton}>
            <Button
              block
              type="primary"
              className={styles.AlcoholDeniedButton}
              data-test-id="ordering.home.confirm.got"
              onClick={() => dispatch(confirmAlcoholDenied(history))}
            >
              {t('GotItQr')}
            </Button>
          </div>
        </>
      )}
    </Modal>
  );
};

AlcoholModal.displayName = 'AlcoholModal';

export default withRouter(AlcoholModal);
