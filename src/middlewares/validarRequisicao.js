function validarRequisicao(schema, origem = "body") {
  return (req, res, next) => {
    const dados = req[origem];
    const resultado = schema.safeParse(dados);

    if (!resultado.success) {
      return res.status(400).json({
        mensagem: "Dados inválidos.",
        erros: resultado.error.issues.map((erro) => ({
          campo: erro.path.join("."),
          mensagem: erro.message,
        })),
      });
    }

    if (origem === "body") {
      req.body = resultado.data;
    } else {
      req.dadosValidados = req.dadosValidados || {};
      req.dadosValidados[origem] = resultado.data;
    }

    next();
  };
}

module.exports = validarRequisicao;
