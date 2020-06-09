# Show 'Em Boys

COVID project: A no-nonsense poker app to play with friends remotely (Zoom + Venmo not included).

Deployed App: https://show-em-boys.now.sh

👍 Contributions Welcome. Please submit a PR.

## 🆕 Start / Host a new game

- Login using your Google / Gmail account
- Create a New Game
- Set the Buy In, Small, and Big Blind
- Share the Game ID with friends

## 🙋 Add players to the game

- After confirming receipt of Buy In 💰 on your personal payment app (Venmo, Square Cash, etc.), add the player to the game using their Google / Gmail account + display name.
- Need at least 3 to play!

## 🚪 Join a game

- Login using your Google / Gmail account
- Ask the host for the Game ID, and enter it into the lobby.

## 👀 Special Rules (programmed in)

- There are no separate pots for players who can't meet the next bet amount. If any player ends up with no more money to bet, all players reveal their cards (Show 'Em Boys), and the pot is finalized. The round continues with no more additional bets.
- In order to start a round, every user must have at least enough money to cover the Big Blind. If they're unwilling to buy back in at the Buy In amount, the host must kick them out. 🤷‍♂️
- Minimum raise amount = 1/2 of the Small Blind.
- _Host_: You can edit any player's Display Name, Email, and Money by clicking on their name. 💰 Use this feature to buy people back in! 💰
- _Host_: At any point, you can clear the table if something went wrong. Before doing this, make sure to agree upon what to do with the remaining money in the pot! (e.g., everyone agrees to split it or you try to retrace steps and provide the correct amounts). Remember: only you can update everyone's money amount!
- Hosts can play for the player in turn (just in case that person needs to step away from their computer).

## 👨‍💻 Dev Notes

- JAMStack w/ Firebase, NextJS, and React
- Deployed with Vercel
- Uses custom hooks with Firestore database listeners to ensure real-time game updates across all players
- Uses Deck of Cards API
- Uses pokersolver (npm) to determine the winner

> _I hope the name of this game does not come off as female-exclusive. It's just the phrase my "boys" and I use for revealing our hands, and I made this app with them in mind. Anyone can show 'em._
