const app = require("./app");
const sequelize = require("./config/database");

require("./models");

const PORT = process.env.PORT || 3003;

async function iniciarServidor() {
  try {
    await sequelize.authenticate();
    console.log("PostgreSQL conectado com sucesso!");

    app.listen(PORT, "0.0.0.0", () => {
      console.log(`Servidor iniciado na porta ${PORT}`);
    });
  } catch (error) {
    console.error("Erro ao conectar ao banco de dados:", error);
    process.exit(1);
  }
}

iniciarServidor();
