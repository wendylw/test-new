import React, { useCallback, useRef } from 'react';
import { createPortal } from 'react-dom';
import PropTypes from 'prop-types';
import { CSSTransition } from 'react-transition-group';
import FullScreenFrame from '../FullScreenFrame';
import { useBackButtonSupport } from '../../../utils/modal-back-button-support';
import { useSpaceOccupation } from '../SpaceOccupationContext';
import styles from './Drawer.module.scss';
import './drawer-animation.scss';
import useScrollBlock from '../../utils/hooks/useScrollBlock';

const Drawer = props => {
  const {
    children,
    header,
    show,
    className = '',
    childrenClassName = '',
    style = {},
    onClose,
    animation = true,
    fullScreen = false,
    respectSpaceOccupation,
    mountAtRoot = true,
    zIndex = 100,
    onHistoryBackCompleted = () => {},
    disableBackButtonSupport = false,
    onShown = () => {},
    onHidden = () => {},
  } = props;
  const ref = useRef(null);
  const onHistoryBackReceived = useCallback(() => {
    onClose();
    return true;
  }, [onClose]);
  const onHistoryChangeCompleted = useCallback(
    visibility => {
      if (!visibility) {
        onHistoryBackCompleted();
      }
    },
    [onHistoryBackCompleted]
  );
  useBackButtonSupport({
    visibility: show,
    onHistoryBackReceived,
    onHistoryChangeCompleted,
    disabled: disableBackButtonSupport,
  });
  useScrollBlock(show);

  const onBackdropClick = useCallback(
    e => {
      if (show && e.target === ref.current) {
        onClose && onClose();
      }
    },
    [show, onClose]
  );

  let { bottom } = useSpaceOccupation();

  if (!respectSpaceOccupation) {
    bottom = 0;
  }

  const drawerContent = (
    <FullScreenFrame className="drawer-animation" zIndex={zIndex}>
      {/* eslint-disable-next-line jsx-a11y/no-static-element-interactions */}
      <div
        className={`drawer-animation__backdrop ${styles.backdrop}`}
        style={{ top: 0, bottom }}
        onClick={onBackdropClick}
        ref={ref}
      >
        <div
          className={`drawer-animation__content ${styles.container} ${className}`}
          // the drawer always has some distance to the top if fullScreen is false, for beautiful look (not confirmed with designer)
          style={{ ...(fullScreen ? { height: '100%' } : { maxHeight: '90%' }), ...style }}
        >
          {header}
          <div className={`drawer-animation__children tw-flex-1 tw-overflow-auto ${childrenClassName}`}>{children}</div>
        </div>
      </div>
    </FullScreenFrame>
  );

  let renderContent = null;

  if (!animation) {
    renderContent = show ? drawerContent : null;
    // return show ? drawerContent : null;
  } else {
    renderContent = (
      <CSSTransition
        in={show}
        timeout={300}
        unmountOnExit
        classNames="drawer-animation"
        onEntered={onShown}
        onExited={onHidden}
      >
        {drawerContent}
      </CSSTransition>
    );
  }

  if (mountAtRoot) {
    return createPortal(renderContent, document.getElementById('modal-mount-point'));
  }
  return renderContent;
};

Drawer.displayName = 'Drawer';

Drawer.propTypes = {
  /* The content of the drawer */
  children: PropTypes.node,
  /* The header of the drawer, won't scroll with the main content */
  header: PropTypes.node,
  /* Whether the drawer is shown */
  show: PropTypes.bool,
  /* The class name of outer container */
  className: PropTypes.string,
  /* The class name of inner container */
  childrenClassName: PropTypes.string,
  /* The style of outer container */
  // eslint-disable-next-line react/forbid-prop-types
  style: PropTypes.object,
  /* The callback when the use touch the backdrop */
  onClose: PropTypes.func,
  /* Whether show and hide with animation. `true` by default */
  animation: PropTypes.bool,
  /* Whether support animation. If animation is `true` to trigger function hidden drawer */
  /* PS: If other animations will be triggered hidden drawer, we recommend to use this instead of next animation in onHistoryBackCompleted  */
  onHidden: PropTypes.func,
  /* Whether support animation. If animation is `true` to trigger function shown drawer */
  /* PS: If other animations will be triggered shown drawer, multiple animations will effect each other with css-transition in Safari  */
  onShown: PropTypes.func,
  /* Whether force the height to be same as the screen, even if the content is not long enough */
  fullScreen: PropTypes.bool,
  /* Whether covers the footer */
  respectSpaceOccupation: PropTypes.bool,
  /* z-index style that is set on the outermost DOM node */
  zIndex: PropTypes.number,
  /* Whether mount the component at a common portal at the root. `true` by default */
  mountAtRoot: PropTypes.bool,
  /* Whether history back finished on close, used it if you have some operation on history or body scroll */
  /* PS: If os > iOS16 && animation is `true` safari cancel next animation of CSSTransition. Please use onHidden */
  onHistoryBackCompleted: PropTypes.func,
  /* Disable back button support. Please be noted that DON'T change it after the component is already mounted */
  disableBackButtonSupport: PropTypes.bool,
};

Drawer.defaultProps = {
  children: null,
  header: null,
  show: false,
  className: '',
  childrenClassName: '',
  style: {},
  onClose: () => {},
  animation: true,
  onShown: () => {},
  onHidden: () => {},
  fullScreen: false,
  respectSpaceOccupation: false,
  zIndex: 100,
  mountAtRoot: true,
  onHistoryBackCompleted: () => {},
  disableBackButtonSupport: false,
};

export default Drawer;
