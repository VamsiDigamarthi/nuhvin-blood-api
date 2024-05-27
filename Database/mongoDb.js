import mongodb from "mongodb";
import "dotenv/config";
const ObjectId = mongodb.ObjectId;

const MongoClient = mongodb.MongoClient;

const mongoDbUrl = process.env.MONGODB_URL;

let _db;
const dbName = 'blood';
export const initDb = (callback) => {
  if (_db) {
    console.log("Database is already initialized");
    return callback(null, _db);
  }
  MongoClient.connect(mongoDbUrl)
    .then((client) => {
      _db = client.db(dbName);
      callback(null, _db);
    })
    .catch((err) => callback(err));
};

export const getDb = () => {
  if (!_db) {
    throw Error("Database not initialzed");
  }
  return _db;
};

// module.exports = {
//   initDb,
//   getDb,
// };
