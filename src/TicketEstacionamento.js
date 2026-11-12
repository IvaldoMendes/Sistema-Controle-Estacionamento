
export class TicketEstacionamento {
  constructor(placa, tipoCliente, entrada = new Date()) {
    const dataEntrada = new Date(entrada);

    if (Number.isNaN(dataEntrada.getTime())) {
      throw new Error("Data de entrada inválida.");
    }

    this.placa = placa;
    this.tipoCliente = tipoCliente;
    this.entrada = dataEntrada;

    this.saida = null;
    this.custo = 0;
    this.identificadorDesconto = "nenhum";
    this.valorDesconto = 0;
    this.valorDevido = 0;
    this.valorPago = 0;
  }

  registrarSaida(
    saida,
    custo,
    identificadorDesconto = "nenhum",
    valorDesconto = 0,
    valorPago = 0
  ) {
    if (this.saida !== null) {
      throw new Error("A saída já foi registrada.");
    }

    const dataSaida = new Date(saida);

    if (
      Number.isNaN(dataSaida.getTime()) ||
      dataSaida < this.entrada
    ) {
      throw new Error("Data de saída inválida.");
    }

    if (
      !Number.isFinite(custo) ||
      !Number.isFinite(valorDesconto) ||
      !Number.isFinite(valorPago) ||
      custo < 0 ||
      valorDesconto < 0 ||
      valorDesconto > custo ||
      valorPago < 0
    ) {
      throw new Error("Valores de cobrança inválidos.");
    }

    this.saida = dataSaida;
    this.custo = custo;
    this.identificadorDesconto = identificadorDesconto;
    this.valorDesconto = valorDesconto;
    this.valorDevido = custo - valorDesconto;
    this.valorPago = valorPago;
  }

  estaAberto() {
    return this.saida === null;
  }
}
