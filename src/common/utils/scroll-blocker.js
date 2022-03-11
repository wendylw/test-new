import iNoBounce from 'inobounce';

iNoBounce.disable();

const { body, documentElement: html } = document;

// [START: Safari Document Scroll Blocker]
// This is to prevent the html from scrolling when there's fixed, fullscreen content on the front.
// The purpose of this is to prevent the address bar to be expanded / collapsed when we can fixed, fullscreen content,
// because we don't want the fullscreen content's height is changed due to the address bar expands / collapse.
// Inspired by https://pqina.nl/blog/how-to-prevent-scrolling-the-page-on-ios-safari/
// and https://github.com/lazd/iNoBounce
const shouldEnableDocumentScrollBlocker = (() => {
  const ua = navigator.userAgent.toLowerCase();
  const isSafari = ua.indexOf('safari') > -1 && ua.indexOf('chrome') < 0 && /ipad|iphone|ipod/.test(ua);
  if (!isSafari) return false;
  // this following code is to avoid enable the plugin on chrome's ios simulator
  // refer to: https://github.com/lazd/iNoBounce/blob/master/inobounce.js#L106
  const testDiv = document.createElement('div');
  document.documentElement.appendChild(testDiv);
  testDiv.style.WebkitOverflowScrolling = 'touch';
  const scrollSupport =
    'getComputedStyle' in window && window.getComputedStyle(testDiv)['-webkit-overflow-scrolling'] === 'touch';
  document.documentElement.removeChild(testDiv);
  return scrollSupport;
})();

const updateHtmlInnerHeightVar = () => html.style.setProperty('--window-inner-height', `${window.innerHeight}px`);

const updateDocumentScrollBlockerStyle = isAdd => {
  let styleElement = document.getElementById('safari-document-scroll-blocker-style');
  if (!styleElement) {
    styleElement = document.createElement('style');
    styleElement.id = 'safari-document-scroll-blocker-style';
    document.head.appendChild(styleElement);
  }
  if (isAdd) {
    updateHtmlInnerHeightVar();
    styleElement.innerHTML = `
      html.safari-document-scroll-block,
      html.safari-document-scroll-block body {
        height: var(--window-inner-height);
        overflow: hidden;
        box-sizing: border-box;
      }
  `;
  } else {
    styleElement.innerHTML = '';
  }
};

if (shouldEnableDocumentScrollBlocker) {
  window.addEventListener('resize', updateHtmlInnerHeightVar);
}

let bodyScrollTopBackup = 0;

// TODO: add some video to explain why each line is necessary (especially the iNoBounce)
const blockSafariDocumentScroll = () => {
  if (!shouldEnableDocumentScrollBlocker) return;
  // When overflow of html is set to hidden, the content will be scrolled to top.
  // So we will migrate the scrollTop to body.
  bodyScrollTopBackup = body.scrollTop;
  const htmlScrollTop = html.scrollTop;
  // Force the height of html to be equal to window.innerHeight.
  updateDocumentScrollBlockerStyle(true);
  html.classList.add('safari-document-scroll-block');
  // Disable pull-to-refresh to avoid the view floating;
  iNoBounce.enable();
  // Update scrollTop to body (this must be done after the class is added).
  body.scrollTop = htmlScrollTop;
};

const unblockSafariDocumentScroll = () => {
  if (!shouldEnableDocumentScrollBlocker) return;
  // restore all modifications in block()
  updateDocumentScrollBlockerStyle(false);
  html.classList.remove('safari-document-scroll-block');
  body.scrollTop = bodyScrollTopBackup;
  bodyScrollTopBackup = 0;
  iNoBounce.disable();
};
// [END: Safari Document Scroll Blocker]

// [START: Body Scroll Blocker]
// This is to prevent the body from scrolling when there's fixed, fullscreen content on the front.
// Inspired by: https://gist.github.com/reecelucas/2f510e6b8504008deaaa52732202d2da
const updateBodyScrollBlockerStyle = innerHTML => {
  let styleElement = document.getElementById('body-scroll-blocker-style');

  if (!styleElement) {
    styleElement = document.createElement('style');
    styleElement.id = 'body-scroll-blocker-style';
    document.head.appendChild(styleElement);
  }
  styleElement.innerHTML = innerHTML;
};

const blockBodyScroll = () => {
  const scrollBarWidth = window.innerWidth - html.clientWidth;
  const bodyPaddingRight = parseInt(window.getComputedStyle(body).getPropertyValue('padding-right'), 10) || 0;
  const offset = bodyPaddingRight + scrollBarWidth;
  updateBodyScrollBlockerStyle(`
    body { position: relative; overflow: hidden; padding-right: ${offset}px;}
    .body-scroll-block-fix {
      margin-left: -${offset / 2}px;
      margin-right: ${offset / 2}px;
    }
  `);
};

const unblockBodyScroll = () => {
  updateBodyScrollBlockerStyle('');
};
// [END: Body Scroll Blocker]

// prevent startFn to be called more than once before endFn is called.
const schedule = (startFn, endFn) => {
  const requesterSet = new Set();
  return {
    start: requesterId => {
      if (!requesterId) throw new Error('missing requesterId');

      const shouldExecute = requesterSet.size === 0;
      requesterSet.add(requesterId);
      if (shouldExecute) {
        startFn();
      }
    },
    end: requesterId => {
      if (!requesterId) throw new Error('missing requesterId');
      const prevSize = requesterSet.size;
      requesterSet.delete(requesterId);
      if (prevSize > 0 && requesterSet.size === 0) {
        endFn();
      }
    },
  };
};

// can export these functions if needed
const blockBodyScrollScheduler = schedule(blockBodyScroll, unblockBodyScroll);
const blockDocumentScrollScheduler = schedule(blockSafariDocumentScroll, unblockSafariDocumentScroll);

export const block = requesterId => {
  blockBodyScrollScheduler.start(requesterId);
  blockDocumentScrollScheduler.start(requesterId);
};

export const unblock = requesterId => {
  blockBodyScrollScheduler.end(requesterId);
  blockDocumentScrollScheduler.end(requesterId);
};
