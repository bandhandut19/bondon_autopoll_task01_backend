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
            console.log(newUserid)
            // const query = { userId: newUserid.userId }
            // const parentUser = await clickedUsers.findOne(query)
            // console.log(parentUser)

            // const result = await clickedUsers.insertOne(newUserid)
            // res.send(result)
            const query = { _id: { $exists: true } }
            const previousClickedUsers = await clickedUsers.find(query).toArray()

            if (previousClickedUsers.length == 0) {
                const result = await clickedUsers.insertOne(newUserid)
                res.send(result)
                console.log("first user")
                return
            }
            else {

                for (const each of previousClickedUsers) {
                    console.log("trying")
                    if (each.children) {
                        const length = await each.children.length
                        if (length == 0) {
                            //update left
                            let left = each.children[0].leftChild
                            const queryUser = each.userId
                            const update = await clickedUsers.updateOne(queryUser,{ $set: { left : newUserid }}) 
                            res.send(update)
                            //insert
                            const result = await clickedUsers.insertOne(newUserid)
                            res.send(result)
                            return
                        }
                        else if (length == 1) {
                            //update middle
                            let middle = each.children[1].middleChild
                            const update = { $set: { middle : newUserid } }
                            //insert
                            const result = await clickedUsers.insertOne(newUserid)
                            res.send(result)
                            return
                        }
                        else if (length == 2) {
                              //update right
                              let right = each.children[2].rightChild
                              const update = { $set: { right : newUserid } }
                              //insert
                              const result = await clickedUsers.insertOne(newUserid)
                              res.send(result)
                              return
                        }
                        else {
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
