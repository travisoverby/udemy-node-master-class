'use strict';

/*
	Create and export configuration variables
*/

// Container for all the environments
const environments = {};

// Staging (default) environment
environments.staging = {
	'port' : 3000,
	'envName' : 'staging'
};

environments.production = {
	'port' : 5000,
	'envName' : 'production'
};

// Determine which envionment was passed as a command-line argument
const currentEnvironment = typeof(process.env.NODE_ENV) === 'string' ? process.env.NODE_ENV.toLowerCase() : '';

// Check that current environment is one of the environments above, if not, default to staging

const environmentToExport = typeof(environments[currentEnvironment]) === 'object' ? environments[currentEnvironment] : environments.staging;

// Export the module

module.exports = environmentToExport;
