const express = require("express");
const bodyParser = require("body-parser");
const cors = require("cors");
require("dotenv").config();
const fileUpload = require("express-fileupload");
const MongoClient = require("mongodb").MongoClient;
const ObjectID = require("mongodb").ObjectID;
const app = express();

app.use(cors());
app.use(bodyParser.json());
app.use(fileUpload());

const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@test.0kqsr.mongodb.net/${process.env.DB_NAME}?retryWrites=true&w=majority`;

app.get("/", (req, res) => {
    res.send("database is working !!");
});

const client = new MongoClient(uri, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
});

client.connect((err) => {
    const serviceCollection = client.db("easyFix").collection("services");
    const bookingCollection = client.db("easyFix").collection("booking");
    const reviewCollection = client.db("easyFix").collection("reviews");
    const adminCollection = client.db("easyFix").collection("admins");

    app.post("/addService", (req, res) => {
        const file = req.files.file;
        const title = req.body.title;
        const description = req.body.description;
        const price = req.body.price;

        const newImg = file.data;
        const encImg = newImg.toString("base64");

        const image = {
            contentType: file.mimetype,
            size: file.size,
            img: Buffer.from(encImg, "base64"),
        };

        serviceCollection
            .insertOne({ title, description, price, image })
            .then((result) => {
                res.send(result.insertedCount > 0);
            });
    });

    app.get("/services", (req, res) => {
        serviceCollection.find({}).toArray((err, services) => {
            res.send(services);
        });
    });

    app.get("/service/:id", (req, res) => {
        const id = ObjectID(req.params.id);
        serviceCollection.find({ _id: id }).toArray((err, documents) => {
            res.send(documents[0]);
        });
    });

    app.post("/bookService", (req, res) => {
        const data = req.body;
        bookingCollection.insertOne(data).then((result) => {
            res.send(result.insertedCount > 0);
        });
    });

    app.get("/bookings", (req, res) => {
        bookingCollection
            .find({ email: req.query.email })
            .toArray((err, bookings) => {
                res.send(bookings);
            });
    });

    app.post("/addReview", (req, res) => {
        const file = req.files.file;
        const name = req.body.name;
        const position = req.body.position;
        const description = req.body.description;

        const newImg = file.data;
        const encImg = newImg.toString("base64");

        const image = {
            contentType: file.mimetype,
            size: file.size,
            img: Buffer.from(encImg, "base64"),
        };
        reviewCollection
            .insertOne({ name, position, description, image })
            .then((result) => {
                res.send(result.insertedCount > 0);
            });
    });

    app.get("/reviews", (req, res) => {
        reviewCollection.find({}).toArray((err, reviews) => {
            res.send(reviews);
        });
    });

    app.get("/orders", (req, res) => {
        bookingCollection.find({}).toArray((err, orders) => {
            res.send(orders);
        });
    });

    app.post("/makeAdmin", (req, res) => {
        const email = req.body;
        adminCollection.insertOne(email).then((result) => {
            res.send(result.insertedCount > 0);
        });
    });

    app.post("/isAdmin", (req, res) => {
        const email = req.body.email;
        adminCollection.find({ email: email }).toArray((err, admins) => {
            res.send(admins.length > 0);
        });
    });

    app.delete("/deleteService/:id", (req, res) => {
        const id = ObjectID(req.params.id);
        serviceCollection.findOneAndDelete({ _id: id }).then((result) => {
            res.send(result.ok > 0);
        });
    });

    app.patch("/updateStatus/:id", (req, res) => {
        const id = ObjectID(req.params.id);
        bookingCollection
            .findOneAndUpdate(
                { _id: id },
                {
                    $set: { status: req.body.status },
                }
            )
            .then((result) => {
                res.send(result.ok > 0);
            });
    });
});

app.listen(process.env.PORT || 8000);
