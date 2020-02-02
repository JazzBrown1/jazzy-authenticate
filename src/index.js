
import { define, modify } from './setModel';
import authenticate from './authenticate';
import {
  login, logout, init, deserializeUser
} from './login';
import { checkLogged, checkNotLogged } from './checkLogged';
import { checkAuthenticated, checkUnauthenticated } from './checkAuthenitcated';

export {
  authenticate,
  define,
  modify,
  logout,
  init,
  init as initiate,
  deserializeUser,
  checkAuthenticated,
  checkUnauthenticated,
  login, // deprecated with pass through and warning
  checkLogged, // to be deprecated
  checkNotLogged, // to be deprecated
};
