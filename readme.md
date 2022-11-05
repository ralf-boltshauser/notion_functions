# Notion Functions
## Description
These are some notion scripts I built and run on my raspberry pi. 
Often they automate a small task like adding a entry to a db.
## Technical Explanation
You need to add an integration to notion and choose the database you want to edit, afterwards you can adjust the scripts I created by editing the environment variables in the profile. 
## Implementation
### Cronjobs
The scripts are run via cronjbos, use ```crontab -e``` to edit. 
In there is the syntax as follows:

```0 2 * * * . /home/pi/.profile; node /home/pi/functions/notion/add-journal-entry.js```

First the .profile gets sourced so the environment variables are provided for the scripts, afterwards the script is run.

### Profile
In the profile file, the environmentvariables are exported like ```export DBID=...```

