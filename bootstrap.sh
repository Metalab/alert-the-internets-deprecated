#!/bin/sh

# ffmpeg available in backports
echo "bootstrap: creating /etc/apt/sources.list.d/alert-the-internets.list"
echo "deb http://ftp.de.debian.org/debian jessie-backports main" > /etc/apt/sources.list.d/alert-the-internets.list

# install ansible which is used for all other provisioning of the vm
echo "bootstrap: installing ansible"
apt-get install -y ansible > /dev/null
