/**
 * Gestor aditivo del motor 3D para Atrapacuentos Studio.
 * No sustituye Canvas 2D, Nativo.lector/WebGL2 ni el backend Rust/wgpu.
 * Cargar Babylon.js localmente y pasar su namespace como argumento.
 */
export class GestorMotor3D {
  constructor({ canvas, BABYLON, preferirWebGPU = true, antialias = true, adaptToDeviceRatio = true } = {}) {
    if (!canvas) throw new TypeError("GestorMotor3D requiere un canvas dedicado.");
    if (!BABYLON?.Engine) throw new TypeError("No se recibió el namespace Babylon.js.");
    this.canvas = canvas;
    this.BABYLON = BABYLON;
    this.preferirWebGPU = preferirWebGPU;
    this.antialias = antialias;
    this.adaptToDeviceRatio = adaptToDeviceRatio;
    this.engine = null;
    this.tipo = "no-iniciado";
    this.dispuesto = false;
  }

  async iniciar() {
    if (this.dispuesto) throw new Error("El gestor ya fue destruido.");
    if (this.engine) return this.estado();

    if (this.preferirWebGPU && await this._webgpuDisponible()) {
      try {
        const motorGPU = new this.BABYLON.WebGPUEngine(this.canvas, {
          antialias: this.antialias,
          adaptToDeviceRatio: this.adaptToDeviceRatio,
          powerPreference: "high-performance"
        });
        await motorGPU.initAsync();
        this.engine = motorGPU;
        this.tipo = "webgpu";
        return this.estado();
      } catch (error) {
        console.warn("[Studio 3D] WebGPU no pudo inicializarse; se conserva la ruta WebGL2.", error);
      }
    }

    if (!this.BABYLON.Engine.IsSupported()) {
      throw new Error("Este dispositivo no ofrece WebGL compatible con Babylon.js.");
    }
    this.engine = new this.BABYLON.Engine(this.canvas, this.antialias, {
      adaptToDeviceRatio: this.adaptToDeviceRatio,
      powerPreference: "high-performance",
      preserveDrawingBuffer: false,
      stencil: true,
      disableWebGL2Support: false
    });
    this.tipo = "webgl2";
    return this.estado();
  }

  async _webgpuDisponible() {
    if (!globalThis.isSecureContext || !("gpu" in navigator) || !this.BABYLON.WebGPUEngine) return false;
    try {
      if (typeof this.BABYLON.WebGPUEngine.IsSupportedAsync === "function") {
        return await this.BABYLON.WebGPUEngine.IsSupportedAsync();
      }
      return Boolean(await navigator.gpu.requestAdapter());
    } catch {
      return false;
    }
  }

  redimensionar() {
    if (this.engine && !this.dispuesto) this.engine.resize();
  }

  estado() {
    return Object.freeze({
      tipo: this.tipo,
      activo: Boolean(this.engine),
      webgpuDisponible: Boolean(globalThis.isSecureContext && globalThis.navigator?.gpu),
      webgl2Disponible: Boolean(this.BABYLON.Engine?.IsSupported?.())
    });
  }

  destruir() {
    if (this.dispuesto) return;
    this.dispuesto = true;
    if (this.engine) this.engine.dispose();
    this.engine = null;
    this.tipo = "destruido";
  }
}
