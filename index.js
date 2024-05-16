const express = require('express');
const app = express();
const cors = require('cors');
require('dotenv').config();

app.use(cors());
app.use(express.urlencoded({ extended: false }));
app.use(express.json());

app.use(express.static('public'));
app.get('/', (req, res) => {
  res.sendFile(__dirname + '/views/index.html');
});

/*
Tus respuestas deben tener las siguientes estructuras.

Ejercicio:

{
  username: "fcc_test",
  description: "test",
  duration: 60,
  date: "Mon Jan 01 1990",
  _id: "5fb5853f734231456ccb3b05"
}
Usuario:

{
  username: "fcc_test",
  _id: "5fb5853f734231456ccb3b05"
}
Log:

{
  username: "fcc_test",
  count: 1,
  _id: "5fb5853f734231456ccb3b05",
  log: [{
    description: "test",
    duration: 60,
    date: "Mon Jan 01 1990",
  }]
}
Pista: Para la propiedad date, el método toDateString de la API Date puede ser usado para conseguir el resultado esperado.
*/
// Datos en memoria
const users = {};
let exerciseId = 0;

app.post('/api/users', (req, res) => {
  const { username } = req.body;
  const userId = Object.keys(users).length + 1;
  users[userId] = { _id: userId, username };
  res.json({ username, _id: userId });
});

app.post('/api/users/:_id/exercises', (req, res) => {
  const { description, duration, date } = req.body;
  const userId = req.params._id;
  const exercise = {
    _id: ++exerciseId,
    userId,
    description,
    duration,
    date: date || new Date().toISOString().slice(0, 10),
  };
  if (!users[userId]) {
    res.status(404).json({ error: 'User not found' });
  } else {
    res.json(exercise);
  }
});

app.get('/api/users/:_id/logs', (req, res) => {
  const userId = req.params._id;
  const userExercises = Object.values(exercises).filter(
    (exercise) => exercise.userId === userId
  );
  res.json({
    username: users[userId].username,
    count: userExercises.length,
    log: userExercises,
  });
});


const listener = app.listen(process.env.PORT || 3000, () => {
  console.log('Your app is listening on port ' + listener.address().port);
});
