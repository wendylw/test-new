import React, { useState, useCallback, useRef, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { useMount, useUnmount } from 'react-use';
import { useTranslation } from 'react-i18next';
import { Info } from 'phosphor-react';
import TextareaAutosize from 'react-textarea-autosize';
import Utils from '../../../../../utils/utils';
import Button from '../../../../../common/components/Button';
import HybridHeader from '../../../../../components/HybridHeader';
import CheckBox from '../../../../../common/components/CheckBox';
import Frame from '../../../../../common/components/Frame';
import Rating from '../../components/Rating';
import Hint from '../../../../../common/components/Hint';
import Tag from '../../../../../common/components/Tag';
import styles from './StoreReview.module.scss';
import StoreReviewImg from '../../../../../images/store-review.svg';
import { actions } from '../../redux/common';
import {
  getStoreComment,
  getStoreFullDisplayName,
  getStoreRating,
  getStoreShippingType,
  getHasStoreReviewed,
  getIsMerchantContactAllowable,
} from '../../redux/selector';
import { STORE_REVIEW_SHIPPING_TYPES } from '../../constants';
import { mounted, unmounted, backButtonClicked, submitButtonClicked } from './redux/thunks';

const StoreReview = () => {
  const dispatch = useDispatch();

  useMount(() => {
    dispatch(mounted());
  });

  useUnmount(() => {
    dispatch(unmounted());
  });

  useMount(() => {
    dispatch(mounted());
  });

  useUnmount(() => {
    dispatch(unmounted());
  });

  const headerEl = useRef(0);
  const footerEl = useRef(0);

  const { t, i18n } = useTranslation('OrderingThankYou');

  const storeHasReviewed = useSelector(getHasStoreReviewed);

  const storeName = useSelector(getStoreFullDisplayName);

  const shippingType = useSelector(getStoreShippingType);

  const rating = useSelector(getStoreRating);

  const allowContact = useSelector(getIsMerchantContactAllowable);

  // Depend on whether rated && whether exceed character limit
  const [submitButtonDisabled, setSubmitButtonDisabled] = useState(!rating);

  const [textExcess, setTextExcess] = useState(false);

  const reviewContents = useSelector(getStoreComment);
  const saveReview = useCallback(
    value => {
      dispatch(actions.updateStoreComment(value));
    },
    [dispatch]
  );
  const handleReviewChange = useCallback(
    event => {
      saveReview(event.target.value);
      if (event.target.value.length > 4050) {
        setTextExcess(true);
        setSubmitButtonDisabled(true);
      } else {
        setTextExcess(false);
        if (rating) {
          setSubmitButtonDisabled(false);
        }
      }
    },
    [rating, saveReview]
  );

  const contentAllowedChangeSubmitButtonDisabled = useCallback(() => {
    if ((reviewContents || '').length <= 4050) {
      setSubmitButtonDisabled(false);
    }
  }, [reviewContents]);

  const handleChangeRating = val => {
    dispatch(actions.updateStoreRating(val));
    // When review content length < 4050, if rate, enable Submit button.
    contentAllowedChangeSubmitButtonDisabled();
  };

  const [reviewContainerHeight, setReviewContainerHeight] = useState('100%');
  const calculateReviewContainerHeight = preContainerHeight => {
    const containerHeight = Utils.containerHeight({
      headerEls: [headerEl.current],
      footerEls: [footerEl.current],
    });

    if (preContainerHeight !== containerHeight) {
      setReviewContainerHeight(containerHeight);
    }
  };
  useEffect(() => {
    calculateReviewContainerHeight(reviewContainerHeight);
  });

  const handleClickBackButton = useCallback(() => dispatch(backButtonClicked()), [dispatch]);

  const handleClickSubmitButton = useCallback(() => dispatch(submitButtonClicked()), [dispatch]);

  return (
    <Frame>
      <section className="tw-h-screen">
        <HybridHeader
          headerRef={headerEl}
          className="flex-middle border__bottom-divider"
          contentClassName="flex-middle"
          isPage
          title={t('StoreReview')}
          navFunc={handleClickBackButton}
        />
        <div
          className={styles.StoreReviewContainer}
          style={{
            top: `${Utils.mainTop({
              headerEls: [headerEl],
            })}px`,
            height: reviewContainerHeight,
          }}
        >
          <img className={styles.StoreReviewContainerImg} src={StoreReviewImg} alt="Store Review" />
          <div className="tw-flex tw-justify-center tw-leading-normal">
            {storeHasReviewed ? t('AlreadyRated') : t('HearAboutExperience')}
          </div>
          <div className="tw-flex tw-justify-center tw-leading-normal tw-text-lg tw-font-bold tw-mb-8 sm:tw-mb-8px">
            {storeName}
          </div>
          <div className="tw-flex tw-justify-center">
            <Tag className="tw-leading-loose" color="pink" radiusSize="xs">
              <span className="tw-text-orange tw-text-xs tw-font-bold">
                {t(STORE_REVIEW_SHIPPING_TYPES[shippingType.toLowerCase()])}
              </span>
            </Tag>
          </div>
          <div className="tw-my-24 sm:tw-my-24px">
            <Rating initialStarNum={rating} onRatingChanged={handleChangeRating} />
          </div>
          {storeHasReviewed ? (
            (reviewContents || '').length ? (
              <>
                <div className="tw-flex tw-mx-16 sm:tw-mx-16px">
                  <TextareaAutosize
                    className={`${styles.StoreReviewContainerTextareaInput} tw-rounded-sm tw-border-gray-400`}
                    minRows={4}
                    value={reviewContents}
                  />
                </div>
              </>
            ) : (
              <></>
            )
          ) : (
            <>
              <div className="tw-flex tw-justify-center">
                <Hint className="tw-h-28 sm:tw-h-28px" color="gray" radiusSize="s" innerClassName="tw-flex">
                  <Info
                    weight="light"
                    size={16}
                    className="tw-flex-shrink-0 tw-text-gray-700 tw-my-6 sm:tw-my-6px tw-mx-2 sm:tw-mx-2px"
                  />
                  <span className={styles.StoreReviewContainerTagText}>{t('ReviewNotPublic')}</span>
                </Hint>
              </div>
              <div className="tw-border-gray-400 tw-mx-16 sm:tw-mx-16px tw-mt-16 sm:tw-mt-16px tw-border tw-border-b-0 tw-border-solid tw-rounded-t-sm tw-text-lg tw-font-bold tw-align-middle tw-leading-normal tw-py-4 sm:py-4px tw-pl-12 sm:tw-pl-12px">
                {t('WriteReview')}
              </div>
              <div className="tw-flex tw-mx-16 sm:tw-mx-16px">
                <TextareaAutosize
                  className={`${styles.StoreReviewContainerTextareaInput} tw-rounded-b-sm ${
                    textExcess ? 'tw-border-red' : 'tw-border-gray-400'
                  }`}
                  onChange={handleReviewChange}
                  minRows={4}
                  value={reviewContents}
                  placeholder={t('TellExperience')}
                />
              </div>
              {textExcess && (
                <div className="tw-text-red tw-font-bold tw-mt-12 sm:tw-mt-12px tw-ml-16 sm:tw-ml-16px">
                  {t('ExceedMaximum')}
                </div>
              )}
            </>
          )}

          <div className="tw-flex tw-mt-16 sm:tw-mt-16px tw-ml-16 sm:tw-ml-16px">
            <CheckBox
              size="medium"
              className="tw-my-2 sm:tw-my-2px"
              checked={allowContact}
              onChange={e => {
                dispatch(actions.updateIsMerchantContactAllowable(e.target.checked));
              }}
            />
            <span className="tw-ml-4 sm:tw-ml-4px tw-leading-loose">{t('AllowContact')}</span>
          </div>
        </div>
        <div className={styles.StoreReviewFooter} ref={footerEl}>
          <Button disabled={submitButtonDisabled} onClick={handleClickSubmitButton} className="tw-w-full tw-uppercase">
            {t('Submit')}
          </Button>
        </div>
      </section>
    </Frame>
  );
};

StoreReview.displayName = 'StoreReview';

export default StoreReview;
