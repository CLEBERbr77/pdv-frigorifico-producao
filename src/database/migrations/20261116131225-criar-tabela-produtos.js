
module.exports = {
    async up(queryInterface, Sequelize) {
        await queryInterface.createTable('produtos', {
            id: {
                type: Sequelize.DataTypes.INTEGER,
                primaryKey: true,
                autoIncrement: true,
                allowNull: false
            },

            nome: {
                type: Sequelize.DataTypes.STRING,
                allowNull: false
            },

            codigo_produto: {
                type: Sequelize.DataTypes.STRING,
                allowNull: false,
                unique: true
            },

            codigo_barras: {
                type: Sequelize.DataTypes.STRING,
                allowNull: true,
                unique: true
            },

            preco: {
                type: Sequelize.DataTypes.DECIMAL(10, 2),
                allowNull: false
            },

            estoque: {
                type: Sequelize.DataTypes.DECIMAL(10, 3),
                allowNull: false,
                defaultValue: 0
            },

            ativo: {
                type: Sequelize.DataTypes.BOOLEAN,
                allowNull: false,
                defaultValue: true
            },

            createdAt: {
                type: Sequelize.DataTypes.DATE,
                allowNull: false
            },

            updatedAt: {
                type: Sequelize.DataTypes.DATE,
                allowNull: false
            }
        });
    },

    async down(queryInterface) {
        await queryInterface.dropTable('produtos');
    }
};
