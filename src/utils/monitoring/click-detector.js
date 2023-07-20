import _isString from 'lodash/isString';
import _isEmpty from 'lodash/isEmpty';

window.addEventListener('click', e => {
  try {
    if (e.composedPath) {
      const trackPath = [];
      const content = e.target?.innerText || '';
      const path = e.composedPath() || [];

      const trimmedContent = content.length > 100 ? `${content.substr(0, 100)}...` : content;

      // eslint-disable-next-line no-plusplus
      for (let i = 0; i < path.length; i++) {
        const { className, tagName = 'notag' } = path[i];

        let trackPointName = null;
        if (path[i].getAttribute) {
          trackPointName = path[i].getAttribute('data-heap-name');
        }

        if (i === 0 || trackPointName) {
          let classNames = [];
          if (_isString(className) && !_isEmpty(className)) {
            classNames = className.split(' ');
          }

          let nodeTagClassList = [tagName.toLowerCase()];
          nodeTagClassList = nodeTagClassList.concat(classNames);
          const nodeTagClass = nodeTagClassList.join('.');
          const nodePathName = `${nodeTagClass}${trackPointName ? `#${trackPointName}` : ''}`;

          trackPath.push(nodePathName);
        } else {
          trackPath.push(tagName.toLowerCase());
        }

        if (trackPointName) {
          break;
        }
      }
      window.dispatchEvent(
        new CustomEvent('sh-click', {
          detail: {
            content: trimmedContent,
            trackPath,
          },
        })
      );
    }
  } catch (error) {
    // eslint-disable-next-line no-console
    console.log(error);
  }
});

export {};
