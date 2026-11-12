
import { Cliente } from "./Cliente.js";

export class Estudante extends Cliente {
  static CUSTO_FIXO_POR_INGRESSO = 10;

  constructor(documento, nome, saldo = 0) {
    super(documento, nome);
    this.saldo = saldo;
  }

  adicionarPlaca(placa) {
    if (!this.placas.has(placa) && this.placas.size >= 1) {
      throw new Error(
        "O estudante pode cadastrar apenas 1 veículo."
      );
    }

    super.adicionarPlaca(placa);
  }

  carregarSaldo(valor) {
    if (!Number.isFinite(valor) || valor <= 0) {
      throw new Error("O valor deve ser positivo.");
    }

    this.saldo += valor;
  }

  podeEntrar() {
    return this.saldo >= 0;
  }

  calcularCusto(entrada, saida) {
    const inicio = new Date(entrada);
    const fim = new Date(saida);

    if (
      Number.isNaN(inicio.getTime()) ||
      Number.isNaN(fim.getTime()) ||
      fim < inicio
    ) {
      throw new Error("Datas de estacionamento inválidas.");
    }

    const diaInicial = new Date(
      inicio.getFullYear(),
      inicio.getMonth(),
      inicio.getDate()
    );

    const diaFinal = new Date(
      fim.getFullYear(),
      fim.getMonth(),
      fim.getDate()
    );

    const dias = Math.round(
      (Date.UTC(
        diaFinal.getFullYear(),
        diaFinal.getMonth(),
        diaFinal.getDate()
      ) -
        Date.UTC(
          diaInicial.getFullYear(),
          diaInicial.getMonth(),
          diaInicial.getDate()
        )) / 86400000
    );

    return (dias + 1) * Estudante.CUSTO_FIXO_POR_INGRESSO;
  }

  cobrar(valor) {
    if (!Number.isFinite(valor) || valor < 0) {
      throw new Error("Valor de cobrança inválido.");
    }

    this.saldo -= valor;
  }
}
