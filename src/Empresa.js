
import { Cliente } from "./Cliente.js";

export class Empresa extends Cliente {
  static VALOR_DIARIA = 30;
  static VALOR_MULTA = 20;

  constructor(documento, nome) {
    super(documento, nome);

    this.debito = 0;
    this.inadimplente = false;
  }

  podeEntrar() {
    return !this.inadimplente;
  }

  calcularCusto(entrada, saida) {
    const inicio = new Date(entrada);
    const fim = new Date(saida);

    if (
      Number.isNaN(inicio.getTime()) ||
      Number.isNaN(fim.getTime()) ||
      fim < inicio
    ) {
      throw new Error("Datas inválidas.");
    }

    const dataInicio = Date.UTC(
      inicio.getFullYear(),
      inicio.getMonth(),
      inicio.getDate()
    );

    const dataFim = Date.UTC(
      fim.getFullYear(),
      fim.getMonth(),
      fim.getDate()
    );

    const diasExtras = Math.round(
      (dataFim - dataInicio) / 86400000
    );

    const diaria = Empresa.VALOR_DIARIA;
    const multa = diasExtras * Empresa.VALOR_MULTA;

    return diaria + multa;
  }

  registrarDebito(valor) {
    if (!Number.isFinite(valor) || valor < 0) {
      throw new Error("Valor inválido.");
    }

    this.debito += valor;
  }

  bloquearPorInadimplencia() {
    this.inadimplente = true;
  }

  regularizarPagamento() {
    this.debito = 0;
    this.inadimplente = false;
  }
}
