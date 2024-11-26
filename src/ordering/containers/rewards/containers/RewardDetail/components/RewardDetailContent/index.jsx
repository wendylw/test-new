import React from 'react';
import { useTranslation } from 'react-i18next';
import { useSelector } from 'react-redux';
import { REWARDS_APPLIED_SOURCE_I18KEYS } from '../../../../../../../common/utils/rewards/constants';
import { getRewardDetailContentList } from '../../redux/selectors';
import Article from '../../../../../../../common/components/Article';
import styles from './RewardDetailContent.module.scss';

const RewardDetailContent = () => {
  const { t } = useTranslation(['OrderingPromotion']);
  const rewardDetailContentList = useSelector(getRewardDetailContentList);

  return rewardDetailContentList.map((contentItem, index) => {
    const { title, titleDescription, articleContentList } = contentItem;

    return (
      <section
        className={styles.RewardDetailContentArticleSection}
        // eslint-disable-next-line react/no-array-index-key
        key={`orderingRewardDetail-article-${index}`}
      >
        <Article
          title={title}
          titleDescription={titleDescription}
          articleContentList={
            articleContentList &&
            articleContentList.map(item => {
              const { subtitle, description, rewardDetailRedeemOnlineList } = item;
              const articleContent = { subtitle, description, content: null };

              if (rewardDetailRedeemOnlineList) {
                articleContent.content = (
                  <ul className={styles.RewardDetailHowToUseRedeemOnlineList}>
                    {rewardDetailRedeemOnlineList.map(redeemOnlineChannel => (
                      <li
                        key={`myRewardDetail-redeemOnlineChannel-${redeemOnlineChannel}`}
                        className={styles.RewardDetailHowToUseRedeemOnlineItem}
                      >
                        {t(REWARDS_APPLIED_SOURCE_I18KEYS[redeemOnlineChannel])}
                      </li>
                    ))}
                  </ul>
                );
              }

              return articleContent;
            })
          }
        />
      </section>
    );
  });
};

RewardDetailContent.displayName = 'RewardDetailContent';

export default RewardDetailContent;
