
import { Tarifas } from "./Tarifas.js";

// Classe base para os descontos
export class Desconto {
  constructor(identificador = "nenhum") {
    this.identificador = identificador;
  }

  calcularDesconto(valor) {
    if (!Number.isFinite(valor) || valor < 0) {
      throw new Error("Valor inválido para desconto.");
    }

    return 0;
  }
}

// Desconto de 20% para cliente frequente
export class DescontoClienteFrequente extends Desconto {
  constructor() {
    super("ClienteFrequente");
  }

  calcularDesconto(valor) {
    super.calcularDesconto(valor);

    return Number(
      (valor * Tarifas.DESCONTO_CLIENTE_FREQUENTE).toFixed(2)
    );
  }
}
