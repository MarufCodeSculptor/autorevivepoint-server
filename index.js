const express = require('express');
const cors = require('cors');
const jwt = require('jsonwebtoken');
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
require('dotenv').config();

const app = express();

const port = process.env.PORT || 5000;

// midleweres
app.use(cors());
app.use(express.json());

const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster1.6mzg5rv.mongodb.net/?retryWrites=true&w=majority&appName=Cluster1`;

// Create a MongoClient with a MongoClientOptions object to set the Stable API version
const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  },
});

async function run() {
  try {
    // Connect the client to the server	(optional starting in v4.7)
    await client.connect();

    const servicesCollection = client
      .db('autoRevivePoint')
      .collection('services');
    const bookingsCollection = client
      .db('autoRevivePoint')
      .collection('bookings');
//  posting  loggedin users => 
  app.post('/user',async (req,res)=>{
      const user = req.body;
      var token = jwt.sign(user,'secret',{expiresIn:'1h'});
      console.log('this is the fucken tocken ',token);
      res.send(token)
    })
     
     
    // getting all data
    app.get('/services', async (req, res) => {
      console.log('services hited');
      const cursor = servicesCollection.find({});
      const result = await cursor.toArray();
      res.send(result);
    });
    // getting single data
    app.get('/services/:id', async (req, res) => {
      console.log(`getting data by id hitted`);
      const id = req.params.id;
      const query = { _id: new ObjectId(id) };
      const option = {
        projection: { title: 1, price: 1, service_id: 1, img: 1 },
      };
      const result = await servicesCollection.findOne(query, option);
      res.send(result);
    });
    // posting single data to  bookingsCollection
    app.post('/bookings', async (req, res) => {
      const data = req.body;
      console.log(data, `posting hitted`);
      const result = await bookingsCollection.insertOne(data);
      res.send(result);
    });
    // getting bookings  all =>
    app.get('/bookings', async (req, res) => {
      let log = `getting booking data hitted`;

      let query = {};
      if (req.query?.email) {
        query = { email: req.query?.email };
        log = `getting booking data by email hitted`;
      }
      const result = await bookingsCollection.find(query).toArray();
      res.send(result);
      console.log(log);
    });
    // deleting data by id = >
    app.delete('/bookings/:id', async (req, res) => {
      console.log(`delete route hitted  ID:-${req.params.id}`);
      const id = req.params.id;
      const query = { _id: new ObjectId(id) };
      const result = await bookingsCollection.deleteOne(query);
      res.send(result);
    });
    // Updating booking state =>

    app.patch('/bookings/:id', async (req, res) => {
      const updateData = req.body;
      console.log(
        `patch hitted id is is ${req.params.id}  and data is  `,
        updateData
      );
      const filter = { _id: new ObjectId(req.params.id) };
      const updateDoc = { $set: { status: updateData } };

      const result = await bookingsCollection.updateOne(filter, updateDoc);
      res.send(result);
    });
    // Send a ping to confirm a successful connection
    await client.db('admin').command({ ping: 1 });
    console.log(
      'Pinged your deployment. You successfully connected to MongoDB!'
    );
  } finally {
  }
}
run().catch(console.dir);

app.get('/', (req, res) => {
  res.send('AutoRevivePoint Server Accessed to Root');
});
app.listen(port, () => {
  console.log(`Working at PORT:${port}`);
});
