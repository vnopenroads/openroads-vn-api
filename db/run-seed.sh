#!/bin/bash
set -e
cd /init/
# download fixture zip file, unzip its contents, then remove the zip
wget -qO- -O /init/fixture.zip https://openreadvndev-public.s3.us-east-2.amazonaws.com/fixture.zip \
&& unzip /init/fixture.zip \
&& rm /init/fixture.zip

