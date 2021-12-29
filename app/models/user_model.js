// const { Sequelize, DataTypes } = require("sequelize/types");
// const { sequelize } = require(".");
// const v4 = require('uuid');

// const { DataTypes } = require("sequelize/types");

module.exports = (sequelize, Sequelize) => {
    const User = sequelize.define("user",{
        id:{
            type: Sequelize.DataTypes.UUID,
            defaultValue: Sequelize.DataTypes.UUIDV4,
            primaryKey: true
        },
        first_name:{
            type: Sequelize.STRING,
            required: true,
            allowNull: false
        },
        last_name:{
            type: Sequelize.STRING,
            required: true,
            allowNull: false
        },
        username:{
            type: Sequelize.STRING,
            required: true,
            unique: {
                msg: 'Username should be unique',
                fields: ['username']
            },
            allowNull: false,
            validate: {
                isEmail: {
                    args: true,
                    msg: "User name should be a valid email address!"
                }
            }
        },
        password:{
            type: Sequelize.STRING,
            required: true,
            validate:{
                len: {
                    args : [5,500],
                    msg: "Password should be between 5 and 15 characters"
                }
            }
        },
        account_created: {
            type: 'TIMESTAMP',
            defaultValue: Sequelize.literal('CURRENT_TIMESTAMP'),
            allowNull: false,
            
        },
        account_updated: {
            type: 'TIMESTAMP',
            defaultValue: Sequelize.literal('CURRENT_TIMESTAMP'),
            allowNull: false,
            
        }
    },{
        updatedAt: 'account_updated',
        createdAt: 'account_created'   

    });
    
    return User;
};