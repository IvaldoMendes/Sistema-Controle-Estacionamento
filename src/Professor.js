
import { Cliente } from "./Cliente.js";

export class Professor extends Cliente {
  constructor(documento, nome) {
    super(documento, nome);
  }

  adicionarPlaca(placa) {
    if (!this.placas.has(placa) && this.placas.size >= 2) {
      throw new Error(
        "O professor pode cadastrar no máximo 2 veículos."
      );
    }

    super.adicionarPlaca(placa);
  }

  calcularCusto() {
    return 0;
  }
}
