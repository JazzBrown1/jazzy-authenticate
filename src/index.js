
import { define, modify } from './setModel';
import authenticate from './authenticate';
import {
  login, logout, init, deserializeUser
} from './login';
import { checkLogged, checkNotLogged } from './checkLogged';

export {
  authenticate,
  define,
  modify,
  login,
  logout,
  init,
  checkLogged,
  checkNotLogged,
  deserializeUser
};
