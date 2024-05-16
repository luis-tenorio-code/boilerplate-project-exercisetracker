const express = require('express');
const app = express();
const cors = require('cors');
require('dotenv').config();
const mongoose = require('mongoose');

app.use(cors());
app.use(express.urlencoded({ extended: false }));
app.use(express.json());

app.use(express.static('public'));
app.get('/', (req, res) => {
  res.sendFile(__dirname + '/views/index.html');
});

/*-------- */
mongoose.connect(process.env.MONGO_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

// Definir esquemas de datos
const userSchema = new mongoose.Schema({
  username: String,
});

const exerciseSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  description: String,
  duration: Number,
  date: { type: Date, default: Date.now },
});

// Definir modelos
const User = mongoose.model('User', userSchema);
const Exercise = mongoose.model('Exercise', exerciseSchema);

app.post('/api/users', async (req, res) => {
  try {
    const { username } = req.body;
    const user = new User({ username });
    await user.save();
    res.json(user);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

app.post('/api/users/:_id/exercises', async (req, res) => {
  try {
    const { _id } = req.params;
    const { description, duration, date } = req.body;
    const user = await User.findById(_id);

    const newExercise = new Exercise({
      userId: user._id,
      username: user.username,
      description,
      duration,
      date: date ? new Date(date) : new Date(),
    });
    await newExercise.save();

    res.json({
      _id: user._id,
      username: user.username,
      date: newExercise.date.toDateString(),
      duration: newExercise.duration,
      description: newExercise.description,
    });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

app.get('/api/users', async (req, res) => {
  try {
    const users = await User.find();
    res.json(users);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

app.get('/api/users/:_id/logs', async (req, res) => {
  try {
    const userId = req.params._id;
    const user = await User.findById(userId);

    const { from, to, limit } = req.query;
    let exerciseQuery = { userId: user._id };

    if (from && to) {
      exerciseQuery.date = { $gte: new Date(from), $lt: new Date(to) };
    }
    let exercises = await Exercise.find(exerciseQuery);
    if (limit) {
      exercises = exercises.slice(0, limit);
    }

    const log = {
      username: user.username,
      _id: user._id,
      count: exercises.length,
      log: exercises.map((exercise) => ({
        description: exercise.description,
        duration: exercise.duration,
        date: exercise.date.toDateString(),
      })),
    };
    res.json(log);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

app.delete('/api/users', async (req, res) => {
  try {
    await User.deleteMany();
    await Exercise.deleteMany();
    res.json({ message: 'complete delete successful' });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

const listener = app.listen(process.env.PORT || 3000, () => {
  console.log('Your app is listening on port ' + listener.address().port);
});
