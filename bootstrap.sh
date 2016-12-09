#!/bin/sh

# install ansible which is used for all other provisioning of the vm
echo "bootstrap: installing ansible"
apt-get install -y ansible > /dev/null
