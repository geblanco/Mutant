# Mutant
Productivity launcher

## What is this?
This is a productivity app inspired by the great qdore's [mutate](https://github.com/qdore/Mutate) launcher (hence the name), which is inspired by Alfred Launcher.
It is intended to substitute the default search bar adding more features and usability, making the workflow easy.

## How to use it
Install and launch, default launch shortcut is Ctrl+Space, but it's overridable.

### Distro Installation
By now, only Arch Linux is supported (community repo must be enabled), just issue

```bash
sudo pacman -S mutant
```

### Manual Installation
Get in the project dir

```bash
cd mutant
```

Source the necessary variables (electron dependant)

```bash
source install/envVars.sh
```

Install node modules

```bash
npm i
```

Launch app

```bash
electron .
```

## Current Features
* Search and launch any installed app
* Search on the internet (defaults to google)
* Search on browser history (working on it, by now only firefox and chrome are supported)
* Launch given url

## Contributing
Any contribution is welcome, don't hesitate to make a pull request.
My front-end skill-set is poor, any support there would be much appreciated.

* Developing applications:
  There's no guide for this right now, but it's fairly simple, grabbing any application and looking at the code should give a good overview.

## Motivation
After using qdore's mutate for almost a year and customizing it a lot I miss some functionality so I decided to make my own version of it.

## Dependencies
* nodejs
* electron
* pkg-config
* gtk+-3.0
* librsvg2-dev

## Roadmap
* ~~Install script (by now just set things up)~~
* ~~Settings window~~ (Shortcut override)
* Use and launch custom scripts (search on given scripts folder)
* ~~Search on more browsers history~~ (By now support for Chrome and Firefox)
* Dictionary
* ~~Calculator~~
* Translator
* Maps??
* Web preview (Apple's spotlight style)

