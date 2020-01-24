
const makeExtractor = (extract) => {
  if (typeof extract === 'function') return extract;
  return (req) => req[extract];
};

export default makeExtractor;
