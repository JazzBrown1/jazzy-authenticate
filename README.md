# Jazzy Authenticate
> Fast and versatile authentication middleware for ExpressJs.

[![Version][npm-version]][npm-url]
[![Dependencies][npm-dependencies]][npm-url]

Jazzy Authenticate is a flexible and dynamic authentication middleware for express.js. It has been designed to be easy to use, modular, unopinionated and take the complexities out of building authentication into server apps.

While Jazzy Authenticate aims to simplify and speed up the process of adding authentication layers to express apps, it also leaves all of the underlying logic up to the developer, allowing bespoke authentication models to be easily built without hacking the library or using workarounds.


## Installation


Ensure you have installed Express.js

```sh
$ npm install express
```

Install jazzy-authenticate

```sh
$ npm install jazzy-authenticate
```

## Usage


Use the define function to define an Authentication Model.

```sh
define(
  'password',
  {
    extract: 'body',
    getUser: (query, done) => db.findUserByUsername(query.username, done),
    verify: (query, user, done) => done(null, query.password === user.password)
  },
  true
);
```

The first arguement is the model name. The second the model options. And the third option is whether to set this model to default (meaning it will not have to be refernced in the middleware). If the thirs arguement is ommited it defaults to false.

Authentication Model Defaults:

```sh
{
  name: 'Model',
  useSessions: true,
  deserializeTactic: 'always',
  extract: 'body',
  clientType: 'user',
  selfInit: false,
  getUser: (query, done) => done(null, {}),
  verify: (query, user, done) => done(null, true),
  serialize: (user, done) => done(null, user),
  deserialize: (user, done) => done(null, user),
  initOnError: { status: 500 },
  initOnSuccess: null,
  authenticateOnError: { status: 500 },
  authenticateOnFail: { status: 401 },
  authenticateOnSuccess: null,
  checkAuthenticatedOnFail: { status: 401 },
  checkAuthenticatedOnSuccess: null,
  checkUnauthenticatedOnFail: { status: 401 },
  checkUnauthenticatedOnSuccess: null,
  logoutOnSuccess: null,
  deserializeUserOnError: { status: 500 },
  deserializeUserOnSuccess: null,
}
```

The init() middleware must be called at the start of the request straight after the session and parsing middleware.

```sh
app.use(json({ extended: false }));
app.use(urlencoded({ extended: true }));
app.use(
  session({
    secret: 'a very secret secret',
    resave: false,
    saveUninitialized: false
  }),
);

app.use(init());
```

Use the authenticate() middleware to authenticate a client.

```sh
app.use('/login', checkUnauthenticated(), authenticate(), (req, res) => {
  res.redirect('/home');
});

```

You can block routes by using the checkAuthenticated() or checkUnauthenticated() middleware.

```sh
app.use('/api/private/', checkAuthenticated(), privateApiRoutes);
```

Sometimes you may need different fail, error or success responses to those set in the Authentication Model, for example this api expects a json response.

```sh
const overrides = {
  onFail: { json: { error: 'You must be logged in to get the date' } },
  onError: { json: { error: 'Internal server error' } },
}
app.get('/api/private/', checkAuthenticated(overrides), privateApiRoutes);
```

You can use multiple authentication models in your app.

When you want to use a Model that is not set to default, pass the model name as the first argument to the middleware.

```sh
app.post(
  '/login',
  checkUnauthenticated('oauth-2'),
  authenticate('oauth-2', {
    onError:{ send: 'Error!' }
  }),
  (req, res) => {
    res.redirect('home');
  }
);

```

_For working examples and usage, please refer to the [examples section on project Github](https://github.com/JazzBrown1/jazzy-authenticate/tree/master/examples/)_


## Meta

Jazz Brown – jazzbrown200@gmail.com

Distributed under the MIT license. See ``LICENSE`` for more information.

[https://github.com/jazzbrown1/jazzy-authenticate](https://github.com/JazzBrown1/jazzy-authenticate)

## Contributing

1. Fork it (<https://github.com/jazzbrown1/jazzy-authenticate/fork>)
2. Create your feature branch (`git checkout -b feature/fooBar`)
3. Commit your changes (`git commit -am 'Add some fooBar'`)
4. Push to the branch (`git push origin feature/fooBar`)
5. Create a new Pull Request

<!-- Markdown link & img dfn's -->
[npm-version]: https://img.shields.io/npm/v/jazzy-authenticate
[npm-dependencies]: https://img.shields.io/david/jazzbrown1/jazzy-authenticate
[npm-downloads]: https://img.shields.io/npm/dm/jazzy-authenticate
[npm-url]: https://npmjs.org/jazzy-authenticate/
