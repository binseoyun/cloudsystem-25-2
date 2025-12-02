const { DataTypes } = require('sequelize');

const sequelize = require('../config/database'); 

const Class = sequelize.define('Class', {
  id: {
    type: DataTypes.STRING,
    primaryKey: true,
    allowNull: false
  },
  name: {
    type: DataTypes.STRING,
    allowNull: false
  },
  professor: {
    type: DataTypes.STRING,
    allowNull: false
  },
  credits: {
    type: DataTypes.INTEGER,
    allowNull: false
  },
  capacity: {
    type: DataTypes.INTEGER,
    allowNull: false
  },
  enrolled: {
    type: DataTypes.INTEGER,
    allowNull: false
  },
  department: {
    type: DataTypes.STRING,
    allowNull: false
  },
  courseType: {
    type: DataTypes.STRING,
    allowNull: false,
    comment: '전공 필수, 전공 선택, 교양'
  }
}, {
  timestamps: true,
  underscored: true
});

module.exports = Class;