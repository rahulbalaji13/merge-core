@echo off
REM Lightweight gradlew wrapper that forwards to the extracted Gradle 8.5
set GRADLE_HOME=D:\gradle\gradle-8.5\bin
if not exist "%GRADLE_HOME%\gradle.bat" (
  echo Gradle not found at %GRADLE_HOME%\gradle.bat
  exit /b 1
)
"%GRADLE_HOME%\gradle.bat" %*

