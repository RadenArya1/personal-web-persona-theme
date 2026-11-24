<#
  =============================================================
  ARZ-WEB: NGINX HOME SERVER DEPLOYMENT SCRIPT
  Target: \\100.73.128.8\Data\AppData\nginx\config\www
  =============================================================
#>

param(
    [switch]$RunTest,
    [switch]$SkipTest,
    [switch]$PushGit,
    [string]$CommitMessage = ""
)

$sourceDir = $PSScriptRoot
$targetDir = "\\100.73.128.8\Data\AppData\nginx\config\www"

Write-Host "=========================================" -ForegroundColor Cyan
Write-Host "   ARZ-WEB: Memulai Deployment ke Nginx" -ForegroundColor Cyan
Write-Host "=========================================" -ForegroundColor Cyan
Write-Host "Sumber: $sourceDir"
Write-Host "Target: $targetDir"
Write-Host ""

# 0. Pre-Deployment TestSprite Validation Gate (Jika diminta atau via protokol pw)
if ($RunTest) {
    Write-Host "[PRE-DEPLOY] Menjalankan verifikasi TestSprite otonom..." -ForegroundColor Magenta
    $testRunner = Join-Path $sourceDir "testsprite_tests\testsprite-runner.js"
    if (Test-Path $testRunner) {
        node $testRunner runTests
        if ($LASTEXITCODE -ne 0) {
            Write-Host "[ERROR] Pengujian TestSprite mendeteksi kegagalan! Deployment ke Nginx DIBATALKAN." -ForegroundColor Red
            exit 1
        }
        Write-Host "[PRE-DEPLOY] ✅ Seluruh pengujian TestSprite lolos!" -ForegroundColor Green
    }
}

# 1. Cek Ketersediaan Jalur Network Share
if (!(Test-Path $targetDir)) {
    Write-Host "[ERROR] Target direktori Nginx tidak dapat diakses!" -ForegroundColor Red
    Write-Host "Pastikan Home Server (100.73.128.8) menyala dan koneksi jaringan/SMB aktif." -ForegroundColor Yellow
    exit 1
}

# 2. Safety Guard: Isolasi Eksklusif Sandbox Lab & TestSprite di Localhost (Zero-Leak ke Nginx)
# Memastikan berkas uji coba, lab, tester, dan token sensitif tidak pernah ada di server Nginx produksi
$prohibitedItems = @(
    "testsprite_tests",
    "lab",
    "auto-absen",
    "downloaded_skills",
    "scratch",
    "mcp_config.json",
    ".agents",
    "testsprite_vault.json",
    "rotate-testsprite.ps1",
    "testsprite-runner.js",
    ".puppeteer_profile",
    "Error_Absen",
    "attended_keys.json",
    "ethol-config.json",
    "docs",
    ".git"
)
foreach ($item in $prohibitedItems) {
    $remotePath = Join-Path $targetDir $item
    if (Test-Path $remotePath) {
        Write-Host "[GUARD] Membersihkan berkas uji coba/tester di server Nginx: $item" -ForegroundColor Yellow
        Remove-Item -Path $remotePath -Recurse -Force -ErrorAction SilentlyContinue
    }
}
$etholProfile = Join-Path $targetDir "ethol-notifier\.puppeteer_profile"
if (Test-Path $etholProfile) {
    Remove-Item -Path $etholProfile -Recurse -Force -ErrorAction SilentlyContinue
}
$etholPublicConfig = Join-Path $targetDir "ethol-notifier\ethol-config.json"
if (Test-Path $etholPublicConfig) {
    Remove-Item -Path $etholPublicConfig -Force -ErrorAction SilentlyContinue
}

Write-Host "[1/3] Menyalin file portal inti website (index.html)..." -ForegroundColor Yellow
Copy-Item -Path (Join-Path $sourceDir "index.html") -Destination $targetDir -Force
if (Test-Path (Join-Path $targetDir "keuangan.html")) {
    Remove-Item -Path (Join-Path $targetDir "keuangan.html") -Force -ErrorAction SilentlyContinue
}
if (Test-Path (Join-Path $targetDir "src\keuangan")) {
    Remove-Item -Recurse -Path (Join-Path $targetDir "src\keuangan") -Force -ErrorAction SilentlyContinue
}
if (Test-Path (Join-Path $sourceDir "Arz-WEB.md")) {
    Copy-Item -Path (Join-Path $sourceDir "Arz-WEB.md") -Destination $targetDir -Force
}

Write-Host "[2/3] Menyinkronkan folder aset (src/) dan modul proyek mandiri (ethol-notifier/)..." -ForegroundColor Yellow
$srcTarget = Join-Path $targetDir "src"
if (!(Test-Path $srcTarget)) {
    New-Item -ItemType Directory -Path $srcTarget -Force | Out-Null
}
robocopy (Join-Path $sourceDir "src") $srcTarget /E /XF *.sql /R:2 /W:1 /NP /NFL /NDL

$etholTarget = Join-Path $targetDir "ethol-notifier"
if (!(Test-Path $etholTarget)) {
    New-Item -ItemType Directory -Path $etholTarget -Force | Out-Null
}
robocopy (Join-Path $sourceDir "ethol-notifier") $etholTarget /E /XD screenshots .puppeteer_profile ethol-notifier Error_Absen /XF ethol-config.json attended_keys.json /R:2 /W:1 /NP /NFL /NDL

# Menyinkronkan folder aset persona web (assets/, css/, js/) dan modul converter ke Nginx
foreach ($dirName in @("assets", "css", "js", "converter")) {
    $dirSrc = Join-Path $sourceDir $dirName
    if (Test-Path $dirSrc) {
        $dirDst = Join-Path $targetDir $dirName
        if (!(Test-Path $dirDst)) {
            New-Item -ItemType Directory -Path $dirDst -Force | Out-Null
        }
        robocopy $dirSrc $dirDst /E /R:2 /W:1 /NP /NFL /NDL
    }
}

# Sinkronkan tangkapan layar otentik ke Nginx WWW agar HP dapat memuat gambar asli
$nginxScreenshots = Join-Path $etholTarget "screenshots"
if (!(Test-Path $nginxScreenshots)) {
    New-Item -ItemType Directory -Path $nginxScreenshots -Force | Out-Null
}
$activeScreenshots = @(
    "presensi_sample.jpg",
    "presensi_wpl.jpg",
    "presensi_jarkom.jpg",
    "presensi_embedded.jpg",
    "presensi_1789611182916_dejqg.jpg",
    "presensi_1789611189442_n7yg0.jpg",
    "presensi_1789611195951_9cagp.jpg",
    "presensi_1789612285928_8qtvd.jpg",
    "presensi_1789612294417_nuqf9.jpg",
    "presensi_1789612302042_ojwlh.jpg"
)

if (Test-Path (Join-Path $sourceDir "ethol-notifier\screenshots")) {
    $recentSs = Get-ChildItem -Path (Join-Path $sourceDir "ethol-notifier\screenshots") -Filter "presensi_*.jpg" | Where-Object { $_.LastWriteTime -ge (Get-Date).AddHours(-1) }
    $allToCopy = ($activeScreenshots + ($recentSs | ForEach-Object { $_.Name })) | Select-Object -Unique
    foreach ($f in $allToCopy) {
        $srcFile = Join-Path $sourceDir "ethol-notifier\screenshots\$f"
        if (Test-Path $srcFile) {
            Copy-Item -Path $srcFile -Destination (Join-Path $nginxScreenshots $f) -Force
        }
    }
}

Write-Host "[3/4] Menyinkronkan berkas backend Ethol mandiri ke CasaOS (ethol-backend/)..." -ForegroundColor Yellow
$etholBackendTarget = "\\100.73.128.8\Data\AppData\ethol-backend"
if (!(Test-Path $etholBackendTarget)) {
    New-Item -ItemType Directory -Path $etholBackendTarget -Force | Out-Null
}
Copy-Item -Path (Join-Path $sourceDir "serve.js") -Destination (Join-Path $etholBackendTarget "serve.js") -Force
Copy-Item -Path (Join-Path $sourceDir "serve-watchdog.js") -Destination (Join-Path $etholBackendTarget "serve-watchdog.js") -Force
Copy-Item -Path (Join-Path $sourceDir "package.json") -Destination (Join-Path $etholBackendTarget "package.json") -Force
Copy-Item -Path (Join-Path $sourceDir "docker-compose.yml") -Destination (Join-Path $etholBackendTarget "docker-compose.yml") -Force
if (Test-Path (Join-Path $sourceDir "ethol-notifier\ethol-agent.js")) {
    Copy-Item -Path (Join-Path $sourceDir "ethol-notifier\ethol-agent.js") -Destination (Join-Path $etholBackendTarget "ethol-agent.js") -Force
}
if (Test-Path (Join-Path $sourceDir "ethol-notifier\ethol-task-scraper.js")) {
    Copy-Item -Path (Join-Path $sourceDir "ethol-notifier\ethol-task-scraper.js") -Destination (Join-Path $etholBackendTarget "ethol-task-scraper.js") -Force
}
if (Test-Path (Join-Path $sourceDir "ethol-notifier\tasks.json")) {
    Copy-Item -Path (Join-Path $sourceDir "ethol-notifier\tasks.json") -Destination (Join-Path $etholBackendTarget "tasks.json") -Force
}
if (Test-Path (Join-Path $sourceDir "ethol-notifier\ethol-config.json")) {
    # Salin kredensial khusus ke direktori internal privat CasaOS (ethol-backend), terisolasi dari Nginx publik
    Copy-Item -Path (Join-Path $sourceDir "ethol-notifier\ethol-config.json") -Destination (Join-Path $etholBackendTarget "ethol-config.json") -Force
}
if (Test-Path (Join-Path $sourceDir "logs_buffer.json")) {
    Copy-Item -Path (Join-Path $sourceDir "logs_buffer.json") -Destination (Join-Path $etholBackendTarget "logs_buffer.json") -Force
    Copy-Item -Path (Join-Path $sourceDir "logs_buffer.json") -Destination (Join-Path $etholTarget "logs_buffer.json") -Force
    Copy-Item -Path (Join-Path $sourceDir "logs_buffer.json") -Destination (Join-Path $targetDir "logs_buffer.json") -Force
}
$backendScreenshots = Join-Path $etholBackendTarget "screenshots"
if (!(Test-Path $backendScreenshots)) {
    New-Item -ItemType Directory -Path $backendScreenshots -Force | Out-Null
}
if (Test-Path (Join-Path $sourceDir "ethol-notifier\screenshots")) {
    foreach ($f in $allToCopy) {
        $srcFile = Join-Path $sourceDir "ethol-notifier\screenshots\$f"
        if (Test-Path $srcFile) {
            Copy-Item -Path $srcFile -Destination (Join-Path $backendScreenshots $f) -Force
        }
    }
}

# 3. Sinkronisasi Git & Portofolio GitHub (Opsional jika switch -PushGit disertakan atau repo aktif)
if ($PushGit) {
    Write-Host "[GIT] Memeriksa status repositori dan menyinkronkan ke GitHub..." -ForegroundColor Cyan
    $gitCmd = "$env:LOCALAPPDATA\Programs\Git\cmd\git.exe"
    if (!(Get-Command git -ErrorAction SilentlyContinue) -and (Test-Path $gitCmd)) {
        $env:Path = "$env:LOCALAPPDATA\Programs\Git\cmd;" + $env:Path
    }
    if (Get-Command git -ErrorAction SilentlyContinue) {
        $status = git status --porcelain
        if ($status) {
            $msg = if ($CommitMessage) { $CommitMessage } else { "deploy: sync production build to GitHub portfolio ($(Get-Date -Format 'yyyy-MM-dd HH:mm'))" }
            git add .
            git commit -m $msg
            Write-Host "[GIT] Commit berhasil dibuat: $msg" -ForegroundColor Green
        }
        Write-Host "[GIT] Melakukan git push origin main..." -ForegroundColor Cyan
        git push origin main
        if ($LASTEXITCODE -eq 0) {
            Write-Host "[GIT] ✅ Berhasil disinkronkan ke GitHub (origin/Arz-WEB)!" -ForegroundColor Green
        } else {
            Write-Host "[GIT-WARN] Gagal git push origin." -ForegroundColor Yellow
        }

        # Periksa remote persona (personal-web-persona-theme) jika ada
        $remotes = git remote
        if ($remotes -contains "persona") {
            Write-Host "[GIT] Melakukan git push persona main..." -ForegroundColor Cyan
            git push persona main
            if ($LASTEXITCODE -eq 0) {
                Write-Host "[GIT] ✅ Berhasil disinkronkan ke GitHub Persona Theme (persona/main)!" -ForegroundColor Green
            } else {
                Write-Host "[GIT-WARN] Gagal git push persona." -ForegroundColor Yellow
            }
        }
    }
}

Write-Host "[4/4] Memverifikasi integritas berkas di server..." -ForegroundColor Yellow
$fileCount = (Get-ChildItem -Path $targetDir -File).Count + (Get-ChildItem -Path (Join-Path $targetDir "src") -Recurse -File).Count + (Get-ChildItem -Path (Join-Path $targetDir "ethol-notifier") -File).Count

Write-Host ""
Write-Host "=========================================" -ForegroundColor Green
Write-Host "   DEPLOYMENT SUKSES! ($fileCount Berkas Terpasang)" -ForegroundColor Green
Write-Host "=========================================" -ForegroundColor Green
Write-Host "Akses website & backend Anda di:"
Write-Host "  - Grimoire Dashboard : https://dashboard.raidenarya.my.id" -ForegroundColor Cyan
Write-Host "  - Ethol Notifier     : https://dashboard.raidenarya.my.id/ethol-notifier/" -ForegroundColor Cyan
Write-Host "  - Portainer CasaOS   : http://100.73.128.8:9000" -ForegroundColor Cyan
Write-Host ""

