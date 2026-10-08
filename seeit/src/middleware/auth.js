const jwt = require('jsonwebtoken');

function readToken(req) {
  const [scheme, token] = (req.headers.authorization || '').split(' ');
  return scheme === 'Bearer' && token ? token : null;
}

function verify(token) {
  const payload = jwt.verify(token, process.env.JWT_SECRET, { algorithms: ['HS256'] });
  return { id: Number(payload.sub) };
}

// Blocks the request unless a valid token is sent.
function requireAuth(req, res, next) {
  const token = readToken(req);
  if (!token) return res.status(401).json({ error: 'Log in to continue' });
  try {
    req.user = verify(token);
    next();
  } catch {
    res.status(401).json({ error: 'Your session expired. Log in again.' });
  }
}

// Lets anonymous visitors through, but identifies the user when a valid token is present.
function optionalAuth(req, _res, next) {
  const token = readToken(req);
  if (token) {
    try { req.user = verify(token); } catch { /* treat as anonymous */ }
  }
  next();
}

function signToken(user) {
  return jwt.sign({ name: user.name }, process.env.JWT_SECRET, {
    subject: String(user.id),
    expiresIn: process.env.JWT_EXPIRES_IN || '7d',
    algorithm: 'HS256',
  });
}

module.exports = { requireAuth, optionalAuth, signToken };
