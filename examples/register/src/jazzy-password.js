
import crypto from 'crypto';

const randStr = (length) => crypto.randomBytes(Math.ceil(length / 2))
  .toString('hex').slice(0, length);

const sha512 = (password, salt) => {
  const hash = crypto.createHmac('sha512', salt);
  hash.update(password);
  const value = hash.digest('hex');
  return value;
};
const hash = (password) => {
  const salt = randStr(16);
  return { hash: sha512(password, salt), salt };
};

// eslint-disable-next-line no-shadow
const check = (password, { hash, salt }) => sha512(password, salt) === hash;

export default { hash, check };
