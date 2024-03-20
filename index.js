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
        const clickedUsers = autopoll.collection('clickedUsers')

        app.get('/', (req, res) => {
            res.send('api for autopoll task')
        })

        //////////////////////////////////////////////////////////////////

        // user register api

        app.post('/users', async (req, res) => {
            const cursor = req.body
            const result = await users.insertOne(cursor)
            res.send(result)
        })

        app.get('/users', async (req, res) => {
            const cursor = users.find()
            const result = await cursor.toArray()
            res.send(result)
        })

        //////////////////////////////////////////////////////////////////

        // clicked users api


        app.post('/clickedusers', async (req, res) => {
            const newUserid = req.body
            const query = { _id: { $exists: true } }
            const previousClickedUsers = await clickedUsers.find(query).toArray()

            if (previousClickedUsers.length == 0) {
                const result = await clickedUsers.insertOne(newUserid)
                res.send(result)
                
                return
            }
            else {

                for (const each of previousClickedUsers) {
                    
                    if (each.children) {
                        const length = await each.children.length

                        const left = each.children[0].leftChild

                        const middle = each.children[1].middleChild
                        const right = each.children[2].rightChild
                        if (left == null) {
                           
                            //update left
                            

                            const queryUser = { userId: each.userId, "children.leftChild": null };

                            const updateField = { $set: { "children.0.leftChild": newUserid } };
                            const options = { upsert: false };

                            const update = await clickedUsers.updateOne(queryUser, updateField, options);

                            //insert
                            const result = await clickedUsers.insertOne(newUserid)
                            res.send(result)
                            return
                        }
                        else if (middle == null) {
                            
                            //update middle
                           

                            const queryUser = { userId: each.userId };

                            const updateField = { $set: { "children.1.middleChild": newUserid } };
                            const options = { upsert: false };

                            const update = await clickedUsers.updateOne(queryUser, updateField, options);

                            //insert
                            const result = await clickedUsers.insertOne(newUserid)
                            res.send(result)
                            return
                        }
                        else if (right == null) {
                            
                            //update right
                            

                            const queryUser = { userId: each.userId, "children.rightChild": null };

                            const updateField = { $set: { "children.2.rightChild": newUserid } };
                            const options = { upsert: false };

                            const update = await clickedUsers.updateOne(queryUser, updateField, options);

                            //insert
                            const result = await clickedUsers.insertOne(newUserid)
                            res.send(result)
                            return
                        }
                        else {
                            console.log("trying_null")
                            continue;
                        }
                    }
                }


            }



        })

        app.get('/clickedusers', async (req, res) => {
            const cursor = clickedUsers.find()
            const result = await cursor.toArray()
            res.send(result)
        })









        // user level based on date

        // app.get('/users/:date',async(req,res)=>{
        //     const date = req.params.date

        //     try{
        //         const previousUsers = await users.countDocuments({date: {$lt: date}})
        //         // res.send(result)
        //         console.log(previousUsers)
        //     }
        //     catch (error){
        //         console.log(error)
        //         return 0
        //     }

        //     // res.send(previousUsers)
        // })








        await client.db("admin").command({ ping: 1 });
        console.log("Pinged your deployment. You successfully connected to MongoDB!");
    } finally {
        // await client.close();
    }
}
run().catch(console.dir);
