#!/bin/sh

sudo cp ./data/images/icon.svg /usr/share/icons/hicolor/scalable/apps/kitab.svg
sudo chmod 644 /usr/share/icons/hicolor/scalable/apps/kitab.svg

sudo cp ./data/images/icon.svg /usr/share/icons/hicolor/scalable/mimetypes/application-prs.ktb+zip.svg
sudo chmod 644 /usr/share/icons/hicolor/scalable/mimetypes/application-prs.ktb+zip.svg

sudo cp ./data/ktb.xml /usr/share/mime/packages/ktb.xml
sudo chmod 644 /usr/share/mime/packages/ktb.xml
sudo update-mime-database /usr/share/mime

sudo cp ./data/kitab.desktop /usr/share/applications/kitab.desktop
sudo chmod 644 /usr/share/applications/kitab.desktop

sudo cp -r ./src /usr/share/kitab
sudo cp -r ./data /usr/share/kitab

sudo cp ./data/kitab /usr/bin/kitab
sudo chmod +x /usr/bin/kitab