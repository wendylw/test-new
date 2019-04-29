import React, { Component } from 'react';

const withResizeWindowBlocker = TheComponent =>
  class ResizeWindowBlocker extends Component {
    componentWillMount() {
      this.blockResize();
      this.blockRotation();
      this.blockZoomInOnSafariIOS();
    }

    blockResize() {
      const sizeInfo = [ window.width, window.height ];
      const onresize = window.onresize;

      window.onresize = function() {
        console.log('on resize');

        window.resizeTo(sizeInfo[0], sizeInfo[1]);

        if (typeof onresize === 'function') {
          onresize.apply(this, arguments);
        }
      }
    }

    blockZoomInOnSafariIOS() {
      document.addEventListener('touchmove', function(event) {
        event = event.originalEvent || event;
        if(event.scale > 1) {
            event.preventDefault();
        }
      }, false);
    }

    blockRotation() {
      // this is Deprecated may not work.
      // const { screen } = window;
      // screen.lockOrientationUniversal = screen.lockOrientation || screen.mozLockOrientation || screen.msLockOrientation;
      // Reference: https://developer.mozilla.org/en-US/docs/Web/API/Screen/lockOrientation
      // Reference #2: https://w3c.github.io/screen-orientation/#examples
      // TODO: find a way.
    }

    render() {
      const { children, ...props } = this.props;

      return (
        <TheComponent {...props}>{children}</TheComponent>
      );
    }
  }

export default withResizeWindowBlocker;
