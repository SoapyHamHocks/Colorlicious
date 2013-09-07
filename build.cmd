@echo off
set file=Colorlicious@SoapySpew.xpi
if exist %file% del %file%
"%programfiles%\7-zip\7z.exe" a -tzip -mx9 -x!%file% -x!build.cmd -x!.git -x!.gitattributes -x!.gitignore %file% *