import test from "node:test";
import assert from "node:assert/strict";
import { GestorMotor3D } from "../integracion/gpu-engine.js";

test("exige un canvas", () => {
  assert.throws(() => new GestorMotor3D({ BABYLON: { Engine: class {} } }), /canvas/);
});

test("exige Babylon.js", () => {
  assert.throws(() => new GestorMotor3D({ canvas: {}, BABYLON: {} }), /Babylon/);
});

test("inicia WebGL2 cuando WebGPU no se solicita y libera el motor", async () => {
  class Engine {
    static IsSupported = () => true;
    constructor(canvas) { this.canvas = canvas; this.disposed = false; }
    resize() { this.resized = true; }
    dispose() { this.disposed = true; }
  }
  const gestor = new GestorMotor3D({ canvas: {}, BABYLON: { Engine }, preferirWebGPU: false });
  assert.equal((await gestor.iniciar()).tipo, "webgl2");
  gestor.redimensionar();
  assert.equal(gestor.engine.resized, true);
  const motor = gestor.engine;
  gestor.destruir();
  assert.equal(motor.disposed, true);
  assert.equal(gestor.tipo, "destruido");
});
