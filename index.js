const express = require('express');
const cors = require('cors');
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
require('dotenv').config();


const app = express();

const port = process.env.PORT || 5000;

// midleweres
app.use(cors());
app.use(express.json());


const uri =
  `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster1.6mzg5rv.mongodb.net/?retryWrites=true&w=majority&appName=Cluster1`;

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

const servicesCollection=client.db('autoRevivePoint').collection('services');

   

// getting all data 
app.get('/services',async (req,res)=>{
     console.log('services hited');
      const cursor=servicesCollection.find({});
      const result= await cursor.toArray();
      res.send(result)
});
// getting single data  
app.get('/services/:id', async(req,res)=>{
  console.log(`getting data by id hitted`);
       const id=req.params.id;
       const query={ _id: new ObjectId(id) };
       const result  =await servicesCollection.findOne(query);
       res.send(result)
});




    // Send a ping to confirm a successful connection
    await client.db('admin').command({ ping: 1 });
    console.log(
      'Pinged your deployment. You successfully connected to MongoDB!'
    );
  } finally {
    // Ensures that the client will close when you finish/error
//     await client.close();
  }
}
run().catch(console.dir);

app.get('/', (req, res) => {
  res.send('AutoRevivePoint Server Accessed to Root');
});
app.listen(port, () => {
  console.log(`Working at PORT:${port}`);
});
