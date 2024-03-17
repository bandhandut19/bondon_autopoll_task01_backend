const express = require('express')
const cors = require('cors')
require('dotenv').config()
const { MongoClient, ServerApiVersion } = require('mongodb');

const app = express()
const port = process.env.PORT || 5000

app.use(express.json())
app.use(cors())
app.listen(port, () => {
    console.log(`Server running at http://localhost:${port}`);
});


const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASSWORD}@cluster0.ttptxjd.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0`;
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
    
    const autopoll = client.db('autopoll')
    const users = autopoll.collection('users')
    
    app.get('/',(req,res)=>{
        res.send('api for autopoll task')
    })
    
    //////////////////////////////////////////////////////////////////

    // user register api
    
    app.post('/users',async (req,res)=>{
        const cursor = req.body
        const result = await users.insertOne(cursor)
        res.send(result)
    })
    
    app.get('/users',async(req,res)=>{
        const cursor = users.find()
        const result = await cursor.toArray()
        res.send(result)
    })

    //////////////////////////////////////////////////////////////////

    



    
    await client.db("admin").command({ ping: 1 });
    console.log("Pinged your deployment. You successfully connected to MongoDB!");
} finally {
    // await client.close();
  }
}
run().catch(console.dir);
