const express = require('express');
const Workout = require('../models/workout');

const router = express.Router();

function ensureAuthenticated(req, res, next) {
  if (req.isAuthenticated()) {
    return next();
  }

  return res.redirect('/login');
}

function validationMessages(error) {
  if (!error || !error.errors) {
    return [];
  }

  return Object.values(error.errors).map((item) => item.message);
}

router.use(ensureAuthenticated);

router.get('/workouts', async (req, res) => {
  try {
    const workouts = await Workout.find({ user: req.user._id }).sort({ workoutDate: -1 });
    res.render('workouts', {
      title: 'Workouts',
      workouts,
    });
  } catch (error) {
    return res.status(500).send('Server error');
  }
});

router.get('/workout/new', (req, res) => {
  res.render('new-workout', {
    title: 'New Workout',
    workout: {},
    errors: [],
  });
});

router.post('/workout', async (req, res) => {
  try {
    const workout = new Workout({
      workoutType: req.body.workoutType,
      duration: req.body.duration,
      caloriesBurned: req.body.caloriesBurned,
      workoutDate: req.body.workoutDate,
      notes: req.body.notes,
      user: req.user._id,
    });

    const error = workout.validateSync();
    if (error) {
      return res.status(400).render('new-workout', {
        title: 'New Workout',
        workout: req.body,
        errors: validationMessages(error),
      });
    }

    await workout.save();
    return res.redirect('/workouts');
  } catch (error) {
    return res.status(500).send('Server error');
  }
});

router.get('/workouts/:id', async (req, res) => {
  try {
    const workout = await Workout.findOne({ _id: req.params.id, user: req.user._id });

    if (!workout) {
      return res.status(404).render('404', { title: 'Workout Not Found' });
    }

    return res.render('show-workout', {
      title: 'Workout Details',
      workout,
    });
  } catch (error) {
    return res.status(500).send('Server error');
  }
});

router.get('/workouts/:id/edit', async (req, res) => {
  try {
    const workout = await Workout.findOne({ _id: req.params.id, user: req.user._id });

    if (!workout) {
      return res.status(404).render('404', { title: 'Workout Not Found' });
    }

    return res.render('edit-workout', {
      title: 'Edit Workout',
      workout,
      errors: [],
    });
  } catch (error) {
    return res.status(500).send('Server error');
  }
});

router.put('/workouts/:id', async (req, res) => {
  try {
    const workout = await Workout.findOne({ _id: req.params.id, user: req.user._id });

    if (!workout) {
      return res.status(404).render('404', { title: 'Workout Not Found' });
    }

    workout.duration = req.body.duration;
    workout.caloriesBurned = req.body.caloriesBurned;
    workout.workoutDate = req.body.workoutDate;
    workout.notes = req.body.notes;

    const error = workout.validateSync();
    if (error) {
      return res.status(400).render('edit-workout', {
        title: 'Edit Workout',
        workout: { ...workout.toObject(), ...req.body },
        errors: validationMessages(error),
      });
    }

    await workout.save();
    return res.redirect(`/workouts/${workout._id}`);
  } catch (error) {
    return res.status(500).send('Server error');
  }
});

router.delete('/workouts/:id', async (req, res) => {
  try {
    await Workout.findOneAndDelete({ _id: req.params.id, user: req.user._id });
    return res.redirect('/workouts');
  } catch (error) {
    return res.status(500).send('Server error');
  }
});

module.exports = router;
