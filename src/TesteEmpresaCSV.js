
import { CadastroClientes } from "./CadastroClientes.js";
import { Empresa } from "./Empresa.js";
import fs from "node:fs";

const arquivoTeste = "empresa_teste.csv";

try {
  const cadastro = new CadastroClientes();

  const empresa = new Empresa(
    "12345678000199",
    "Empresa Teste"
  );

  empresa.adicionarPlaca("EMP1A23");
  empresa.registrarDebito(150);
  empresa.bloquearPorInadimplencia();

  cadastro.cadastrarCliente(empresa);
  cadastro.salvarEmCSV(arquivoTeste);

  console.log("Empresa salva com sucesso!");

  const cadastroRecuperado = new CadastroClientes();

  cadastroRecuperado.carregarDeCSV(arquivoTeste);

  const empresaRecuperada =
    cadastroRecuperado.buscarCliente("12345678000199");

  console.log("Débito recuperado:", empresaRecuperada.debito);
  console.log(
    "Inadimplente:",
    empresaRecuperada.inadimplente
  );
  console.log(
    "Entrada autorizada?",
    empresaRecuperada.podeEntrar()
  );

  if (
    empresaRecuperada.debito !== 150 ||
    empresaRecuperada.inadimplente !== true ||
    empresaRecuperada.podeEntrar() !== false
  ) {
    throw new Error("Falha na recuperação da empresa.");
  }

  console.log("Teste de inadimplência aprovado!");

} finally {
  if (fs.existsSync(arquivoTeste)) {
    fs.unlinkSync(arquivoTeste);
  }
}
