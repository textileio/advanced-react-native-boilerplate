# Interplanetary Tag

![Interplanetary Tag](http://t.txtl.us/img/bg-masthead.jpg)

Interplanetary Tag is an experimental game of real-life tag where the rules, game state, and players are coordinated over IPFS using Textile's React Native SDK. The game was built on Textile's [React Native Boilerplate](https://github.com/textileio/advanced-react-native-boilerplate) and remains as a branch in this repo.

The game was first played at [IPFS Camp 2019](https://camp.ipfs.io/) as an experiment in real-time, mobile gaming on IPFS.

## Download the Game

Interplanetary Tag is available for download for iOS or Android through the [main Interplanetary Tag website](https://t.txtl.us/).

## Rules of the Game

1. A game needs to be started by one player.
2. The game creator will set a duration in hours.
3. That player can invite any number of additional players.
4. All additional players can invite even more players!
5. The game creator needs to 'Start' the game, which will notify all players that the game is started.
6. The player who is 'It' will have a red screen displaying the Tag Card.
7. All other players will have black screens showing the Game Log.
8. Any player shown the Tag Card must scan it with their phone's camera, at which point all players will be notified over the p2p network that a new person is It.
9. A newly It person will be put in Timeout for 5 minutes.
10. Play continues until the duration of the game is met, at which point the final person it will lose.
11. Players will have the option to quit or start a rematch.

## How it works

1. Textile syncronizes a shared database across all user's phones.
2. The person who gets tagged will send a signed transaction to all other players letting them know they are it. In this way, nobody can spoof the network with an invalid exchange.

## Modify, fork, or reverse-engineer the game.

If you'd like to build your own version of Interplanetary Tag or use the code as the basis for a new game (* cough * werewolf), feel free to clone this repo and get started.

```
git clone git@github.com:textileio/advanced-react-native-boilerplate.git
cd advanced-react-native-boilerplate
```

You'll need to check out this branch of the code,

```
git checkout ipfs-tag
```

Get started!

## Learn more

This code forks off the more simple [boilerplate](https://github.com/textileio/advanced-react-native-boilerplate), so start on the master branch if you want to learn the basics of getting started with Textile in React Native.

For more info about how Textile works, how it uses and runs IPFS on mobile devices, or how to build apps in other languages or other platforms, [check out our main documentation](https://docs.textile.io/).

