#!/bin/bash
cp /home/ubuntu/.env /home/ubuntu/webapp

sudo chmod -R 777 /home/ubuntu/webapp

#navigate into our working directory where we have all our github files
cd /home/ubuntu/webapp

#add npm and node to path
export NVM_DIR="$HOME/.nvm"	
[ -s "$NVM_DIR/nvm.sh" ] && \. "$NVM_DIR/nvm.sh"  # loads nvm	
[ -s "$NVM_DIR/bash_completion" ] && \. "$NVM_DIR/bash_completion"  # loads nvm bash_completion (node is in path now)

#install node modules
pm2 delete all
source /etc/profile
pm2 startOrReload ecosystem.config.js --name webapp
sudo /opt/aws/amazon-cloudwatch-agent/bin/amazon-cloudwatch-agent-ctl \
-a fetch-config \
-m ec2 \
-c file://home/ubuntu/webapp/amazon-cloud-watch.json \
-s
#start our node app in the background
# npm start > app.out.log 2> app.err.log < /dev/null &