const express = require('express');
const cors = require('cors');
const jwt = require('jsonwebtoken');
const purser = require('cookie-parser');
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
require('dotenv').config();
const app = express();

const port = process.env.PORT || 5000;

// midleweres
app.use(
  cors({
    origin: ['http://localhost:5173'],
    credentials: true,
  })
);
app.use(express.json());
app.use(purser());

// midlewere functions = >

const logger = async (req, res, next) => {
  let fullUrl = req.protocol + '://' + req.get('host') + req.originalUrl;
  console.log(`hitted to  ${fullUrl}`);
  next();
};
const verifyToken = async (req, res, next) => {
  const token = await req.cookies?.userToken;

  if (!token) {
    return res.status(401).send({ message: 'not authorized' });
  }

  jwt.verify(token, process.env.ACCESS_TOKEN_SECRET, (error, decoded) => {
    if (error) {
      return res.status(401).send({ message: 'Unothorize' });
    }
    console.log(`value in the token`, decoded);
    req.user = decoded;
    next();
  });
};
// midlewere function ended here ... 
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
    //  data collections => start
    const servicesCollection = client
      .db('autoRevivePoint')
      .collection('services');
    const bookingsCollection = client
      .db('autoRevivePoint')
      .collection('bookings');
    //  data collection ended
    

    //  posting  loggedin users =>
    app.post('/user', logger, async (req, res) => {
      const user = req.body;

      var token = jwt.sign(user, process.env.ACCESS_TOKEN_SECRET, {
        expiresIn: '1h',
      });

      res
        .cookie('userToken', token, {
          httpOnly: true,
          secure: false,
        })
        .send({ success: true });
    });

    app.post('/logout',logger,async(req,res)=>{
      const data= req.body;
      console.log(data);
      res.clearCookie('userToken',{maxAge:0}).send('logout called success')
    })

    
    // getting all data
    app.get('/services', logger, async (req, res) => {
      const cursor = servicesCollection.find({});
      const result = await cursor.toArray();
      res.send(result);
    });
    // getting single data
    app.get('/services/:id', logger, async (req, res) => {
      const id = req.params.id;
      const query = { _id: new ObjectId(id) };
      const option = {
        projection: { title: 1, price: 1, service_id: 1, img: 1 },
      };
      const result = await servicesCollection.findOne(query, option);
      res.send(result);
    });
    // getting bookings  all =>
    app.get('/bookings', logger, verifyToken, async (req, res) => {
      if (req.query?.email !== req.user.email) {
        return res.status(403).send({ message: 'unthorized' });
      }

      let query = {};
      if (req.query?.email) {
        query = { email: req.query?.email };
      }
      const result = await bookingsCollection.find(query).toArray();
      res.send(result);
    });
    // posting single data to  bookingsCollection
    app.post('/bookings', logger, async (req, res) => {
      const data = req.body;
      const result = await bookingsCollection.insertOne(data);
      res.send(result);
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
      '\x1b[32mPinged your deployment. You successfully connected to MongoDB!\x1b[0m'
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


