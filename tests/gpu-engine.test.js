import { describe, it, expect, vi } from "vitest";
import { GestorMotor3D } from "../integracion/gpu-engine.js";

describe("GestorMotor3D", () => {
  it("rechaza inicialización sin canvas", () => {
    expect(() => new GestorMotor3D({ BABYLON: { Engine: class {} } })).toThrow(/canvas/);
  });

  it("rechaza namespace Babylon incompleto", () => {
    expect(() => new GestorMotor3D({ canvas: {}, BABYLON: {} })).toThrow(/Babylon/);
  });

  it("inicia con WebGL2 cuando WebGPU no se solicita", async () => {
    class Engine {
      static IsSupported = () => true;
      constructor(canvas) { this.canvas = canvas; this.disposed = false; }
      resize() {}
      dispose() { this.disposed = true; }
    }
    const canvas = {};
    const gestor = new GestorMotor3D({ canvas, BABYLON: { Engine }, preferirWebGPU: false });
    const estado = await gestor.iniciar();
    expect(estado.tipo).toBe("webgl2");
    gestor.destruir();
    expect(gestor.tipo).toBe("destruido");
  });
});
