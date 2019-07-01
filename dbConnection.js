const MongoClient = require('mongodb').MongoClient;
const ObjectID = require('mongodb').ObjectID;
const dbName = "mongo-db";

const mongodbOptions = { useNewUrlParser: true };

const url = "mongodb://localhost:27017";

const state = {
	db: null
}

const getPrimaryKey = (_id) => {
	return ObjectID(_id);
}

const connect = (cb) => {
	if (state.db) {
		cb();
	} else {
		//Connect To Mongodb
		MongoClient.connect(url, mongodbOptions, (err, db) => {
			if (err) {
				cb(err);
			} else {
				state.db = db.db(dbName);
				cb();
			}
		});
	}
}

const getDB = () => {
	return state.db;
}


module.exports = { getPrimaryKey, getDB, connect };