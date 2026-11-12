
import readline from "node:readline";
import { Professor } from "./Professor.js";
import { Estudante } from "./Estudante.js";
import { Empresa } from "./Empresa.js";

export class InterfaceUsuario {
  constructor(app) {
    this.app = app;

    this.rl = readline.createInterface({
      input: process.stdin,
      output: process.stdout
    });
  }

  perguntar(mensagem) {
    return new Promise((resolve) => {
      this.rl.question(mensagem, resolve);
    });
  }

  formatarData(data) {
    return new Date(data).toLocaleString("pt-BR", {
      timeZone: "America/Sao_Paulo"
    });
  }

  formatarValor(valor) {
    return Number(valor).toLocaleString("pt-BR", {
      style: "currency",
      currency: "BRL"
    });
  }

  mostrarMenu() {
    console.log("\n=== SISTEMA DE CONTROLE DE ESTACIONAMENTO ===");
    console.log("1 - Cadastrar cliente");
    console.log("2 - Registrar entrada");
    console.log("3 - Registrar saída");
    console.log("4 - Consultar veículo");
    console.log("5 - Listar veículos estacionados");
    console.log("6 - Consultar relatórios");
    console.log("7 - Salvar dados");
    console.log("0 - Sair");
  }

  async cadastrarCliente() {
    console.log("\n=== CADASTRO DE CLIENTES ===");
    console.log("1 - Professor");
    console.log("2 - Estudante");
    console.log("3 - Empresa");

    const tipo = (await this.perguntar(
      "\nEscolha a categoria: "
    )).trim();

    if (!["1", "2", "3"].includes(tipo)) {
      console.log("Categoria inválida.");
      return;
    }

    const documento = (await this.perguntar(
      "Digite o CPF ou CNPJ: "
    )).trim();

    const nome = (await this.perguntar(
      "Digite o nome: "
    )).trim();

    const placa = (await this.perguntar(
      "Digite a placa do veículo: "
    )).trim().toUpperCase();

    if (!documento || !nome || !placa) {
      console.log("Todos os campos são obrigatórios.");
      return;
    }

    try {
      let cliente;

      if (tipo === "1") {
        cliente = new Professor(documento, nome);

      } else if (tipo === "2") {
        const saldoTexto = (await this.perguntar(
          "Digite o saldo inicial (R$): "
        )).trim().replace(",", ".");

        if (saldoTexto === "") {
          console.log("Saldo obrigatório.");
          return;
        }

        const saldo = Number(saldoTexto);

        if (!Number.isFinite(saldo) || saldo < 0) {
          console.log("Saldo inválido.");
          return;
        }

        cliente = new Estudante(documento, nome, saldo);

      } else {
        cliente = new Empresa(documento, nome);
      }

      cliente.adicionarPlaca(placa);
      this.app.cadastroClientes.cadastrarCliente(cliente);

      console.log("\nCliente cadastrado com sucesso!");
      console.log("Nome:", cliente.nome);
      console.log("Documento:", cliente.documento);
      console.log("Placa:", placa);

    } catch (erro) {
      console.log(
        "\nErro ao cadastrar cliente:",
        erro.message
      );
    }
  }

  async registrarEntrada() {
    console.log("\n=== REGISTRAR ENTRADA ===");

    const placa = (await this.perguntar(
      "Digite a placa do veículo: "
    )).trim().toUpperCase();

    if (!placa) {
      console.log("A placa é obrigatória.");
      return;
    }

    try {
      const ticket =
        this.app.registroEstacionamento.autorizarEntrada(
          placa
        );

      console.log("\nEntrada autorizada com sucesso!");
      console.log("Placa:", ticket.placa);
      console.log("Categoria:", ticket.tipoCliente);
      console.log(
        "Data e hora:",
        this.formatarData(ticket.entrada)
      );

    } catch (erro) {
      console.log(
        "\nEntrada não autorizada:",
        erro.message
      );
    }
  }

  async registrarSaida() {
    console.log("\n=== REGISTRAR SAÍDA ===");

    const placa = (await this.perguntar(
      "Digite a placa do veículo: "
    )).trim().toUpperCase();

    if (!placa) {
      console.log("A placa é obrigatória.");
      return;
    }

    const ticketAberto =
      this.app.registroEstacionamento.consultarVeiculo(placa);

    if (!ticketAberto) {
      console.log("\nVeículo não está estacionado.");
      return;
    }

    let pagamentoAceito = true;

    if (ticketAberto.tipoCliente === "Avulso") {
      const resposta = (await this.perguntar(
        "O pagamento foi realizado? (S/N): "
      )).trim().toUpperCase();

      if (resposta !== "S" && resposta !== "N") {
        console.log("Resposta inválida. Saída cancelada.");
        return;
      }

      pagamentoAceito = resposta === "S";
    }

    try {
      const ticket =
        this.app.registroEstacionamento.registrarSaida(
          placa,
          new Date(),
          undefined,
          pagamentoAceito
        );

      console.log("\nSaída registrada com sucesso!");
      console.log("Placa:", ticket.placa);
      console.log("Categoria:", ticket.tipoCliente);
      console.log("Entrada:", this.formatarData(ticket.entrada));
      console.log("Saída:", this.formatarData(ticket.saida));
      console.log("Custo:", this.formatarValor(ticket.custo));
      console.log(
        "Desconto:",
        this.formatarValor(ticket.valorDesconto)
      );
      console.log(
        "Valor devido:",
        this.formatarValor(ticket.valorDevido)
      );
      console.log(
        "Valor pago:",
        this.formatarValor(ticket.valorPago)
      );

      if (ticket.tipoCliente === "Empresa") {
        console.log(
          "Cobrança registrada no débito da empresa."
        );
      }

      if (
        ticket.tipoCliente === "Avulso" &&
        !pagamentoAceito
      ) {
        console.log(
          "Pagamento pendente. Placa bloqueada para novas entradas."
        );
      }

    } catch (erro) {
      console.log(
        "\nErro ao registrar saída:",
        erro.message
      );
    }
  }

  async consultarRelatorios() {
    let continuar = true;
    const relatorios = this.app.relatoriosGerenciais;

    while (continuar) {
      console.log("\n=== RELATÓRIOS GERENCIAIS ===");
      console.log("1 - Total arrecadado por período");
      console.log("2 - Arrecadação por categoria");
      console.log("3 - Histórico por placa");
      console.log("4 - Top 10 veículos mais frequentes");
      console.log("5 - Veículos estacionados");
      console.log("6 - Placas bloqueadas");
      console.log("0 - Voltar ao menu principal");

      const opcao = (await this.perguntar(
        "\nEscolha uma opção do relatório: "
      )).trim();

      try {
        switch (opcao) {
          case "1":
          case "2": {
            const inicioTexto = (await this.perguntar(
              "Data inicial (AAAA-MM-DD): "
            )).trim();

            const fimTexto = (await this.perguntar(
              "Data final (AAAA-MM-DD): "
            )).trim();

            const dataValida = (texto) => {
              if (!/^\d{4}-\d{2}-\d{2}$/.test(texto)) {
                return false;
              }

              const data = new Date(`${texto}T12:00:00-03:00`);

              return (
                !Number.isNaN(data.getTime()) &&
                data.toISOString().slice(0, 10) === texto
              );
            };

            if (!dataValida(inicioTexto) || !dataValida(fimTexto)) {
              console.log("Data inválida. Use AAAA-MM-DD.");
              break;
            }

            const inicio = new Date(
              `${inicioTexto}T00:00:00-03:00`
            );

            const fim = new Date(
              `${fimTexto}T23:59:59.999-03:00`
            );

            if (fim < inicio) {
              console.log("Período inválido.");
              break;
            }

            if (opcao === "1") {
              const total = relatorios.totalArrecadado(
                inicio,
                fim
              );

              console.log(
                "\nTotal arrecadado:",
                this.formatarValor(total)
              );

            } else {
              const valores =
                relatorios.arrecadacaoPorCategoria(
                  inicio,
                  fim
                );

              console.log("\n=== ARRECADAÇÃO POR CATEGORIA ===");

              for (const [categoria, valor] of Object.entries(valores)) {
                console.log(
                  `${categoria}: ${this.formatarValor(valor)}`
                );
              }
            }

            break;
          }

          case "3": {
            const placa = (await this.perguntar(
              "Digite a placa: "
            )).trim().toUpperCase();

            const historico = relatorios.historicoPorPlaca(
              placa
            );

            console.log("\n=== HISTÓRICO POR PLACA ===");

            if (historico.length === 0) {
              console.log("Nenhum registro encontrado.");
            } else {
              historico.forEach((ticket, indice) => {
                console.log(`\nRegistro ${indice + 1}`);
                console.log("Placa:", ticket.placa);
                console.log("Categoria:", ticket.tipoCliente);
                console.log(
                  "Entrada:",
                  this.formatarData(ticket.entrada)
                );
                console.log(
                  "Saída:",
                  ticket.saida
                    ? this.formatarData(ticket.saida)
                    : "Veículo ainda estacionado"
                );
                console.log(
                  "Valor devido:",
                  this.formatarValor(ticket.valorDevido)
                );
                console.log(
                  "Valor pago:",
                  this.formatarValor(ticket.valorPago)
                );
              });
            }

            break;
          }

          case "4": {
            const top10 = relatorios.top10VeiculosFrequentes();

            console.log("\n=== TOP 10 VEÍCULOS FREQUENTES ===");

            if (top10.length === 0) {
              console.log("Nenhuma saída registrada.");
            } else {
              top10.forEach((item, indice) => {
                console.log(
                  `${indice + 1}. ${item.placa} - ${item.quantidade} saída(s)`
                );
              });
            }

            break;
          }

          case "5": {
            const veiculos =
              relatorios.listarVeiculosEstacionados();

            console.log("\n=== VEÍCULOS ESTACIONADOS ===");

            if (veiculos.length === 0) {
              console.log("Nenhum veículo estacionado.");
            } else {
              veiculos.forEach((ticket) => {
                console.log(
                  `${ticket.placa} - ${ticket.tipoCliente} - Entrada: ${this.formatarData(ticket.entrada)}`
                );
              });

              console.log("Total:", veiculos.length);
            }

            break;
          }

          case "6": {
            const placas = relatorios.listarPlacasBloqueadas();

            console.log("\n=== PLACAS BLOQUEADAS ===");

            if (placas.length === 0) {
              console.log("Nenhuma placa bloqueada.");
            } else {
              placas.forEach((placa) => {
                console.log("Placa:", placa);
              });
            }

            break;
          }

          case "0":
            continuar = false;
            break;

          default:
            console.log("Opção inválida.");
        }
      } catch (erro) {
        console.log(
          "\nErro ao consultar relatório:",
          erro.message
        );
      }
    }
  }

  async iniciar() {
    let continuar = true;

    while (continuar) {
      this.mostrarMenu();

      const opcao = (await this.perguntar(
        "\nEscolha uma opção: "
      )).trim();

      switch (opcao) {
        case "1":
          await this.cadastrarCliente();
          break;

        case "2":
          await this.registrarEntrada();
          break;

        case "3":
          await this.registrarSaida();
          break;

        case "4": {
          const placa = (await this.perguntar(
            "\nDigite a placa do veículo: "
          )).trim().toUpperCase();

          const ticket =
            this.app.registroEstacionamento.consultarVeiculo(
              placa
            );

          if (ticket) {
            console.log("\nVeículo encontrado!");
            console.log("Placa:", ticket.placa);
            console.log("Categoria:", ticket.tipoCliente);
            console.log(
              "Entrada:",
              this.formatarData(ticket.entrada)
            );
          } else {
            console.log("\nVeículo não está estacionado.");
          }

          break;
        }

        case "5": {
          const veiculos =
            this.app.relatoriosGerenciais.listarVeiculosEstacionados();

          console.log("\n=== VEÍCULOS ESTACIONADOS ===");

          if (veiculos.length === 0) {
            console.log("Nenhum veículo estacionado.");
          } else {
            veiculos.forEach((ticket, indice) => {
              console.log(`\nVeículo ${indice + 1}`);
              console.log("Placa:", ticket.placa);
              console.log("Categoria:", ticket.tipoCliente);
              console.log(
                "Entrada:",
                this.formatarData(ticket.entrada)
              );
            });

            console.log(
              "\nTotal de veículos estacionados:",
              veiculos.length
            );
          }

          break;
        }

        case "6":
          await this.consultarRelatorios();
          break;

        case "7":
          console.log("\nSalvando dados do sistema...");

          try {
            this.app.salvarDados();
            console.log("Salvamento manual concluído.");
          } catch (erro) {
            console.log(
              "Erro ao salvar os dados:",
              erro.message
            );
          }

          break;

        case "0":
          console.log("Encerrando o sistema...");
          continuar = false;
          break;

        default:
          console.log("Opção ainda não implementada.");
      }
    }

    this.fechar();
  }

  fechar() {
    this.rl.close();
  }
}
