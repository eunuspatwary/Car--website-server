const express = require('express')
const app = express()
const cors = require('cors');
const ObjectId = require('mongodb').ObjectId;

require('dotenv').config();
const { MongoClient } = require('mongodb');
const port = process.env.PORT || 5001;
app.use(cors());
app.use(express.json())

const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.padbs.mongodb.net/myFirstDatabase?retryWrites=true&w=majority`;
const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true });
console.log(uri)

async function run() {
    try {
        await client.connect();
        const database = client.db("carPlace");
        const productCollections = database.collection('products')
        const purchaseCollection = database.collection('purchase-item')
        const usersCollection = database.collection('users');
        const reviwCollection = database.collection('review');

        //    post api produrvt 
        app.post('/products', async (req, res) => {
            const carItem = req.body;
            console.log(carItem)
            const result = await productCollections.insertOne(carItem)
            console.log(result)
            res.json(result)
        })
        // post review 
        app.post('/review', async (req, res) => {
            const service = req.body


            const result = await reviwCollection.insertOne(service);
            console.log(result);
            res.json(result)
        });

        // reviw get 
        app.get('/reviews', async (req, res) => {
            const cursor = reviwCollection.find({})
            const review = await cursor.toArray()

            res.send(review)
        })


        // purchase post
        app.post('/purchase', async (req, res) => {
            const product = req.body;
            const results = await purchaseCollection.insertOne(product)

            res.json(results)
        })

        // post user 
        app.post('/users', async (req, res) => {
            const user = req.body;
            const result = await usersCollection.insertOne(user);
            console.log(result);
            res.json(result);
        });

        // get api 
        app.get('/products', async (req, res) => {
            const cursor = productCollections.find({})
            const products = await cursor.toArray()

            res.send(products)
        })
        // get all order collection 
        app.get('/allOrders', async (req, res) => {
            const cursors = purchaseCollection.find({})
            const purchase = await cursors.toArray()
            res.send(purchase)
        })
        //get with email
        app.get('/order', async (req, res) => {
            const email = req.query.email;
            // const date = new Date(req.query.date).toLocaleDateString();

            const query = { email: email }
            console.log(query)

            const cursor = purchaseCollection.find(query);
            const manageOrder = await cursor.toArray();
            res.json(manageOrder);
        })
        // delete api get
        app.get('/allOrders/:id', async (req, res) => {
            const id = req.params.id;
            const query = { _id: ObjectId(id) };
            const user = await purchaseCollection.findOne(query);
            // console.log('load user with id: ', id);
            res.send(user);
        })

        // check admin role 
        app.get('/users/:email', async (req, res) => {
            const email = req.params.email;
            const query = { email: email };
            const user = await usersCollection.findOne(query);
            let isAdmin = false;
            if (user?.role === 'admin') {
                isAdmin = true;
            }
            res.json({ admin: isAdmin });
        })


        // get single api 
        app.get('/products/:id', async (req, res) => {
            const id = req.params.id;
            console.log('geting id', id)
            const query = { _id: ObjectId(id) };
            const product = await productCollections.findOne(query);
            res.json(product);
        })


        // delete order user 
        app.delete('/allOrders/:id', async (req, res) => {
            const id = req.params.id;
            const query = { _id: ObjectId(id) };
            const result = await purchaseCollection.deleteOne(query);

            console.log('deleting user with id ', result);

            res.json(result);
        })
        //if google new user ? post : hobena

        app.put('/users', async (req, res) => {
            const user = req.body;
            const filter = { email: user.email };
            const options = { upsert: true };
            const updateDoc = { $set: user };
            const result = await usersCollection.updateOne(filter, updateDoc, options);
            res.json(result);
        });

        // admin roal add 
        app.put('/users/admin', async (req, res) => {
            const user = req.body;
            const filter = { email: user.email }
            const updateDoc = { $set: { role: 'admin' } };
            const result = await usersCollection.updateOne(filter, updateDoc);
            res.json(result);



        })



    } finally {
        // await client.close();
    }
}
run().catch(console.dir);

app.get('/', (req, res) => {
    res.send('Running car server');
})

app.listen(port, () => {
    console.log('Running car server', port);
})