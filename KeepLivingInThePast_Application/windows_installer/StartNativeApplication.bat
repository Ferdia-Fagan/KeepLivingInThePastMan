@echo off
cd /D "%~dp0"
set DIR=%~dp0%..\application\
cd /d "%DIR%"
java -Dfile.encoding=UTF-8 -jar NativeApplication.jar
