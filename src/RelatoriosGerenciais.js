
export class RelatoriosGerenciais {
  constructor(registroEstacionamento, cadastroClientes) {
    this.registroEstacionamento = registroEstacionamento;
    this.cadastroClientes = cadastroClientes;
  }

  totalArrecadado(inicio, fim) {
    const dataInicio = new Date(inicio);
    const dataFim = new Date(fim);

    if (
      Number.isNaN(dataInicio.getTime()) ||
      Number.isNaN(dataFim.getTime()) ||
      dataFim < dataInicio
    ) {
      throw new Error("Período inválido.");
    }

    return this.registroEstacionamento.historico
      .filter(ticket =>
        !ticket.estaAberto() &&
        ticket.saida >= dataInicio &&
        ticket.saida <= dataFim
      )
      .reduce((total, ticket) => total + ticket.valorPago, 0);
  }

  arrecadacaoPorCategoria(inicio, fim) {
    const dataInicio = new Date(inicio);
    const dataFim = new Date(fim);

    if (
      Number.isNaN(dataInicio.getTime()) ||
      Number.isNaN(dataFim.getTime()) ||
      dataFim < dataInicio
    ) {
      throw new Error("Período inválido.");
    }

    const arrecadacao = {
      Professor: 0,
      Estudante: 0,
      Empresa: 0,
      Avulso: 0
    };

    for (const ticket of this.registroEstacionamento.historico) {
      if (
        !ticket.estaAberto() &&
        ticket.saida >= dataInicio &&
        ticket.saida <= dataFim
      ) {
        arrecadacao[ticket.tipoCliente] += ticket.valorPago;
      }
    }

    return arrecadacao;
  }

  historicoPorPlaca(placa) {
    if (typeof placa !== "string" || placa.trim() === "") {
      throw new Error("Placa inválida.");
    }

    return this.registroEstacionamento.historico.filter(
      ticket => ticket.placa === placa
    );
  }

  top10VeiculosFrequentes() {
    const frequencia = new Map();

    for (const ticket of this.registroEstacionamento.historico) {
      if (!ticket.estaAberto()) {
        const quantidade = frequencia.get(ticket.placa) ?? 0;

        frequencia.set(ticket.placa, quantidade + 1);
      }
    }

    return [...frequencia.entries()]
      .map(([placa, quantidade]) => ({
        placa,
        quantidade
      }))
      .sort((a, b) =>
        b.quantidade - a.quantidade ||
        a.placa.localeCompare(b.placa)
      )
      .slice(0, 10);
  }

  listarVeiculosEstacionados() {
    return [
      ...this.registroEstacionamento.veiculosEstacionados.values()
    ];
  }

  listarPlacasBloqueadas() {
    return [
      ...this.registroEstacionamento.placasBloqueadas
    ];
  }
}
