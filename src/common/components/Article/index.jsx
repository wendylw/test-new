import React from 'react';
import PropTypes from 'prop-types';
import styles from './Article.module.scss';

const Article = ({ title, titleDescription, articleContentList }) => (
  <article className={styles.Article}>
    <h2 className={styles.ArticleTitle}>{title}</h2>
    {titleDescription && <p className={styles.ArticleTitleDescription}>{titleDescription}</p>}
    {articleContentList.map(({ subtitle, description, content }) => (
      <div className={styles.ArticleContentItem}>
        {subtitle && <h3 className={styles.ArticleSubtitle}>{subtitle}</h3>}
        {description && <p className={styles.ArticleDescription}>{description}</p>}
        {content}
      </div>
    ))}
  </article>
);

Article.propTypes = {
  title: PropTypes.string,
  titleDescription: PropTypes.string,
  articleContentList: PropTypes.arrayOf(
    PropTypes.shape({
      subtitle: PropTypes.string,
      description: PropTypes.string,
      content: PropTypes.node,
    })
  ),
};

Article.defaultProps = {
  title: '',
  titleDescription: null,
  articleContentList: [],
};

Article.displayName = 'Article';

export default Article;
