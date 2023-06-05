const express = require('express');
const bodyParser = require('body-parser');
const { MongoClient, ObjectId } = require('mongodb');

const app = express();
const port = 3000;
const mongoURI = 'mongodb+srv://council:vishavjeet2006@cluster0.xemjm1b.mongodb.net'; // Update with your MongoDB connection URI
const dbName = 'council_students_db'; // Update with your database name

// Middleware
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
app.set('view engine', 'ejs');
app.use(express.static('public'));

// Connect to MongoDB
MongoClient.connect(mongoURI, { useUnifiedTopology: true })
  .then(client => {
    console.log('Connected to MongoDB');
    const db = client.db(dbName);
    const studentsCollection = db.collection('students');

    // API endpoints
    app.get('/', (req, res) => {
      studentsCollection.find().toArray()
        .then(students => {
          res.render('index', { students });
        })
        .catch(err => res.status(500).send(err));
    });

    app.post('/add-student', (req, res) => {
      studentsCollection.findOne({}, { sort: { serialNumber: -1 } })
        .then(lastStudent => {
          const serialNumber = lastStudent ? lastStudent.serialNumber + 1 : 1;
          const { name, className, designation, house, dutyTiming, placeOfDuty } = req.body;

          studentsCollection.insertOne({
            serialNumber,
            name,
            className,
            designation,
            house,
            dutyTiming,
            placeOfDuty
          })
            .then(() => res.redirect('/'))
            .catch(err => res.status(500).send(err));
        })
        .catch(err => res.status(500).send(err));
    });

    app.get('/edit-student/:id', (req, res) => {
      const studentId = req.params.id;

      studentsCollection.findOne({ _id: new ObjectId(studentId) })
        .then(student => {
          res.render('edit', { student });
        })
        .catch(err => res.status(500).send(err));
    });

    app.post('/update-student/:id', (req, res) => {
      const studentId = req.params.id;
      const { name, className, designation, house, dutyTiming, placeOfDuty } = req.body;

      studentsCollection.updateOne(
        { _id: new ObjectId(studentId) },
        { $set: { name, className, designation, house, dutyTiming, placeOfDuty } }
      )
        .then(() => res.redirect('/'))
        .catch(err => res.status(500).send(err));
    });

    app.post('/delete-student/:id', (req, res) => {
      const studentId = req.params.id;

      studentsCollection.deleteOne({ _id: new ObjectId(studentId) })
        .then(() => res.redirect('/'))
        .catch(err => res.status(500).send(err));
    });

    // Start the server
    app.listen(port, () => {
      console.log(`Server running on http://localhost:${port}`);
    });
  })
  .catch(err => {
    console.error('Failed to connect to MongoDB', err);
  });
