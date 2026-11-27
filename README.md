# Nuevo Studio

Nueva línea de desarrollo basada en **Atrapacuentos Studio**.

## Regla inalterable de integración

Este repositorio debe conservar íntegramente el proyecto original aprobado. No se permite eliminar, sustituir, renombrar, simplificar ni desactivar funciones, archivos, recursos, motores, herramientas, modelos, sonidos, animaciones, flujos de trabajo ni capacidades existentes. Las mejoras se agregan y conectan con lo existente.

Base de referencia: https://github.com/fdoahch-glitch/Atrapacuentos-studio

## Mejoras acumulativas

- Babylon.js como motor 3D adicional.
- WebGPU como backend gráfico preferente cuando esté disponible.
- WebGL2 como alternativa de compatibilidad.
- Integración entre herramientas 2D existentes y el nuevo entorno 3D.
- Conservación de Tauri 2, Rust, wgpu, FFmpeg, Canvas 2D, WebGL2 y todas las funciones originales.
- Experiencia de uso guiada e intuitiva, sin recortar las herramientas avanzadas.

## Plataforma de entrega

La compilación, pruebas y empaquetado de esta nueva distribución se enfocan en **Windows x64**. Esto no autoriza eliminar código ni capacidades heredadas; únicamente define el destino de compilación de Nuevo Studio.

## Estado

Este repositorio comienza vacío. La copia íntegra del proyecto base (incluidos los recursos binarios y modelos) debe completarse y verificarse antes de considerar iniciada la integración funcional. No declarar una etapa terminada mientras falten archivos originales o fallen las pruebas de regresión.


## Rama de integración activa

El desarrollo se realiza en `integracion-babylon-webgpu`; `main` permanece sin mezclar con esta línea de trabajo.

### Componentes añadidos
- `integracion/gpu-engine.js`: inicialización Babylon.js con preferencia WebGPU y alternativa WebGL2.
- `tests/gpu-engine.test.js`: pruebas nativas de Node.js.
- `docs/INTEGRACION-BABYLON-WEBGPU.md`: arquitectura y contrato de integración.
- `package.json`: ejecuta las pruebas sin instalar dependencias externas.

### Importación íntegra de la base

Desde Windows, descarga esta rama y ejecuta PowerShell en la carpeta del repositorio:

```powershell
Set-ExecutionPolicy -Scope Process Bypass
.\scripts\importar-base-completa.ps1
```

El importador verifica que el repositorio original siga en el árbol aprobado, copia sus archivos sin borrar los añadidos y sube el resultado a esta rama. Si el árbol de origen cambió, la importación se detiene para evitar mezclar una versión distinta.

### Validación automática
Cada cambio relevante ejecuta en GitHub Actions la comparación de los 79 archivos originales y, si pasa, las pruebas y compilación del instalador Windows NSIS. La compilación aún debe ejecutarse después de importar la base completa.
