/*
 * Library for storing and editing data
 */

'use strict';


// Dependencies
const fs = require('fs');
const path = require('path');

// Container for the module (to be exported)
const lib = {};

// Base directory of the data folder
lib.baseDir = path.join(__dirname, '/../.data/');

// Write data to a file
lib.create = (dir, file, data, callback) => {
	// Open the file for writing
	const filePath = lib.baseDir + dir + '/' + file + '.json';

	fs.open(filePath, 'wx', (err, fileDescriptor) => {
		if (!err && fileDescriptor) {
			// Convert data to a string
			let stringData = JSON.stringify(data);

			// Write to file and close it
			fs.writeFile(fileDescriptor, stringData, err => {
				if (!err) {

					fs.close(fileDescriptor, err => {
						if (!err) {
							callback(false);
						} else {
							callback('Error closing new file');
						}
					});

				} else {
					callback('Error writing to new file');
				}
			});

		} else {
			callback('Could not create new file, it may already exist!');
		}
	});
};

// Read data from a file
lib.read = (dir, file, callback) => {
	const filePath = lib.baseDir + dir + '/' + file + '.json';
	fs.readFile(filePath, 'utf8', (err, data) => {
		callback(err, data);
	});
};


// Update data inside a file
lib.update = (dir, file, data, callback) => {
	const filePath = lib.baseDir + dir + '/' + file + '.json';

	fs.open(filePath, 'r+', (err, fileDescriptor) => {
		if (!err && fileDescriptor) {
			const stringData = JSON.stringify(data);

			// Truncate the file
			fs.ftruncate(fileDescriptor, err => {
				if (!err) {
					// Write to the file and close it
					fs.writeFile(fileDescriptor, stringData, (err) => {
						if (!err) {
							fs.close(fileDescriptor, err => {
								if (!err) {
									callback(false);
								} else {
									callback("Error closing existing file");
								}
							});
						} else {
							callback("Error writing to existing file")
						}
					})
				} else {
					callback("Error truncating file");
				}
			})
		} else {
			callback('Could not open the file for updating');
		}
	});
};

// Delete a file
lib.delete = (dir, file, callback) => {
	// Unlink the file from file system
	const filePath = lib.baseDir + dir + '/' + file + '.json';
	fs.unlink(filePath, err => {
		if (!err) {
			callback(false);
		} else {
			callback("Error deleting file");
		}
	});
}

module.exports = lib;