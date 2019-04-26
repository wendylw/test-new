/* eslint-disable jsx-a11y/anchor-is-valid */
/* eslint-disable jsx-a11y/anchor-has-content */
import React from 'react';

const observableContainer = {};

window.addEventListener('scroll', debounce((e) => {
  // TODO: send global event to tell which one is one the top of viewport
  const obs = Object.values(observableContainer);

  const [, ob] = obs
    .map(ob => [elementPartialOffsetTop(ob), ob])
    .sort(([k1], [k2]) => k1 - k2)
    .find(([k]) => k > 0) || [];

  if (!ob) {
    return;
  }
  
  console.debug(ob.getAttribute('scrollname'));

  document.dispatchEvent(new CustomEvent('SCROLL_FOUND_TOP', {
    detail: {
      scrollname: ob.getAttribute('scrollname'),
    },
  }));
}, 200));

// TODO: move into global library
function debounce(fn, timeout = 50) {
	let timer = null;
	return function newFn(...args) {
		if (timer) {
			clearTimeout(timer);
		}

		timer = setTimeout(() => fn.apply(fn, args), timeout);
	};
}

// TODO: move into global libary
// function elementPartialInViewport(el) {
//   var top = el.offsetTop;
//   var left = el.offsetLeft;
//   var width = el.offsetWidth;
//   var height = el.offsetHeight;

//   while(el.offsetParent) {
//     el = el.offsetParent;
//     top += el.offsetTop;
//     left += el.offsetLeft;
//   }

//   return (
//     top < (window.pageYOffset + window.innerHeight) &&
//     left < (window.pageXOffset + window.innerWidth) &&
//     (top + height) > window.pageYOffset &&
//     (left + width) > window.pageXOffset
//   );
// }

// TODO: move into global library
function elementPartialOffsetTop(el) {
  var top = el.offsetTop;
  var height = el.offsetHeight;

  while(el.offsetParent) {
    el = el.offsetParent;
    top += el.offsetTop;
  }

  return (top + height) - window.pageYOffset;
}


export class ScrollObservable extends React.Component {
  container = null;

  componentDidMount() {
    const { name } = this.props;

    if (observableContainer[name]) {
      console.error('Failed to register a scroll obvervable component, because name=%o is already existed.', name);
      return;
    }

    observableContainer[name] = this.container;
  }

  componentWillUnmount() {
    delete observableContainer[this.props.name];
  }

  render() {
    const { children, name } = this.props;

    return (
      <div ref={ref => this.container = ref} scrollname={name}>
        <a name={name}></a>
        {children}
      </div>
    );
  }
}

export class ScrollObserver extends React.Component {
  state = {
    scrollname: '',
  };

  handleScrollEvent = (e) => {
    const { scrollname } = e.detail;
    this.setState({ scrollname });
  };

  componentDidMount() {
    document.addEventListener('SCROLL_FOUND_TOP', this.handleScrollEvent);
  }

  componentWillUnmount() {
    document.removeEventListener('SCROLL_FOUND_TOP', this.handleScrollEvent);
  }

  render() {
    const { children, forName } = this.props;
    let elements = React.Children.toArray(children);

    // set new props to the first child
    elements = [
      React.cloneElement(elements[0], {
        className: [
          elements[0].className,
          forName === this.state.scrollname ? 'scroll-active' : '',
        ].join(' '),
      }),
      ...elements.slice(1),
    ]

    return (
      <div onClick={() => this.anchor.click()}>
        <a ref={ref => this.anchor = ref} href={`#${forName}`} />
        {elements}
      </div>
    );
  }
}
