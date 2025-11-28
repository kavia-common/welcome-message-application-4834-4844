#!/bin/bash
cd /home/kavia/workspace/code-generation/welcome-message-application-4834-4844/welcome_frontend
npm run build
EXIT_CODE=$?
if [ $EXIT_CODE -ne 0 ]; then
   exit 1
fi

