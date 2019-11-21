import Sequelize from 'sequelize';

import User from '../app/models/User';

import Student from '../app/models/Student';

import Plan from '../app/models/Plan';

import Enrollment from '../app/models/Enrollment';

import Checkin from '../app/models/Checkin';

import Help_Order from '../app/models/HelpOrder';

import databaseConfig from '../config/database';

const models = [User, Student, Plan, Enrollment, Checkin, Help_Order];

class Database {
  constructor() {
    this.init();
  }

  init() {
    this.connection = new Sequelize(databaseConfig);

    models
      .map(model => model.init(this.connection))
      .map(model => model.associate && model.associate(this.connection.models));
  }
}

export default new Database();
