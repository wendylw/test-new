import { useState } from 'react';
import { useMeasure } from 'react-use';

const getElementPadding = element => {
  const { paddingTop, paddingRight, paddingBottom, paddingLeft } = window.getComputedStyle(element);
  return {
    paddingTop: parseInt(paddingTop, 10),
    paddingRight: parseInt(paddingRight, 10),
    paddingBottom: parseInt(paddingBottom, 10),
    paddingLeft: parseInt(paddingLeft, 10),
  };
};

const getElementBorderWidth = element => {
  const { borderTopWidth, borderRightWidth, borderBottomWidth, borderLeftWidth } = window.getComputedStyle(element);
  return {
    borderTop: parseInt(borderTopWidth, 10),
    borderRight: parseInt(borderRightWidth, 10),
    borderBottom: parseInt(borderBottomWidth, 10),
    borderLeft: parseInt(borderLeftWidth, 10),
  };
};

const useMeasureBorderBox = () => {
  const [ref, measure] = useMeasure();
  // This is a little bit tricky, I learn from the useMeasure hook.
  // At the outside, the element is using setRef as a ref setter, like <div ref={setRef} />,
  // but inside the hook, we don't use useRef, instead we use useState to track the element.
  // also we pass the ref to useMeasure with the same way (call ref function).
  const [element, setElement] = useState(null);
  const setRef = elem => {
    setElement(elem);
    ref(elem);
  };
  let style = {};
  if (element) {
    style = {
      ...getElementPadding(element),
      ...getElementBorderWidth(element),
    };
  } else {
    style = {
      paddingTop: 0,
      paddingRight: 0,
      paddingBottom: 0,
      paddingLeft: 0,
      borderTop: 0,
      borderRight: 0,
      borderBottom: 0,
      borderLeft: 0,
    };
  }
  measure.borderBoxHeight =
    measure.height + style.paddingTop + style.paddingBottom + style.borderTop + style.borderBottom;
  measure.borderBoxWidth =
    measure.width + style.paddingLeft + style.paddingRight + style.borderLeft + style.borderRight;

  return [setRef, measure];
};
export default useMeasureBorderBox;
