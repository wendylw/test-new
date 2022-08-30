import { useRef } from 'react';

const useRefInitializer = initializer => {
  const ref = useRef(null);
  const initiated = useRef(false);
  if (!initiated.current) {
    ref.current = initializer();
    initiated.current = true;
  }
  return ref;
};

export default useRefInitializer;
