const { sequelize, Sequelize } = require(".");
const User = require("./user_model");

module.exports = (sequelize, Sequelize) => {
    const Image = sequelize.define("image", {
        file_name:{
            type: Sequelize.DataTypes.STRING,
            required: true,
            allowNull: false
        },
        id:{
            type: Sequelize.DataTypes.UUID,
            defaultValue: Sequelize.DataTypes.UUIDV4,
            primaryKey: true
        },
        url:{
            type: Sequelize.DataTypes.STRING,
            required: true,
            allowNull: false
        },
        upload_date:{
            type: 'TIMESTAMP',
            defaultValue: Sequelize.literal('CURRENT_TIMESTAMP'),
            allowNull: false
        },
        user_id: {
            type: Sequelize.DataTypes.UUID,
            field: 'user_id'
        }
    });

    Image.associate = function (models) {
        models.Image.belongsTo(models.User, { foreignKey: 'user_id', as: 'user' });
    };
    return Image;
}