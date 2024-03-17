const express = require('express')
const cors = require('cors')
require('dotenv').config()
const { MongoClient, ServerApiVersion } = require('mongodb');

const app = express()
const port = process.env.PORT || 5000
const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.ttptxjd.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0`;

app.use(express.json())
app.use(cors())
app.listen(port, () => {
    console.log(`Server running at http://localhost:${port}`);
});


const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  }
});

async function run() {
  try {
    await client.connect();
    await client.db("admin").command({ ping: 1 });
    console.log("Pinged your deployment. You successfully connected to MongoDB!");

    app.get('/',(req,res)=>{
        res.send('api for autopoll task')
    })




  } finally {
    await client.close();
  }
}
run().catch(console.dir);
