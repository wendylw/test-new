/* eslint-disable jsx-a11y/anchor-is-valid */
/* eslint-disable jsx-a11y/anchor-has-content */
import React from 'react';
import Utils from '../../libs/utils';

const observableContainer = {};

function scrollTo(scrollname) {
  document.querySelector(`[scrollname=${scrollname}]`).scrollIntoView({behavior: "smooth"});
}

window.addEventListener('scroll', (e) => {
  const obs = Object.values(observableContainer);

  const [, ob] = obs
    .map(ob => [Utils.elementPartialOffsetTop(ob), ob])
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
});

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
    const { render } = this.props;

    if (typeof render === 'function') {
      return render(this.state.scrollname, scrollTo);
    }

    return null;
  }
}
