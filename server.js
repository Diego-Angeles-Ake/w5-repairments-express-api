const { app } = require('./app');
const { sequelize } = require('./database/database.config');
const { Repair } = require('./models/repairs.model');
const { User } = require('./models/users.model');
const PORT = process.env.PORT || 5000;

/* ---------------------------------- Auth ---------------------------------- */
(async () => {
  try {
    await sequelize.authenticate();
    console.log('Connection has been established successfully.');
  } catch (error) {
    console.error('Unable to connect to the database:', error);
  }
})();

/* ------------------------ Establish Model Relations ----------------------- */
// * User 1:M Repair
User.hasMany(Repair);
Repair.belongsTo(User);

/* ----------------------------- Synchronization ---------------------------- */
(async () => {
  await sequelize.sync();
  console.log('All models were synchronized successfully.');
})();

/* ----------------------------- Server spin up ----------------------------- */
app.listen(PORT, console.log(`Running on port ${PORT}`));
