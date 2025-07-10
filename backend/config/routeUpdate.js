import mongoose from 'mongoose';
import dotenv from 'dotenv';
import Route from '../models/TrainRoute.Model.js'; // Adjust path if needed

dotenv.config(); // Load .env if you're using one

mongoose.connect('mongodb+srv://Admin:authPASS5115@auth.rnlfnk4.mongodb.net/Railway')
  .then(async () => {
    console.log('Connected to MongoDB');

    const routes = await Route.find();

    for (let route of routes) {
      let updated = false;

      let updatedStops = route.stops.map(stop => {
        if (stop.availableSeats < 10) {
          stop.availableSeats = 10;
          updated = true;
        }
        return stop;
      });

      if (updated) {
        route.stops = updatedStops;
        await route.save();
        console.log(`✅ Updated route ${route._id}`);
      } else {
        console.log(`➖ No update needed for ${route._id}`);
      }
    }

    console.log("🎉 All done");
    mongoose.disconnect();
  })
  .catch((err) => {
    console.error("Connection error:", err);
  });
