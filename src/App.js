
import fs from "node:fs";
import { CadastroClientes } from "./CadastroClientes.js";
import { RegistroDeEntradas_E_Saidas } from "./RegistroDeEntradas_E_Saidas.js";
import { RelatoriosGerenciais } from "./RelatoriosGerenciais.js";

export class App {
  constructor() {
    this.cadastroClientes = new CadastroClientes();

    this.registroEstacionamento =
      new RegistroDeEntradas_E_Saidas(
        this.cadastroClientes
      );

    this.relatoriosGerenciais =
      new RelatoriosGerenciais(
        this.registroEstacionamento,
        this.cadastroClientes
      );
  }

  
  iniciar() {
    const caminhoArquivo = "clientes.csv";

    if (fs.existsSync(caminhoArquivo)) {
      this.cadastroClientes.carregarDeCSV(caminhoArquivo);

      console.log(
        "Clientes carregados:",
        this.cadastroClientes.listarClientes().length
      );
    } else {
      console.log("Nenhum arquivo de clientes encontrado.");
    }

    const caminhoTickets = "tickets.csv";

    if (fs.existsSync(caminhoTickets)) {
      const totalTickets =
        this.registroEstacionamento.carregarDeCSV(caminhoTickets);

      console.log("Tickets carregados:", totalTickets);
    } else {
      console.log("Nenhum arquivo de tickets encontrado.");
    }

    console.log("Sistema de Controle de Estacionamento iniciado.");

    // NOVO: configura o salvamento automático ao encerrar
    if (!this.encerramentoConfigurado) {
      process.once("beforeExit", () => {
        this.salvarDados();
      });

      this.encerramentoConfigurado = true;
    }
  }

  salvarDados() {
    this.cadastroClientes.salvarEmCSV("clientes.csv");
    this.registroEstacionamento.salvarEmCSV("tickets.csv");

    console.log("Dados salvos com sucesso!");
  }
}
