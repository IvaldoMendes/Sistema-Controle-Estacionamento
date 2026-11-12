
import { Cliente } from "./Cliente.js";
import fs from "node:fs";
import { Professor } from "./Professor.js";
import { Estudante } from "./Estudante.js";
import { Empresa } from "./Empresa.js";

export class CadastroClientes {
  constructor() {
    // Clientes identificados por CPF ou CNPJ
    this.clientes = new Map();

    // Placas associadas aos proprietários
    this.proprietariosPorPlaca = new Map();
  }

  cadastrarCliente(cliente) {
    if (!(cliente instanceof Cliente)) {
      throw new Error("Cliente inválido.");
    }

    if (this.clientes.has(cliente.documento)) {
      throw new Error("Cliente já cadastrado.");
    }

    for (const placa of cliente.placas) {
      if (this.proprietariosPorPlaca.has(placa)) {
        throw new Error("Placa já cadastrada no sistema.");
      }
    }

    this.clientes.set(cliente.documento, cliente);

    for (const placa of cliente.placas) {
      this.proprietariosPorPlaca.set(placa, cliente);
    }
  }

  buscarCliente(documento) {
    return this.clientes.get(documento) ?? null;
  }

  buscarPorPlaca(placa) {
    return this.proprietariosPorPlaca.get(placa) ?? null;
  }

  adicionarPlaca(documento, placa) {
    const cliente = this.buscarCliente(documento);

    if (!cliente) {
      throw new Error("Cliente não encontrado.");
    }

    if (this.proprietariosPorPlaca.has(placa)) {
      throw new Error("Placa já cadastrada no sistema.");
    }

    cliente.adicionarPlaca(placa);
    this.proprietariosPorPlaca.set(placa, cliente);
  }

  removerPlaca(documento, placa) {
    const cliente = this.buscarCliente(documento);

    if (!cliente) {
      throw new Error("Cliente não encontrado.");
    }

    if (!cliente.placas.has(placa)) {
      throw new Error("Placa não pertence ao cliente.");
    }

    cliente.removerPlaca(placa);
    this.proprietariosPorPlaca.delete(placa);
  }

  listarClientes() {
    return [...this.clientes.values()];
  }
  
  salvarEmCSV(caminhoArquivo) {
    const linhas = [];

    for (const cliente of this.clientes.values()) {
      const placas = [...cliente.placas];

      let linha;

      if (cliente instanceof Professor) {
        linha = [
          cliente.documento,
          cliente.nome,
          "Professor",
          ...placas
        ];
      } else if (cliente instanceof Estudante) {
        linha = [
          cliente.documento,
          cliente.nome,
          cliente.saldo,
          "Estudante",
          ...placas
        ];
      
      } else if (cliente instanceof Empresa) {
        linha = [
          cliente.documento,
          cliente.nome,
          cliente.debito,
          "Empresa",
          cliente.inadimplente,
          ...placas
        ];
      } else {
        throw new Error("Tipo de cliente desconhecido.");
      }

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
      throw new Error("Arquivo CSV não encontrado.");
    }

    const conteudo = fs.readFileSync(caminhoArquivo, "utf8");
    const linhas = conteudo.split(/\r?\n/).filter(
      linha => linha.trim() !== ""
    );

    for (const linha of linhas) {
      const campos = linha.split(",").map(
        campo => campo.trim()
      );

      const documento = campos[0];
      const nome = campos[1];

      let cliente;
      let placas;

      if (campos[2] === "Professor") {
        cliente = new Professor(documento, nome);
        placas = campos.slice(3);

      } else if (campos[3] === "Estudante") {
        const saldo = Number(campos[2]);
        cliente = new Estudante(documento, nome, saldo);
        placas = campos.slice(4);

      } else if (campos[3] === "Empresa") {
        const debito = Number(campos[2]);

        cliente = new Empresa(documento, nome);
        cliente.debito = debito;

        if (
          campos[4] === "true" ||
          campos[4] === "false"
        ) {
          cliente.inadimplente = campos[4] === "true";
          placas = campos.slice(5);
        } else {
          // Compatibilidade com arquivos CSV antigos
          placas = campos.slice(4);
        }

      } else {
        throw new Error("Tipo de cliente desconhecido no CSV.");
      }

      for (const placa of placas) {
        if (placa !== "") {
          cliente.adicionarPlaca(placa);
        }
      }

      this.cadastrarCliente(cliente);
    }

    return this.listarClientes().length;
  }
}
