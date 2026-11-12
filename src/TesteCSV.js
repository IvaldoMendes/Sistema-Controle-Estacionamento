
import { CadastroClientes } from "./CadastroClientes.js";
import { Professor } from "./Professor.js";
import { Estudante } from "./Estudante.js";
import { Empresa } from "./Empresa.js";

const cadastro = new CadastroClientes();

// Cadastra um professor
const professor = new Professor("11111111111", "Carlos");
professor.adicionarPlaca("ABC1D23");
cadastro.cadastrarCliente(professor);

// Cadastra um estudante
const estudante = new Estudante("22222222222", "Mariana", 100);
estudante.adicionarPlaca("DEF2E34");
cadastro.cadastrarCliente(estudante);

// Cadastra uma empresa
const empresa = new Empresa("33333333333333", "Empresa Exemplo");
empresa.adicionarPlaca("GHI3F45");
cadastro.cadastrarCliente(empresa);

// Salva os clientes em CSV
cadastro.salvarEmCSV("clientes.csv");

console.log("Arquivo CSV criado com sucesso!");
console.log("Total de clientes:", cadastro.listarClientes().length);
console.log("\n--- TESTE DE LEITURA DO CSV ---");

// Cria um cadastro novo, inicialmente vazio
const cadastroRecuperado = new CadastroClientes();

// Recupera os clientes salvos no arquivo
cadastroRecuperado.carregarDeCSV("clientes.csv");

console.log(
  "Clientes recuperados:",
  cadastroRecuperado.listarClientes().length
);

for (const cliente of cadastroRecuperado.listarClientes()) {
  console.log("Nome:", cliente.nome);
  console.log("Documento:", cliente.documento);
  console.log("Placas:", [...cliente.placas].join(", "));

  if (cliente instanceof Estudante) {
    console.log("Saldo:", cliente.saldo);
  }

  if (cliente instanceof Empresa) {
    console.log("Débito:", cliente.debito);
  }

  console.log("--------------------");
}

