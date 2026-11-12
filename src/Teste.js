
import { CadastroClientes } from "./CadastroClientes.js";
import { RegistroDeEntradas_E_Saidas } from "./RegistroDeEntradas_E_Saidas.js";
import { Desconto } from "./Desconto.js";
import { RelatoriosGerenciais } from "./RelatoriosGerenciais.js";

const cadastro = new CadastroClientes();
const estacionamento = new RegistroDeEntradas_E_Saidas(cadastro);

const placa = "ABC1D23";

const entrada = new Date(2026, 10, 10, 10, 0);
const saida = new Date(2026, 10, 10, 12, 0);

// Cliente avulso entra normalmente
estacionamento.autorizarEntrada(placa, entrada);

// Cliente recusa o pagamento
const ticket = estacionamento.registrarSaida(
  placa,
  saida,
  new Desconto(),
  false
);

console.log("Valor devido: R$", ticket.valorDevido);
console.log("Valor pago: R$", ticket.valorPago);

console.log(
  "Placa bloqueada?",
  estacionamento.placasBloqueadas.has(placa)
);

console.log(
  "Veículo ainda estacionado?",
  estacionamento.consultarVeiculo(placa) !== null
);

// Tenta entrar novamente
try {
  estacionamento.autorizarEntrada(
    placa,
    new Date(2026, 10, 11, 10, 0)
  );
} catch (erro) {
  console.log("Nova entrada:", erro.message);
}

 
// Regulariza a dívida do cliente avulso
const valorRegularizado = estacionamento.regularizarPagamento(placa);

console.log("Valor regularizado: R$", valorRegularizado);

console.log(
  "Placa continua bloqueada?",
  estacionamento.placasBloqueadas.has(placa)
);

console.log(
  "Valor pago após regularização: R$",
  ticket.valorPago
);

// Testa uma nova entrada após a regularização
try {
  estacionamento.autorizarEntrada(
    placa,
    new Date(2026, 10, 11, 10, 0)
  );

  console.log("Nova entrada após pagamento: Autorizada");
} catch (erro) {
  console.log("Nova entrada após pagamento:", erro.message);
}


  // Testa os relatórios gerenciais
const relatorios = new RelatoriosGerenciais(
  estacionamento,
  cadastro
);

const inicio = new Date(2026, 10, 10);
const fim = new Date(2026, 10, 12);

console.log(
  "Total arrecadado: R$",
  relatorios.totalArrecadado(inicio, fim)
);

console.log(
  "Veículos estacionados:",
  relatorios.listarVeiculosEstacionados().length
);

console.log(
  "Placas bloqueadas:",
  relatorios.listarPlacasBloqueadas()
);

estacionamento.salvarEmCSV("tickets.csv");

console.log("Arquivo de tickets salvo com sucesso!");
console.log("Total de tickets:", estacionamento.historico.length);


console.log("\n--- TESTE DE RECUPERAÇÃO DOS TICKETS ---");

const estacionamentoRecuperado =
  new RegistroDeEntradas_E_Saidas(cadastro);

estacionamentoRecuperado.carregarDeCSV("tickets.csv");

console.log(
  "Tickets recuperados:",
  estacionamentoRecuperado.historico.length
);

console.log(
  "Veículos estacionados recuperados:",
  estacionamentoRecuperado.veiculosEstacionados.size
);

console.log(
  "Placas bloqueadas recuperadas:",
  [...estacionamentoRecuperado.placasBloqueadas]
);

console.log(
  "Veículo ABC1D23 está estacionado?",
  estacionamentoRecuperado.consultarVeiculo("ABC1D23") !== null
);

console.log("\n--- RELATÓRIO POR CATEGORIA ---");

const resultadoCategorias =
  relatorios.arrecadacaoPorCategoria(
    "2026-11-01T00:00:00",
    "2026-11-30T23:59:59"
  );

console.log(resultadoCategorias);


console.log("\n--- HISTÓRICO POR PLACA ---");

const historicoPlaca =
  relatorios.historicoPorPlaca("ABC1D23");

console.log("Total de registros:", historicoPlaca.length);

for (const ticket of historicoPlaca) {
  console.log({
    placa: ticket.placa,
    entrada: ticket.entrada,
    saida: ticket.saida,
    valorPago: ticket.valorPago
  });
}

// O FOR TERMINA AQUI

console.log("\n--- TOP 10 VEÍCULOS FREQUENTES ---");

const top10 = relatorios.top10VeiculosFrequentes();

console.log(top10);
