const express = require("express");
const cors = require("cors");
require("dotenv").config();
// console.log(process.env)
const { MongoClient, ServerApiVersion, ObjectId } = require("mongodb");
const app = express();
const port = process.env.PORT || 3000;

// middleware
app.use(cors());
app.use(express.json());

const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.vrmmuai.mongodb.net/?appName=Cluster0`;

const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  },
});

async function run() {
  try {
    // await client.connect();
    const db = client.db("habitify_db");
    const habitCollection = db.collection("habits");
    const usersCollection = db.collection("users");
    // USER APIs
    app.post("/users", async (req, res) => {
      const newUser = req.body;
      const email = req.body.email;
      const query = { email: email };
      const existingUser = await usersCollection.findOne(query);
      if (existingUser) {
        res.send({ message: "user already exist, no need to insert" });
      } else {
        const result = await usersCollection.insertOne(newUser);
        res.send(result);
      }
    });

    app.get("/users", async (req, res) => {
      const email = req.query.email;
      console.log("Fetching transactions for:", email);
      const query = {};
      if (email) {
        query.email = email;
      }
      const cursor = usersCollection.find(query);
      const result = await cursor.toArray();
      res.send(result);
    });

    // Update a user info by ID
    app.patch("/users/:id", async (req, res) => {
      const id = req.params.id;
      const updatedUser = req.body;
      const query = { _id: new ObjectId(id) };
      const update = {
        $set: {
          name: updatedUser.name,
          email: updatedUser.email,
          image: updatedUser.image,
        },
      };
      const result = await usersCollection.updateOne(query, update);
      res.send(result);
    });

    // add-habit
    app.post("/habits", async (req, res) => {
      const newHabit = req.body;
      const result = await habitCollection.insertOne(newHabit);
      res.send(result);
    });

    // // GET: Featured habits (6 newest)
    // app.get("/featured-habits", async (req, res) => {
    //   const cursor = habitCollection
    //     .find() // all habits (or add { isPublic: true })
    //     .sort({ _id: -1 }) // newest first using MongoDB ObjectId timestamp
    //     .limit(6);

    //   const result = await cursor.toArray();
    //   res.send(result);
    // });

    // // my-habits api
    // app.get("/habits", async (req, res) => {
    //   const email = req.query.email;
    //   console.log("Fetching habits for:", email);
    //   const query = {};
    //   if (email) {
    //     query.user_email = email;
    //   }
    //   const cursor = habitCollection.find(query).sort({ date: -1 });
    //   const result = await cursor.toArray();
    //   res.send(result);
    // });

    // // all users public habits
    // app.get("/habits", async (req, res) => {
    //   const cursor = habitCollection.find();
    //   const result = await cursor.toArray();
    //   res.send(result);
    // });

    // // habit-details api
    // app.get("/habits/:id", async (req, res) => {
    //   const id = req.params.id;
    //   const query = { _id: new ObjectId(id) };
    //   const result = await habitCollection.findOne(query);
    //   res.send(result);
    // });

    // // Mark habit as complete (PATCH)
    // app.patch("/habits/complete/:id", async (req, res) => {
    //   const { id } = req.params;
    //   const today = new Date().toISOString().split("T")[0];

    //   try {
    //     const habit = await habitCollection.findOne({ _id: new ObjectId(id) });
    //     if (!habit) return res.status(404).send({ message: "Habit not found" });

    //     // Prevent duplicate completion for today
    //     const completionHistory = habit.completionHistory || [];
    //     if (completionHistory.includes(today)) {
    //       return res
    //         .status(400)
    //         .send({ message: "Habit already marked complete today" });
    //     }

    //     // Push today into completionHistory
    //     const updatedHabit = await habitCollection.updateOne(
    //       { _id: new ObjectId(id) },
    //       { $push: { completionHistory: today } }
    //     );

    //     res.send({ message: "Habit marked complete successfully" });
    //   } catch (err) {
    //     console.error(err);
    //     res.status(500).send({ message: "Server error" });
    //   }
    // });

    // // Update a habit by ID
    // app.patch("/habits/update/:id", async (req, res) => {
    //   const id = req.params.id;
    //   const updatedHabit = req.body;

    //   const query = { _id: new ObjectId(id) };
    //   const update = {
    //     $set: {
    //       title: updatedHabit.title,
    //       description: updatedHabit.description,
    //       category: updatedHabit.category,
    //       image: updatedHabit.image, // new or old
    //     },
    //   };

    //   const result = await habitCollection.updateOne(query, update);
    //   res.send(result);
    // });

    // // delete-habit
    // app.delete("/habits/:id", async (req, res) => {
    //   const id = req.params.id;
    //   const query = { _id: new ObjectId(id) };
    //   const result = await habitCollection.deleteOne(query);
    //   res.send(result);
    // });

    await client.db("admin").command({ ping: 1 });
    console.log(
      "Pinged your deployment. You successfully connected to MongoDB!"
    );
  } finally {
    // Ensures that the client will close when you finish/error
    // await client.close();
  }
}
run().catch(console.dir);

app.get("/", (req, res) => {
  res.send("Habitify server is running");
});
app.listen(port, () => {
  console.log(`Habitify server listening on port ${port}`);
});
