import fs from "node:fs";
import { TicketEstacionamento } from "./TicketEstacionamento.js";
import { Professor } from "./Professor.js";
import { Estudante } from "./Estudante.js";
import { Empresa } from "./Empresa.js";
import { Avulso } from "./Avulso.js";
import {
  Desconto,
  DescontoClienteFrequente
} from "./Desconto.js";


export class RegistroDeEntradas_E_Saidas {
  constructor(cadastroClientes) {
    this.cadastroClientes = cadastroClientes;

    // Veículos que estão no estacionamento
    this.veiculosEstacionados = new Map();

    // Histórico de entradas e saídas
    this.historico = [];

    // Placas bloqueadas de clientes avulsos
    this.placasBloqueadas = new Set();
  }

  autorizarEntrada(placa, dataEntrada = new Date()) {
    if (this.veiculosEstacionados.has(placa)) {
      throw new Error("Veículo já está estacionado.");
    }

    if (this.placasBloqueadas.has(placa)) {
      throw new Error("Placa bloqueada.");
    }

    const cliente = this.cadastroClientes.buscarPorPlaca(placa);

    let tipoCliente = "Avulso";

    if (cliente instanceof Professor) {
      tipoCliente = "Professor";

      // Professor só pode ter um veículo estacionado
      for (const placaCadastrada of cliente.placas) {
        if (this.veiculosEstacionados.has(placaCadastrada)) {
          throw new Error(
            "Professor já possui um veículo estacionado."
          );
        }
      }
    }

    if (cliente instanceof Estudante) {
      tipoCliente = "Estudante";

      if (!cliente.podeEntrar()) {
        throw new Error(
          "Estudante bloqueado por saldo negativo."
        );
      }
    }

    if (cliente instanceof Empresa) {
      tipoCliente = "Empresa";

      if (!cliente.podeEntrar()) {
        throw new Error(
          "Empresa bloqueada por inadimplência."
        );
      }
    }

    const ticket = new TicketEstacionamento(
      placa,
      tipoCliente,
      dataEntrada
    );

    this.veiculosEstacionados.set(placa, ticket);
    this.historico.push(ticket);

    return ticket;
  }

  consultarVeiculo(placa) {
    return this.veiculosEstacionados.get(placa) ?? null;
  }
  
  registrarSaida(
    placa,
    dataSaida = new Date(),
    desconto = new Desconto(),
    pagamentoAceito = true
  ) {

    // Localiza o ticket aberto
    const ticket = this.consultarVeiculo(placa);

    if (!ticket) {
      throw new Error("Veículo não está estacionado.");
    }

    // Identifica o proprietário
    const cliente = this.cadastroClientes.buscarPorPlaca(placa);

    const saida = new Date(dataSaida);

    if (
      Number.isNaN(saida.getTime()) ||
      saida < ticket.entrada
    ) {
      throw new Error("Data de saída inválida.");
    }

    // Calcula o custo conforme a categoria
    let custo = 0;

    if (cliente instanceof Professor) {
      custo = cliente.calcularCusto();
    } else if (cliente instanceof Estudante) {
      custo = cliente.calcularCusto(ticket.entrada, saida);
    } else if (cliente instanceof Empresa) {
      custo = cliente.calcularCusto(ticket.entrada, saida);
    } else {
      const avulso = new Avulso(placa);
      custo = avulso.calcularCusto(ticket.entrada, saida);
    }
    
    // Aplica automaticamente o desconto ao avulso frequente
    if (
      cliente === null &&
      desconto.identificador === "nenhum" &&
      this.verificarClienteFrequente(placa, saida)
    ) {
      desconto = new DescontoClienteFrequente();
    }

    // Valida o mecanismo de desconto
    if (!(desconto instanceof Desconto)) {
      throw new Error("Desconto inválido.");
    }

    // Nesta versão, descontos são exclusivos para avulsos
    if (
      cliente !== null &&
      desconto.identificador !== "nenhum"
    ) {
      throw new Error(
        "Desconto permitido apenas para clientes avulsos."
      );
    }

    const valorDesconto = desconto.calcularDesconto(custo);
    const valorDevido = custo - valorDesconto;

    // Registra a cobrança conforme a categoria
    let valorPago = 0;

    if (cliente instanceof Estudante) {
      cliente.cobrar(valorDevido);
      valorPago = valorDevido;

    } else if (cliente instanceof Empresa) {
      cliente.registrarDebito(valorDevido);

    } else if (cliente instanceof Professor) {
      valorPago = 0;

    } else {
      // Cliente avulso: verifica se aceitou o pagamento
      if (pagamentoAceito) {
        valorPago = valorDevido;
      } else {
        // Permite a saída e bloqueia futuras entradas
        valorPago = 0;
        this.placasBloqueadas.add(placa);
      }
    }

    // Finaliza o ticket
    ticket.registrarSaida(
      saida,
      custo,
      desconto.identificador,
      valorDesconto,
      valorPago
    );

    // Libera a vaga
    this.veiculosEstacionados.delete(placa);

    return ticket;
  }
  
  verificarClienteFrequente(placa, dataReferencia = new Date()) {
    const referencia = new Date(dataReferencia);

    if (Number.isNaN(referencia.getTime())) {
      throw new Error("Data de referência inválida.");
    }

    const cincoDias = 5 * 24 * 60 * 60 * 1000;
    const inicioPeriodo = new Date(
      referencia.getTime() - cincoDias
    );

    // Conta utilizações anteriores concluídas
    const utilizacoes = this.historico.filter((ticket) => {
      return (
        ticket.placa === placa &&
        ticket.tipoCliente === "Avulso" &&
        !ticket.estaAberto() &&
        ticket.saida >= inicioPeriodo &&
        ticket.saida <= referencia
      );
    });

    return utilizacoes.length >= 3;
  }
  
  regularizarPagamento(placa) {
    // Verifica se a placa está bloqueada
    if (!this.placasBloqueadas.has(placa)) {
      throw new Error("Esta placa não possui bloqueio.");
    }

    // Localiza os tickets com pagamento pendente
    const pendencias = this.historico.filter((ticket) => {
      return (
        ticket.placa === placa &&
        !ticket.estaAberto() &&
        ticket.valorPago < ticket.valorDevido
      );
    });

    if (pendencias.length === 0) {
      throw new Error("Nenhuma pendência encontrada.");
    }

    // Calcula o total da dívida
    const totalPendente = pendencias.reduce(
      (total, ticket) =>
        total + (ticket.valorDevido - ticket.valorPago),
      0
    );

    // Registra a quitação das pendências
    for (const ticket of pendencias) {
      ticket.valorPago = ticket.valorDevido;
    }

    // Desbloqueia a placa
    this.placasBloqueadas.delete(placa);
  
    return totalPendente;
  }

  salvarEmCSV(caminhoArquivo) {
    const linhas = [];

    for (const ticket of this.historico) {
      const linha = [
        ticket.placa,
        ticket.tipoCliente,
        ticket.entrada.toISOString(),
        ticket.saida ? ticket.saida.toISOString() : "",
        ticket.custo,
        ticket.identificadorDesconto,
        ticket.valorDesconto,
        ticket.valorDevido,
        ticket.valorPago
      ];

      linhas.push(linha.join(","));
    }

    fs.writeFileSync(
      caminhoArquivo,
      linhas.join("\n"),
      "utf8"
    );
  }
  
  carregarDeCSV(caminhoArquivo) {
    if (!fs.existsSync(caminhoArquivo)) {
      throw new Error("Arquivo de tickets não encontrado.");
    }

    const conteudo = fs.readFileSync(caminhoArquivo, "utf8");
    const linhas = conteudo.split(/\r?\n/).filter(
      linha => linha.trim() !== ""
    );

    const novoHistorico = [];
    const novosEstacionados = new Map();
    const novasPlacasBloqueadas = new Set();

    for (const linha of linhas) {
      const campos = linha.split(",");

      if (campos.length !== 9) {
        throw new Error("Linha inválida no CSV de tickets.");
      }

      const [
        placa,
        tipoCliente,
        entrada,
        saida,
        custo,
        identificadorDesconto,
        valorDesconto,
        valorDevido,
        valorPago
      ] = campos;

      const ticket = new TicketEstacionamento(
        placa,
        tipoCliente,
        entrada
      );

      if (saida !== "") {
        ticket.registrarSaida(
          saida,
          Number(custo),
          identificadorDesconto,
          Number(valorDesconto),
          Number(valorPago)
        );

        if (ticket.valorDevido !== Number(valorDevido)) {
          throw new Error("Valor devido inconsistente no CSV.");
        }

        if (
          tipoCliente === "Avulso" &&
          ticket.valorPago < ticket.valorDevido
        ) {
          novasPlacasBloqueadas.add(placa);
        }
      } else {
        if (novosEstacionados.has(placa)) {
          throw new Error("Veículo duplicado no estacionamento.");
        }

        novosEstacionados.set(placa, ticket);
      }

      novoHistorico.push(ticket);
    }

    this.historico = novoHistorico;
    this.veiculosEstacionados = novosEstacionados;
    this.placasBloqueadas = novasPlacasBloqueadas;

    return this.historico.length;
  }
}
