
import { define, modify } from './setStrategy';
import authenticate from './authenticate';
import { login, logout, init } from './login';
import { checkLogged, checkNotLogged } from './checkLogged';

export {
  authenticate,
  define,
  define as setStrategy, // to be deprecated
  modify,
  login,
  logout,
  init,
  checkLogged,
  checkNotLogged
};
