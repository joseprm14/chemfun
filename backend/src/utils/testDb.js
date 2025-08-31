const { MongoMemoryServer } = require('mongodb-memory-server');
const mongoose = require('mongoose');


let mongod;


async function startInMemoryMongo() {
    mongod = await MongoMemoryServer.create();
    const uri = mongod.getUri();


    // Sobrescribe MONGO_URI ANTES de requerir app.js en cada suite
    process.env.MONGO_URI = uri;
    process.env.JWT_SECRET = process.env.JWT_SECRET || 'testing-secret';


    // Conexión la hace app.js al ser requerido, pero la forzamos aquí también
    // por si algún test importa modelos sueltos.
    if (mongoose.connection.readyState === 0) {
        await mongoose.connect(uri);
    }


    return uri;
}


async function stopInMemoryMongo() {
    await mongoose.connection.dropDatabase().catch(() => {});
    await mongoose.connection.close().catch(() => {});
    if (mongod) await mongod.stop();
}


async function clearCollections() {
    const collections = mongoose.connection.collections;
    for (const key of Object.keys(collections)) {
        await collections[key].deleteMany({});
    }
}


module.exports = { startInMemoryMongo, stopInMemoryMongo, clearCollections };