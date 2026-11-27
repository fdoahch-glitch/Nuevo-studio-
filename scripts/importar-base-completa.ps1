#requires -Version 5.1
<#
Copia íntegramente la versión aprobada de Atrapacuentos Studio a Nuevo-studio-.
No elimina archivos del destino. Comprueba el árbol de origen antes de copiar.
Requiere Git instalado y credenciales GitHub configuradas para poder hacer push.
#>
$ErrorActionPreference = "Stop"
$sourceUrl = "https://github.com/fdoahch-glitch/Atrapacuentos-studio.git"
$targetUrl = "https://github.com/fdoahch-glitch/Nuevo-studio-.git"
$targetBranch = "integracion-babylon-webgpu"
$expectedTree = "a96c6e0dcd04762689da8d5898ab72818aff0e03"
$work = Join-Path $env:TEMP ("nuevo-studio-import-" + [guid]::NewGuid().ToString("N"))
$source = Join-Path $work "source"
$target = Join-Path $work "target"

if (-not (Get-Command git -ErrorAction SilentlyContinue)) {
  throw "Git no está instalado. Instala Git for Windows y vuelve a ejecutar este script."
}
New-Item -ItemType Directory -Path $work -Force | Out-Null

try {
  Write-Host "1/5 Clonando el Studio original aprobado..."
  git clone --filter=blob:none $sourceUrl $source
  if ($LASTEXITCODE -ne 0) { throw "No se pudo clonar el repositorio original." }
  git -C $source checkout main
  if ($LASTEXITCODE -ne 0) { throw "No se pudo seleccionar main en el original." }

  $actualTree = (git -C $source rev-parse "HEAD^{tree}").Trim()
  if ($actualTree -ne $expectedTree) {
    throw "El árbol del original cambió. Esperado: $expectedTree; encontrado: $actualTree. Se detuvo para evitar copiar una versión distinta."
  }

  Write-Host "2/5 Clonando Nuevo-studio-..."
  git clone $targetUrl $target
  if ($LASTEXITCODE -ne 0) { throw "No se pudo clonar Nuevo-studio-." }
  git -C $target checkout $targetBranch
  if ($LASTEXITCODE -ne 0) { throw "No se pudo seleccionar la rama $targetBranch en Nuevo-studio-." }

  Write-Host "3/5 Copiando todos los archivos originales sin borrar archivos del destino..."
  $copy = @(
    $source, $target, "/E", "/COPY:DAT", "/DCOPY:DAT", "/R:2", "/W:2",
    "/XD", (Join-Path $source ".git"),
    "/XF", "desktop.ini"
  )
  & robocopy @copy
  $rc = $LASTEXITCODE
  if ($rc -ge 8) { throw "Robocopy informó un error ($rc)." }

  Write-Host "4/5 Comprobando los archivos originales..."
  $manifestPath = Join-Path $target "baseline/original-manifest.json"
  if (-not (Test-Path $manifestPath)) { throw "No existe baseline/original-manifest.json en el destino." }
  $manifest = Get-Content $manifestPath -Raw | ConvertFrom-Json
  $bad = @()
  foreach ($entry in $manifest.files) {
    $p = Join-Path $target ([string]$entry.path)
    if (-not (Test-Path -LiteralPath $p -PathType Leaf)) {
      $bad += "$($entry.path): FALTA"
      continue
    }
    $actualSize = (Get-Item -LiteralPath $p).Length
    $actualBlob = (git -C $target hash-object -- ([string]$entry.path)).Trim()
    if ($actualSize -ne [long]$entry.size -or $actualBlob -ne [string]$entry.sha) {
      $bad += "$($entry.path): CONTENIDO DISTINTO"
    }
  }
  if ($bad.Count -gt 0) {
    $bad | ForEach-Object { Write-Error $_ }
    throw "La comprobación de preservación no pasó. No se hará push."
  }

  Write-Host "5/5 Creando commit y subiendo todo a GitHub..."
  git -C $target add -A
  if ($LASTEXITCODE -ne 0) { throw "git add falló." }
  git -C $target commit -m "feat: importar base completa de Atrapacuentos Studio sin eliminar funciones"
  if ($LASTEXITCODE -ne 0) { throw "No se creó el commit. Si no hay cambios, revisa el estado del repositorio." }
  git -C $target push origin $targetBranch
  if ($LASTEXITCODE -ne 0) { throw "El push falló. Comprueba tu inicio de sesión de GitHub y vuelve a ejecutar." }

  Write-Host ""
  Write-Host "IMPORTACIÓN COMPLETADA. Revisa GitHub Actions para el informe de regresión y la compilación Windows."
  Write-Host "Repositorio: https://github.com/fdoahch-glitch/Nuevo-studio-/tree/$targetBranch"
}
finally {
  Write-Host "Carpeta temporal: $work"
  Write-Host "No se borra automáticamente, para permitir revisar cualquier error."
}
