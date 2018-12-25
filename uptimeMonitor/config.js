'use strict';

/*
	Create and export configuration variables
*/

// Container for all the environments
const environments = {};

environments.development = {
  'httpPort' : 3000,
  'httpsPort' : 3001,
  'envName' : 'development'
};

// Staging  environment
environments.staging = {
	'httpPort' : 4000,
	'httpsPort' : 4001,
	'envName' : 'staging'
};

environments.production = {
	'httpPort' : 5000,
	'httpsPort' : 5001,
	'envName' : 'production'
};

// Determine which envionment was passed as a command-line argument
const currentEnvironment = typeof(process.env.NODE_ENV) === 'string' ? process.env.NODE_ENV.toLowerCase() : '';

// Check that current environment is one of the environments above, if not, default to staging

const environmentToExport = typeof(environments[currentEnvironment]) === 'object' ? environments[currentEnvironment] : environments.development;

// Export the module

module.exports = environmentToExport;
