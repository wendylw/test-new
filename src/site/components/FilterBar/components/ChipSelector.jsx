import React, { useMemo, useCallback } from 'react';
import PropTypes from 'prop-types';
import { CaretDown, FunnelSimple } from 'phosphor-react';
import styles from './ChipSelector.module.scss';

const DISPLAY_ICONS = {
  FUNNEL_SIMPLE: 'FunnelSimple',
  CARET_DOWN: 'CaretDown',
};

const ChipSelector = ({ category, className, onClick }) => {
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
      data-heap-name="site.common.filter.category-btn"
    >
      {category.displayInfo.icons.includes(DISPLAY_ICONS.FUNNEL_SIMPLE) && <FunnelSimple size={16} weight="light" />}
      <span className={styles.ChipSelectorContent}>{category.displayInfo.name}</span>
      {category.displayInfo.icons.includes(DISPLAY_ICONS.CARET_DOWN) && (
        <CaretDown size={16} weight="light" className="tw-text-gray-600" />
      )}
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
    displayInfo: PropTypes.shape({
      name: PropTypes.string,
      icons: PropTypes.arrayOf(PropTypes.string),
    }),
  }),
  className: PropTypes.string,
  onClick: PropTypes.func,
};

ChipSelector.defaultProps = {
  category: {},
  className: '',
  onClick: () => {},
};

export default ChipSelector;
