@echo off
setlocal
rem limo local command wrapper.
rem This machine has no Node on PATH, so we point at the runtime bundled with DSH.
rem If DSH moves or upgrades, update the line below.
set "NODE_EXE=D:\DSH\resources\runtime\primary-runtime\dependencies\node\bin\node.exe"

if "%~1"=="" goto help
if /I "%~1"=="build" goto build
if /I "%~1"=="dev" goto dev
if /I "%~1"=="ship" goto ship
goto help

:build
"%NODE_EXE%" "%~dp0tools\build.mjs"
goto end

:dev
"%NODE_EXE%" "%~dp0tools\build.mjs" || goto end
"%NODE_EXE%" "%~dp0tools\serve.mjs" %2
goto end

:ship
rem 构建检查 → 提交 → 推送。GitHub Actions 接着构建并发布到 Pages。
cd /d "%~dp0"
"%NODE_EXE%" "tools\build.mjs" || goto shipfail
git add -A
set "MSG=%~2"
if "%MSG%"=="" set "MSG=site: publish"
git commit -m "%MSG%" || echo (nothing to commit)
git push
goto end

:shipfail
echo build failed, nothing pushed
goto end

:help
echo   limo.cmd build        build to dist/
echo   limo.cmd dev [port]   build, then serve at http://127.0.0.1:4321/zh/
echo   limo.cmd ship [msg]   build + commit + push (GitHub Actions deploys Pages)
echo   new.cmd ^<zh^|ja^|en^> "title" [slug] [--translated]
goto end

:end
endlocal
