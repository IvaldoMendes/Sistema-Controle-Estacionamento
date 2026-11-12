
import { App } from "./App.js";

const app = new App();

// Inicia o sistema
app.iniciar();

// Verifica se os componentes foram criados
console.log(
  "Cadastro de clientes:",
  app.cadastroClientes !== undefined
);

console.log(
  "Registro de estacionamento:",
  app.registroEstacionamento !== undefined
);

console.log(
  "Relatórios gerenciais:",
  app.relatoriosGerenciais !== undefined
);

console.log("\n--- TESTE DE SALVAMENTO ---");

console.log(
  "Clientes mantidos:",
  app.cadastroClientes.listarClientes().length
);

console.log(
  "Tickets mantidos:",
  app.registroEstacionamento.historico.length
);
