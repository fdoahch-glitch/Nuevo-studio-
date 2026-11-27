# Integración aditiva Babylon.js + WebGPU

## Principio de preservación
Esta capa es complementaria. No reemplaza ni elimina:
- El editor, composición y dibujo Canvas 2D.
- El renderizador WebGL2 existente de `web/js/nativo_gpu.js` y su ruta de exportación.
- El puente Tauri/Rust, `wgpu`, FFmpeg, IA, modelos, texturas, audio, animaciones ni herramientas existentes.

Babylon.js administra una superficie 3D dedicada. WebGPU se intenta primero y WebGL2 de Babylon actúa como alternativa. La ruta WebGL2 existente sigue siendo independiente.

## Estado de esta entrega
- Se incorpora un gestor aislado de motor 3D en `integracion/gpu-engine.js`.
- No está conectado aún al HTML original: primero se debe importar y verificar íntegramente la base de 79 archivos.
- No se incluye una copia de Babylon.js ni se depende de una CDN en ejecución. La dependencia debe instalarse y fijarse a una versión en el proyecto tras recuperar la estructura original.
- No se declara compatibilidad WebGPU hasta probarla en el WebView de Tauri y en el equipo Windows objetivo.

## Contrato de integración
1. Reservar un canvas propio para el viewport 3D; no reutilizar `#cv` ni el canvas de exportación.
2. Cargar Babylon.js desde una dependencia local empaquetada con la aplicación.
3. Crear `GestorMotor3D({ canvas, BABYLON })` e invocar `await iniciar()`.
4. Crear la escena Babylon solo después de conocer `estado().tipo`.
5. Mantener el dibujo 2D, timeline, selección, herramientas y exportación actual funcionando aunque falle Babylon.
6. En resize llamar `redimensionar()`; al cerrar el viewport llamar `destruir()`.
7. Las escenas y recursos 3D nuevos deben tener ciclo de vida propio y no modificar los originales.

## Secuencia obligatoria
1. Importar la base completa y validar hashes del manifiesto.
2. Ejecutar regresión de archivos y pruebas existentes.
3. Integrar el viewport en la interfaz sin alterar los controles actuales.
4. Incorporar importación GLB/glTF, materiales, luces, cámaras y animaciones como herramientas adicionales.
5. Añadir pruebas WebGPU/WebGL2 y exportación.
6. Compilar e instalar en Windows; adjuntar artefactos solo después de que CI confirme el resultado.

## Seguridad y compatibilidad
WebGPU requiere contexto seguro y soporte del WebView/controlador. La disponibilidad del navegador no garantiza que el dispositivo pueda crear el dispositivo GPU. Por eso la inicialización real se intenta y, si falla, se conserva la ruta WebGL2. No se fuerza WebGPU ni se desactiva el fallback.
