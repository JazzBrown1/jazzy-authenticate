const clients = {
  user: {
    id: 'user',
    secret: 'password',
    someInfo: 'Is the only client',
    otherInfo: 'Is not even real :('
  }
};

const findClientById = (id, cb) => {
  if (!clients[id]) return cb(null, null);
  cb(null, clients[id]);
};

export { clients, findClientById };
