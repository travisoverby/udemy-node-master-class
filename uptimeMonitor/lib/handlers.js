/*
 * These are the request handlers
 */
'use strict';

// Dependencies
const _data = require('./data');
const helpers = require('./helpers');
// Define the handlers
const handlers = {};

// Users
handlers.users = (data, callback) => {
  const acceptableMethods = ['post', 'get', 'put', 'delete'];
  if (acceptableMethods.includes(data.method)) {
    handlers._users[data.method](data, callback);
  } else {
    callback(405 + "method not allowed");
  }
};

// Container for the user's submethods
handlers._users = {};

// Users - post
// Required data: firstName, lastName, phone, password, tosAgreement
// Optional data: none
handlers._users.post = (data, callback) => {
  // Check that all required fields are filled out
  const firstName = typeof(data.payload.firstName) === 'string' && data.payload.firstName.trim().length > 0 ? data.payload.firstName.trim() : false;
  const lastName = typeof(data.payload.lastName) === 'string' && data.payload.lastName.trim().length > 0 ? data.payload.lastName.trim() : false;
  const phone = typeof(data.payload.phone) === 'string' && data.payload.phone.trim().length === 10 ? data.payload.phone.trim() : false;
  const password = typeof(data.payload.password) === 'string' && data.payload.password.trim().length > 0 ? data.payload.password.trim() : false;
  const tosAgreement = typeof(data.payload.tosAgreement) === 'boolean' && data.payload.tosAgreement === true ? true : false;
  
  if (firstName && lastName && phone && password && tosAgreement) {
    // Make sure that the user doesn't already exist
    _data.read('users', phone, (err, data) => {
      if (err) { // error reading non-existant file, so file is created
        // Hash the password
        const hashedPassword = helpers.hash(password);

        // Create the user object
        if (hashedPassword) {
          const userObject = {
            firstName : firstName,
            lastName : lastName,
            phone : phone,
            hashedPassword : hashedPassword,
            tosAgreement : true
          };

          // Store the user
          _data.create('users', phone, userObject, err => {
            if (!err) {
              callback(200);
            } else {
              callback(500, {'Error' : 'Could not create the new user'});
            }
          });
        } else {
          callback(500, {'Error' : "Could not hash the user's password"});
        }
      } else {
        // User already exists
        callback(400, {'Error' : 'A user with that phone number already exists'});
      }
    });
  } else {
    callback(400, {'Error' : 'Missing required fields'});
  }
};

// Users - get
// Required data: phone
// Optional data: none
// @TODO only let an authenticated user access their OWN object, not anyone else's
handlers._users.get = (data, callback) => {
  // Check that the phone number provided is valid
  const phone = typeof(data.queryStringObject.phone) === 'string' && data.queryStringObject.phone.trim().length === 10 ? data.queryStringObject.phone.trim() : false;

  if (phone) {
    // Lookup the user
    _data.read('users', phone, (err, data) => {
      if (!err && data) {
        // Remove the hashed password from the user object before returning it to the requestor
        delete data.hashedPassword;
        callback(200, data);
      } else {
        callback(400, {'Error' : "User does not exist"});
      }
    });
  } else {
    callback(400, {'Error' : "Missing required field"});
  }
};

// Users - put
// Required data: phone
// Optional data: firstName, lastName, password (at least one must be specified)
// @TODO only let an authenticated user update their own object, don't let them update anyone else's
handlers._users.put = (data, callback) => {
  // Check for the required field
  const phone = typeof(data.payload.phone) === 'string' && data.payload.phone.trim().length === 10 ? data.payload.phone.trim() : false;

  // Check for optional fields
  const firstName = typeof(data.payload.firstName) === 'string' && data.payload.firstName.trim().length > 0 ? data.payload.firstName.trim() : false;
  const lastName = typeof(data.payload.lastName) === 'string' && data.payload.lastName.trim().length > 0 ? data.payload.lastName.trim() : false;
  const password = typeof(data.payload.password) === 'string' && data.payload.password.trim().length > 0 ? data.payload.password.trim() : false;

  // Error if the phone is invalid, in all cases

  if (phone) {
    // Error if nothing is sent to update
    if (firstName || lastName || password) {
      //Lookup the user
      _data.read('users' , phone, (err, userData) => {
        // Update the fields necessary
        if (!err && userData) {
          // Update the fields necessary
          if (firstName) {
            userData.firstName = firstName;
          }

          if (lastName) {
            userData.lastName = lastName;
          }

          if (password) {
            userData.hashedPassword = helpers.hash(password);
          }

          // Store the new updates
          _data.update('users', phone, userData, err => {
            if (!err) {
              callback(200, {'Response' : "User was updated"});
            } else {
              console.log(err);
              callback(500, {'Error' : "Could not update the user"});
            }
          });
        } else {
          callback(400, {'Error' : 'The specified user does not exist'});
        }
      });
    } else {
      callback(400, {'Error' : 'Missing fields to update'});
    }
  } else {
    callback(400, {'Error' : "Missing required field"});
  }
};

// Users - delete
// Required field: phone
// @TODO Only let an authenticated user deete their object. Don't let them delete anyone else's.
// @TODO Cleanup (delete) any other data files associated with this user
handlers._users.delete = (data, callback) => {
  // Check that the phone number is valid
  const phone = typeof(data.queryStringObject.phone) === 'string' && data.queryStringObject.phone.trim().length === 10 ? data.queryStringObject.phone.trim() : false;

  if (phone) {
    // Look up the user  
    _data.read('users', phone, (err, data) => {
      if (!err && data) {
        _data.delete('users', phone, err => {
          if (!err) {
            callback(200, {'Response' : 'User was deleted'});
          } else {
            callback(500, {'Error' : 'Could not delete the specified user'});
          }
        });
      } else {
        callback(400, {'Error' : "Could not find the specified user"});
      }
    });
  } else {
    callback(400, {'Error' : "Missing required field"});
  }
};


// Tokens
handlers.tokens = (data, callback) => {
  const acceptableMethods = ['post', 'get', 'put', 'delete'];
  if (acceptableMethods.includes(data.method)) {
    handlers._tokens[data.method](data, callback);
  } else {
    callback(405 + "method not allowed");
  }
};

// Container for all the tokens methods
handlers._tokens = {};

// Tokens - post
// Required data: phone, password
// Optional data: none
handlers._tokens.post = (data, callback) => {
  const phone = typeof(data.payload.phone) === 'string' && data.payload.phone.trim().length === 10 ? data.payload.phone.trim() : false;
  const password = typeof(data.payload.password) === 'string' && data.payload.password.trim().length > 0 ? data.payload.password.trim() : false;

  if (phone && password) {
    // Lookup the user who matches that phone number
    _data.read('users', phone, (err, userData) => {
      if (!err && userData) {
        // Hash the send password, and compare it to the password stored in the user object
        const hashedPassword = helpers.hash(password);
        if (hashedPassword === userData.hashedPassword) {
          // If valid, create a new token with a random name. Set expiration date one hour in the future.
          const tokenId = helpers.createRandomString(20);
          const expires = Date.now() + (1000 * 60 * 60);

          const tokenObject = {
            'phone' : phone,
            'id' : tokenId,
            'expires' : expires
          };

          // Store the token
          _data.create('tokens', tokenId, tokenObject, err => {
            if (!err) {
              callback(200, tokenObject);
            } else {
              callback(500, {'Error' : 'Could not create the new token'});
            }
          });

        } else {
          callback(400, {'Error' : "Password did not match the specified user's stored password"});
        }
      } else {
        callback(400, {'Error' : 'Could not find the specified user'});
      }
    });
  } else {
    callback(400, {'Error' : 'Missing required field(s)'});
  }

};

// Tokens - get
// Required data: id
// Optional data: none
handlers._tokens.get = (data, callback) => {
  // Check that the id sent is valid
  const id = typeof(data.queryStringObject.id) === 'string' && data.queryStringObject.id.trim().length === 20 ? data.queryStringObject.id.trim() : false;

  if (id) {
    // Lookup the token
    _data.read('tokens', id, (err, tokenData) => {
      if (!err && tokenData) {
        // Remove the hashed password from the token object before returning it to the requestor
        delete tokenData.hashedPassword;
        callback(200, tokenData);
      } else {
        callback(404, {'Error' : "Token does not exist"});
      }
    });
  } else {
    callback(400, {'Error' : "Missing required field"});
  }
};

// Tokens - put
// Required fields: id, extend
// Optional data: none
handlers._tokens.put = (data, callback) => {
  const id = typeof(data.payload.id) === 'string' && data.payload.id.trim().length === 20 ? data.payload.id.trim() : false;
  const extend = typeof(data.payload.extend) === 'boolean' && data.payload.extend === true ? data.payload.extend : false;

  if (id && extend) {
    // Lookup the token
    _data.read('tokens', id, (err, tokenData) => {
      if (!err && tokenData) {
        // Check to make sure the token isn't already expired
        if (tokenData.expires > Date.now()) {
          // Set the expiration an hour from  now
          tokenData.expires = Date.now() + 1000 * 60 * 60;

          // Store the new updates
          _data.update('tokens', id, tokenData, err => {
            if (!err) {
              callback(200);
            } else {
              callback(500, {'Error' : 'Could not update the token\'s expiration'});
            }
          });
        } else {
          callback(400, {'Error' : 'The token has already expired and cannot be extended'});
        }
      } else {
        callback(400, {'Error' : 'Specified token does not exist'});
      }
    });
  } else {
    callback(400, {'Error' : 'Missing required field(s) or field(s) are invalid'});
  }
};

// Tokens - delete
// Required data: id
// Optional data: none
handlers._tokens.delete = (data, callback) => {
  // Check that the id is valid
  const id = typeof(data.queryStringObject.id) === 'string' && data.queryStringObject.id.trim().length === 20 ? data.queryStringObject.id.trim() : false;

  if (id) {
    // Look up the user  
    _data.read('tokens', id, (err, data) => {
      if (!err && data) {
        _data.delete('tokens', id, err => {
          if (!err) {
            callback(200, {'Response' : 'Token was deleted'});
          } else {
            callback(500, {'Error' : 'Could not delete the specified token'});
          }
        });
      } else {
        callback(400, {'Error' : "Could not find the specified token"});
      }
    });
  } else {
    callback(400, {'Error' : "Missing required field"});
  }
};

// Verify if a given token id is currently valid for a given user
handlers._tokens.verifyToken = (id, phone, callback) => {
  // Lookup the token
  _data.read('tokens', id, (err, tokenData) => {
    if (!err && tokenData) {
      // Check that the token is for the given user and has not expired
      if (tokenData.phone === phone && tokenData.expires > Date.now()) {
        callback(true);
      } else {
        callback(false);
      }
    } else {
      callback(false);
    }
  });
};

// Ping handler
handlers.ping = (data, callback) => {
  // Callback an http status code, and a payload object
  callback(200);
};

// Not found handler
handlers.notFound = (data, callback) => {
  callback(404);
};

// Export the module
module.exports = handlers;