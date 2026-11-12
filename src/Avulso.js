
import { Tarifas } from "./Tarifas.js";

export class Avulso {
  constructor(placa) {
    this.placa = placa;
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

    const inicioDia = Date.UTC(
      inicio.getFullYear(),
      inicio.getMonth(),
      inicio.getDate()
    );

    const fimDia = Date.UTC(
      fim.getFullYear(),
      fim.getMonth(),
      fim.getDate()
    );

    const diasExtras = Math.round(
      (fimDia - inicioDia) / 86400000
    );

    // Ao atravessar a meia-noite, cobra diárias.
    if (diasExtras > 0) {
      return (diasExtras + 1) * Tarifas.VALOR_DIARIA_AVULSO;
    }

    const minutos = (fim - inicio) / 60000;
    const horas = Math.max(1, Math.ceil(minutos / 60));

    if (horas > 6) {
      return Tarifas.VALOR_DIARIA_AVULSO;
    }

    return horas * Tarifas.VALOR_HORA_AVULSO;
  }
}
