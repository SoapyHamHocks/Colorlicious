@echo off
set file=Colorlicious@SoapySpew.xpi
"%programfiles%\7-zip\7z.exe" a -r -tzip -mx9 -x!%file% -x!build.* -x!.git* -x!Thumbs.db -x!.DS_Store -x!*.bak -x!*.old %file% *