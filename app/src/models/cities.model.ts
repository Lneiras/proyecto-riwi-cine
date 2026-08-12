import {DataTypes, Model, Optional} from 'sequelize';
import sequelize from '../config/database';

export interface CityAttributes {
    id: number;
    name: string;
    departmentId: number;
}

class City extends Model<CityAttributes, Optional<CityAttributes, 'id'>> implements CityAttributes {
    public id!: number;
    public name!: string;
    public departmentId!: number; 
}

City.init(
    {
        id: {
            type: DataTypes.INTEGER,
            autoIncrement: true,
            primaryKey: true,
        },
        name: {
            type: DataTypes.STRING(100),
            allowNull: false,
        },
        departmentId: {
            type: DataTypes.INTEGER,
            allowNull: false,
            references: {
                model: "departments",
                key: "id",
            }
        }
    },
    {
        sequelize,
        modelName: 'City',
        tableName: 'cities'
    }
);

export default City;