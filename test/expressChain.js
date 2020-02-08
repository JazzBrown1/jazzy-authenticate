/* eslint-disable no-plusplus */

// to enable deep level flatten use recursion with reduce and concat
function flatDeep(arr, d = 1) {
  return d > 0 ? arr.reduce((acc, val) => acc.concat(Array.isArray(val) ? flatDeep(val, d - 1) : val), [])
    : arr.slice();
}

const expressChain = (input) => {
  if (typeof input === 'function') return input;
  if (!Array.isArray(input)) throw new Error('must be function or array');
  const arr = flatDeep(input, Infinity);
  return (req, res, done) => {
    let index = 0;
    const next = () => {
      if (index < arr.length) {
        arr[index++](req, res, next);
      } else done(req, res);
    };
    next();
  };
};

module.exports = expressChain;
