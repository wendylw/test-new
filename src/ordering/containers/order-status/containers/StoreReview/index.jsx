import React, { useState, useCallback, useRef, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { useMount } from 'react-use';
import { useTranslation } from 'react-i18next';
import { Info } from 'phosphor-react';
import TextareaAutosize from 'react-textarea-autosize';
import Utils from '../../../../../utils/utils';
import PageFooter from '../../../../../common/components/PageFooter';
import Button from '../../../../../common/components/Button';
import HybridHeader from '../../../../../components/HybridHeader';
import CheckBox from '../../../../../common/components/CheckBox';
import Frame from '../../../../../common/components/Frame';
import Rating from '../../components/Rating';
import Tag from '../../../../../common/components/Tag';
import './StoreReview.scss';
import StoreReviewImg from '../../../../../images/store-review.svg';
import { actions } from '../../redux/common';
import { getStoreComment, getStoreName, getStoreRating } from '../../redux/selector';

const StoreReview = () => {
  useMount(() => {});

  const dispatch = useDispatch();

  const headerEl = useRef(0);
  const footerEl = useRef(0);

  const [cartContainerHeight, setCartContainerHeight] = useState('100%');

  const { t, i18n } = useTranslation('OrderingThankYou');

  const storeName = useSelector(getStoreName);

  const [review, setReview] = useState('');
  const saveReview = () => {
    dispatch(actions.updateAndSaveComments(review));
  };
  const reviewContents = useSelector(getStoreComment);
  const handleReviewChange = useCallback(
    event => {
      setReview(event.target.value);
    },
    [setReview]
  );

  useEffect(() => {
    setReview(reviewContents);
  }, [reviewContents]);

  const initialRating = useSelector(getStoreRating);

  const calculateCartContainerHeight = preContainerHeight => {
    const containerHeight = Utils.containerHeight({
      headerEls: [headerEl.current],
      footerEls: [footerEl.current],
    });
    console.log('containerHeight:', containerHeight);

    if (preContainerHeight !== containerHeight) {
      setCartContainerHeight(containerHeight);
    }
  };

  useEffect(() => {
    calculateCartContainerHeight(cartContainerHeight);
  });

  const handleClick = () => {
    saveReview();
  };

  return (
    <Frame>
      <section className="store-review">
        <HybridHeader
          headerRef={headerEl}
          className="flex-middle border__bottom-divider"
          contentClassName="flex-middle"
          isPage
          title={t('StoreReview')}
        />
        <div
          className="store-review__container"
          style={{
            top: `${Utils.mainTop({
              headerEls: [headerEl],
            })}px`,
            height: cartContainerHeight,
          }}
        >
          <img className="store-review__container-img sm:tw-my-16px tw-my-16" src={StoreReviewImg} alt="Store Review" />
          <div className="store-review__container-hear tw-leading-normal">{t('HearAboutExperience')}</div>
          <div className="store-review__container-hear tw-leading-normal tw-text-lg tw-font-bold tw-mb-8 sm:tw-mb-8px">
            {storeName}
          </div>
          <div className="store-review__container-tag">
            <Tag className="tw-leading-loose" color="pink" radiusSize="xs">
              <span className="tw-text-orange tw-text-xs tw-font-bold">{t('DineIn')}</span>
            </Tag>
          </div>
          <div className="tw-my-24 sm:tw-my-24px">
            <Rating
              initialStarNum={initialRating}
              onRatingChanged={rating => {
                dispatch(actions.updateAndSaveRating(rating));
              }}
            />
          </div>
          <div className="store-review__container-tag">
            <Tag className="tw-h-28 sm:tw-h-28px" color="gray" radiusSize="xs" innerClassName="tw-flex">
              <Info
                weight="light"
                size={16}
                className="tw-flex-shrink-0 tw-text-gray-700 tw-my-6 sm:tw-my-6px tw-mx-2 sm:tw-mx-2px"
              />
              <span className="store-review__container-tag-text tw-text-gray-700 tw-text-sm">
                {t('ReviewNotPublic')}
              </span>
            </Tag>
          </div>
          <div className="store-review__container-textarea-title tw-mx-16 sm:tw-mx-16px tw-mt-16 sm:tw-mt-16px tw-border tw-border-solid tw-rounded-t-sm tw-text-lg tw-font-bold tw-align-middle tw-leading-normal tw-py-4 sm:py-4px tw-pl-12 sm:tw-pl-12px">
            {t('WriteReview')}
          </div>
          <div className="store-review__container-textarea tw-flex tw-mx-16 sm:tw-mx-16px">
            <TextareaAutosize
              className="store-review__container-textarea-input tw-w-full tw-mb-16 sm:tw-mb-16px tw-border tw-border-t-0 tw-border-solid tw-rounded-b-sm tw-p-12 sm:tw-p-12px tw-overflow-hidden"
              onChange={handleReviewChange}
              minRows={4}
              value={review}
              placeholder={t('TellExperience')}
            />
          </div>
          <div className="store-review__container-allow tw-ml-16 sm:tw-ml-16px">
            <CheckBox />
            <span className="tw-ml-4 sm:tw-ml-4px tw-leading-relaxed">{t('AllowContact')}</span>
          </div>
        </div>
        <div className="store-review__footer tw-flex tw-p-8 sm:tw-p-8px" ref={footerEl}>
          <Button
            // disabled={isSaveButtonDisabled}
            // loading={isSaveButtonLoaderVisible}
            onClick={handleClick}
            className="tw-w-full tw-uppercase"
          >
            {t('Submit')}
          </Button>
        </div>
      </section>
    </Frame>
  );
};

StoreReview.displayName = 'StoreReview';

export default StoreReview;
