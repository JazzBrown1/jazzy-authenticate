
const makeExtractor = (extract) => {
  if (typeof extract === 'function') return extract;
  return (req, done) => done(null, req[extract]);
};

export default makeExtractor;
