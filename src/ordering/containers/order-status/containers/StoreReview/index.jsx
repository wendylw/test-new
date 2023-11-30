import _get from 'lodash/get';
import React, { useCallback, useState, useEffect, useMemo } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { useLocation } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Info } from 'phosphor-react';
import TextareaAutosize from 'react-textarea-autosize';
import usePrefetch from '../../../../../common/utils/hooks/usePrefetch';
import Button from '../../../../../common/components/Button';
import PageFooter from '../../../../../common/components/PageFooter';
import PageHeader from '../../../../../common/components/PageHeader';
import CheckBox from '../../../../../common/components/CheckBox';
import Rating from '../../components/Rating';
import Hint from '../../../../../common/components/Hint';
import Tag from '../../../../../common/components/Tag';
import ThankYouModal from './components/ThankYouModal';
import WarningModal from './components/WarningModal';
import PageLoadingIndicator from './components/PageLoadingIndicator';
import SuccessToast from './components/SuccessToast';
import styles from './StoreReview.module.scss';
import StoreReviewImg from '../../../../../images/store-review.svg';
import {
  getStoreComment,
  getStoreFullDisplayName,
  getStoreRating,
  getStoreShippingType,
  getOffline,
  getHasStoreReviewed,
  getIsMerchantContactAllowable,
} from '../../redux/selector';
import { getOrderCreatedDate, getShouldShowBackButton } from './redux/selectors';
import { backButtonClicked, submitButtonClicked } from './redux/thunks';
import { STORE_REVIEW_SHIPPING_TYPES, STORE_REVIEW_COMMENT_CHAR_MAX } from './constants';

const StoreReview = () => {
  const dispatch = useDispatch();
  const { state: locationState } = useLocation();
  const selectedRating = _get(locationState, 'rating', 0);

  const { t } = useTranslation('OrderingThankYou');

  const offline = useSelector(getOffline);

  const storeHasReviewed = useSelector(getHasStoreReviewed);

  const storeName = useSelector(getStoreFullDisplayName);

  const shippingType = useSelector(getStoreShippingType);

  const storeRating = useSelector(getStoreRating);

  const allowContact = useSelector(getIsMerchantContactAllowable);

  const storeComment = useSelector(getStoreComment);

  const orderCreatedDate = useSelector(getOrderCreatedDate);

  const shouldShowBackButton = useSelector(getShouldShowBackButton);

  const [rating, setRating] = useState(selectedRating || storeRating);

  const [comments, setComments] = useState(storeComment);

  const [isContactAllowable, setIsContactAllowable] = useState(allowContact);

  const hasRated = useMemo(() => rating > 0, [rating]);

  const hasCommentCharLimitExceeded = useMemo(() => comments.length > STORE_REVIEW_COMMENT_CHAR_MAX, [comments]);

  const shouldDisableSubmitButton = useMemo(() => !hasRated || hasCommentCharLimitExceeded, [
    hasRated,
    hasCommentCharLimitExceeded,
  ]);

  const handleChangeComment = useCallback(event => setComments(event.target.value), [setComments]);

  const handleChangeRating = useCallback(val => setRating(val), [setRating]);

  const handleToggleContactConsent = useCallback(event => setIsContactAllowable(event.target.checked), [
    setIsContactAllowable,
  ]);

  const handleClickBackButton = useCallback(
    () => dispatch(backButtonClicked({ rating, comments, isMerchantContactAllowable: isContactAllowable })),
    [dispatch, rating, comments, isContactAllowable]
  );

  const handleClickSubmitButton = useCallback(
    () => dispatch(submitButtonClicked({ rating, comments, allowMerchantContact: isContactAllowable })),
    [dispatch, rating, comments, isContactAllowable]
  );

  useEffect(() => {
    // BEEP-3153: Only update the rating when it has value. Otherwise, the rating will be updated here accidentally even if we want to show the rating selected from the thank you page.
    if (storeRating) {
      setRating(storeRating);
    }
  }, [storeRating]);

  useEffect(() => {
    setComments(storeComment);
  }, [storeComment]);

  useEffect(() => {
    setIsContactAllowable(allowContact);
  }, [allowContact]);

  usePrefetch(['ORD_MNU', 'ORD_TY'], ['OrderingDelivery', 'OrderingThankYou']);

  return (
    <section>
      <PageHeader
        title={t('StoreReview')}
        onBackArrowClick={handleClickBackButton}
        isShowBackButton={shouldShowBackButton}
      />
      <div className="tw-flex tw-flex-col tw-justify-center tw-items-center">
        <img className={styles.StoreReviewContainerImg} src={StoreReviewImg} alt="Store Review" />
        <div className="tw-flex tw-justify-center tw-leading-normal">
          {storeHasReviewed ? t('AlreadyRated') : t('HearAboutExperience')}
        </div>
        <div className="tw-flex tw-justify-center tw-leading-normal tw-text-lg tw-text-center tw-font-bold tw-mb-8 sm:tw-mb-8px tw-mx-16 sm:tw-mx-16px">
          {storeName}
        </div>
        <div className="tw-flex tw-justify-center">
          {offline ? (
            <span className="tw-text-sm tw-text-gray-700">{orderCreatedDate}</span>
          ) : (
            <Tag className="tw-leading-loose" color="pink" radiusSize="xs">
              <span className="tw-text-orange tw-text-xs tw-font-bold">
                {t(STORE_REVIEW_SHIPPING_TYPES[shippingType.toLowerCase()])}
              </span>
            </Tag>
          )}
        </div>
      </div>

      <div className={`tw-my-24 sm:tw-my-24px ${storeHasReviewed ? styles.StoreReviewOpacity : ''}`}>
        <Rating
          initialStarNum={rating}
          onRatingChanged={storeHasReviewed ? () => {} : handleChangeRating}
          disableRatingChange={storeHasReviewed}
        />
      </div>

      {storeHasReviewed ? (
        (comments || '').length ? (
          <>
            <div className={`tw-flex tw-m-16 sm:tw-m-16px ${storeHasReviewed ? styles.StoreReviewOpacity : ''}`}>
              <TextareaAutosize
                className={`${styles.StoreReviewContainerTextareaInput} tw-border tw-border-solid tw-rounded-sm tw-border-gray-400`}
                minRows={4}
                value={comments}
                disabled={storeHasReviewed}
              />
            </div>
          </>
        ) : (
          <></>
        )
      ) : (
        <>
          <div className="tw-flex tw-justify-center">
            <Hint
              className="tw-h-28 sm:tw-h-28px"
              color="gray"
              radiusSize="sm"
              icon={
                <Info weight="light" size={16} className="tw-flex-shrink-0 tw-text-gray-700 tw-my-6 sm:tw-my-6px" />
              }
              content={t('ReviewNotPublic')}
            />
          </div>
          <div
            className={`tw-rounded-sm tw-m-16 sm:tw-m-16px tw-border tw-border-solid tw-overflow-hidden ${
              hasCommentCharLimitExceeded ? 'tw-border-red' : 'tw-border-gray-400'
            }`}
          >
            <div
              className={`${
                hasCommentCharLimitExceeded ? 'tw-border-red' : 'tw-border-gray-400'
              } tw-border tw-border-t-0 tw-border-l-0 tw-border-r-0 tw-border-solid tw-align-middle tw-font-bold tw-text-lg tw-leading-normal tw-py-8 sm:tw-py-8px tw-pl-12 sm:tw-pl-12px`}
            >
              {t('WriteReview')}
            </div>
            <div className="tw-flex">
              <TextareaAutosize
                className={`${styles.StoreReviewContainerTextareaInput} tw-border-0`}
                data-test-id="ordering.order-status.store-review.input"
                onChange={handleChangeComment}
                minRows={4}
                value={comments}
                placeholder={t('TellExperience')}
              />
            </div>
          </div>
          {hasCommentCharLimitExceeded && (
            <div className="tw-text-red tw-font-bold tw-m-12 sm:tw-m-12px tw-ml-16 sm:tw-ml-16px">
              {t('ExceedMaximum')}
            </div>
          )}
        </>
      )}

      <div
        className={`tw-flex tw-mx-16 sm:tw-mx-16px tw-mb-24 sm:tw-mb-24px ${
          storeHasReviewed ? styles.StoreReviewOpacity : ''
        }`}
      >
        <CheckBox
          size="small"
          className="tw-m-2 sm:tw-m-2px"
          data-test-id="ordering.order-status.store-review.checkbox"
          checked={isContactAllowable}
          onChange={handleToggleContactConsent}
          disabled={storeHasReviewed}
        />
        <span className="tw-ml-4 sm:tw-ml-4px tw-leading-loose">{t('AllowContact')}</span>
      </div>

      {!storeHasReviewed && (
        <PageFooter className="tw-shadow-xl">
          <div className={styles.StoreReviewFooter}>
            <Button
              block
              type="primary"
              disabled={shouldDisableSubmitButton}
              data-test-id="ordering.order-status.store-review.submit-btn"
              onClick={handleClickSubmitButton}
              className="tw-uppercase"
            >
              {t('Submit')}
            </Button>
          </div>
        </PageFooter>
      )}
      <SuccessToast />
      <PageLoadingIndicator />
      <ThankYouModal />
      <WarningModal />
    </section>
  );
};

StoreReview.displayName = 'StoreReview';

export default StoreReview;
