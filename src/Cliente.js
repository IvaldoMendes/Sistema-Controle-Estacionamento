
export class Cliente {
  constructor(documento, nome) {
    this.documento = documento;
    this.nome = nome;
    this.placas = new Set();
  }

  adicionarPlaca(placa) {
    if (this.placas.has(placa)) {
      throw new Error("Esta placa já está cadastrada.");
    }

    this.placas.add(placa);
  }

  removerPlaca(placa) {
    return this.placas.delete(placa);
  }

  calcularCusto() {
    throw new Error(
      "O cálculo deve ser implementado pela subclasse."
    );
  }
}
