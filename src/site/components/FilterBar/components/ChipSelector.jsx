import React, { useMemo, useCallback } from 'react';
import PropTypes from 'prop-types';
import styles from './ChipSelector.module.scss';

const ChipSelector = ({ category, left, right, children, className, onClick }) => {
  const classNameList = [styles.ChipSelectorContainer, 'text-size-reset'];

  const clickHandler = useCallback(() => {
    onClick(category);
  }, [category, onClick]);

  const borderStyles = useMemo(
    () => ({
      boxShadow: category.selected ? 'inset 0px 0px 0px 2px #FF9419' : 'inset 0px 0px 0px 1px #DEDEDF',
    }),
    [category]
  );

  if (className) {
    classNameList.push(className);
  }

  return (
    <button
      className={classNameList.join(' ')}
      style={borderStyles}
      onClick={clickHandler}
      data-test-id="site.common.filter.category-btn"
    >
      <div className={styles.ChipSelectorSider}>{left}</div>
      <div className={styles.ChipSelectorContent}>{children}</div>
      <div className={styles.ChipSelectorSider}>{right}</div>
    </button>
  );
};

ChipSelector.displayName = 'ChipSelector';

ChipSelector.propTypes = {
  category: PropTypes.shape({
    id: PropTypes.string,
    name: PropTypes.string,
    type: PropTypes.string,
    selected: PropTypes.bool,
  }),
  left: PropTypes.node,
  right: PropTypes.node,
  children: PropTypes.node,
  className: PropTypes.string,
  onClick: PropTypes.func,
};

ChipSelector.defaultProps = {
  category: {},
  left: null,
  right: null,
  children: null,
  className: '',
  onClick: () => {},
};

export default ChipSelector;
