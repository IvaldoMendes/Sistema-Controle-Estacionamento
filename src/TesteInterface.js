
import { App } from "./App.js";
import { InterfaceUsuario } from "./InterfaceUsuario.js";

const app = new App();

app.iniciar();

const interfaceUsuario = new InterfaceUsuario(app);

await interfaceUsuario.iniciar();
