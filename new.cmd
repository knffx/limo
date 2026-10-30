@echo off
setlocal
rem Create a new post. Usage: new.cmd <zh|ja|en> "title" [slug] [--translated]
set "NODE_EXE=D:\DSH\resources\runtime\primary-runtime\dependencies\node\bin\node.exe"
"%NODE_EXE%" "%~dp0tools\new-post.mjs" %*
endlocal
