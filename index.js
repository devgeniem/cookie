/*!
 * cookie
 * Copyright(c) 2012-2014 Roman Shtylman
 * MIT Licensed
 */

/**
 * Module exports.
 * @public
 */

exports.parse = parse;
exports.serialize = serialize;

/**
 * Module variables.
 * @private
 */

var decode = decodeURIComponent;
var encode = encodeURIComponent;
var RE_SEP = /; */;

/**
 * Parse a cookie header.
 *
 * Parse the given cookie header string into an object
 * The object has the various cookies as keys(names) => values
 *
 * @param {string} str
 * @param {object} [options]
 * @return {string}
 * @public
 */

function parse(str, options) {
  var pairs = str.split(RE_SEP),
      dec = (options && options.decode) || decode,
      obj = {},
      pair,
      key,
      val,
      eq;

  for (var i = 0, len = pairs.length; i < len; ++i) {
    pair = pairs[i];
    eq = pair.indexOf('=');

    if (~eq) {
      key = pair.substring(0, eq);
      val = pair.substring(++eq);

      if (val[0] === '"')
        val = val.slice(1, -1);

      if (obj[key] === undefined) {
        if (~val.indexOf('%'))
          obj[key] = tryDecode(val, dec);
        else
          obj[key] = val;
      }
    }
  }

  return obj;
}

/**
 * Serialize data into a cookie header.
 *
 * Serialize the a name value pair into a cookie string suitable for
 * http headers. An optional options object specified cookie parameters.
 *
 * serialize('foo', 'bar', { httpOnly: true })
 *   => "foo=bar; httpOnly"
 *
 * @param {string} name
 * @param {string} val
 * @param {object} [options]
 * @return {string}
 * @public
 */

function serialize(name, val, options) {
  var enc = (options && options.encode) || encode,
      ret,
      val;

  ret = name;
  ret += '=';
  ret += enc(val);

  if (options) {
    if (options.maxAge != null) {
      var maxAge = options.maxAge - 0;
      if (isNaN(maxAge))
        throw new Error('maxAge should be a Number');
      ret += '; Max-Age=';
      ret += maxAge;
    }
    if (val = options.domain) {
      ret += '; Domain=';
      ret += val;
    }
    if (val = options.path) {
      ret += '; Path=';
      ret += val;
    }
    if (val = options.expires) {
      ret += '; Expires=';
      ret += val.toUTCString();
    }
    if (options.httpOnly)
      ret += '; HttpOnly';
    if (options.secure)
      ret += '; Secure';
  }

  return ret;
}

/**
 * Try decoding a string using a decoding function.
 *
 * @param {string} str
 * @param {function} decode
 * @private
 */

function tryDecode(str, decode) {
  try {
    return decode(str);
  } catch (e) {
    return str;
  }
}
