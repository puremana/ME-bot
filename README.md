# ME Bot
A Discord bot made for IOURPG (Idle Online Univerise) Guild Discord Servers.
This is an extension to the iou-bot on the official IOURPG Discord server.
You can find the iou-bot here - https://github.com/puremana/iou-bot

Made with Nodejs and Discordjs, using json files to store data locally.

## Commands
All commands start with the prefix allocated in the bot.js and command.js files.

- Challenge Commands *(Only within the specified challenge channel)*
  - `bronze`
  - `silver`
  - `gold`

- Bot Related
  - `help`
  - `info`
  - `time`
  - `serverinfo`
  - `bingoadd`
  - `bingoremove`
  - `bingowhen`
  - `weekliesadd`
  - `weekliesremove`
  - `weeklieswhen`
  - `add` - `add command-name description` *(admin only)*
  - `remove` - `remove command-name` *(admin only)*
  - `echo` - `echo message` *(admin only)*

- Voting Commands
  - `votenew` - `votenew "Name of Poll" "# of times you can vote" "Option One" "Option Two" "Etc"`
  - `vote` - `vote "Name of Poll" "index of option (eg 1)"`
  - `votecheck` - `votecheck "Name of Poll"` 
  - `votedisplay` - `votedisplay "Name of Poll"`
  - `voteclose` - `voteclose "Name of Poll"`
  - `voteopen` - `voteopen "Name of Poll"`
  - `votedelete` - `votedelete "Name of Poll"`
  - `votereset` - `votereset "Name of Poll"`

- Event Commands
  - `invasion`
  - `energyevent`
  - `rpg`
  - `mafia`

- Useful Links
  - `guide`
  - `multicalc`
  - `forum`
  - `wiki`
  - `cards`
  - `test`
  - `trello`

- Push Commands
  - `pushsetup` - `pushsetup "available slots" "ending date" "push time" "leader role name" "description of push" "(optional) inviter role name"` *(Admin only)*
  - `pushdelete`
  - `sent` - `sent AccountName` *(Leaders only)*
  - `senttop` - `senttop NumberOfPopleToDelete` *(Leaders only)*
  - `queueremove` - `queueremove AccountName` *(Leaders only)*
  - `showcommands` - `showcommands yes/no` *(Leaders only)*
  - `createnewmessage` *(Leaders only)*
  - `purge` - `purge NumberOfMessages` *(Leaders only)*
  - `move` - `move "AccountName" NumberInQueue` *(Leaders only)*
  - `signup` - `signup AccountName`
  - `queuejoin` - `queuejoin AccountName`
  - `queueleave` - `queueleave AccountName`
  - `in` - `in AccoutName`
  - `out` - `out AccountName`

- Fun Commands *(Only within the specified fun channel)*
  - `cat`
  - `dog`
  - `ball`
  - `flip`

## Setting up
1) Clone the repo. You can do this by running "git clone https://github.com/puremana/ME-bot.git" in terminal. You will need to install git if you haven't already
2) Go to https://discordapp.com/developers/applications/me
3) Create a new app
4) Click "Create bot user"
5) Click to reveal token (will be used in step 8)
6) Rename the "storage.example" folder to "storage"
7) Rename the ".example.env" file to ".env" (you may be required to download a text editor such as to https://code.visualstudio.com rename)
8) Fill out the .env file with your specific server details. You will need to be in Discord Developer mode to do this. Find out how to get into developer mode here - https://discordia.me/developer-mode
9) Run "npm install" in terminal. You will also need to install nodejs if you haven't already
10) Get the client ID from where you found the token. Go to https://discordapp.com/oauth2/authorize?client_id=INSERTCLIENTIDHERE&scope=bot&permissions=0
To add the bot to your Discord with 0 permissions. You will need the Manage Server role to do this
11) Run "node bot.js" to start the bot

## Contributing
We welcome all types of contributions to the ME-Bot. If you have a bug to report or feature to suggest, please create an issue on this Github repo.

If you wish to contribute to the code base, please fork the repo and send a pull request for each feature you are intending to add.

## Contact
If you wish to discuss anything on this readme, feel free to get in touch with me on Discord, username Level#0923.