# FACEIT Custom Sound

A Chrome extension that replaces the default FACEIT match accept sound with your own. Paste a link to an mp3, a YouTube video or a TikTok, and it plays when the Accept window pops up.

## Features

- Works with direct mp3 / ogg / wav links, YouTube and TikTok links
- Mutes the default FACEIT sounds (can be turned off in settings)
- Adjustable volume and max length (default 30 seconds)
- Smooth fade-out when you accept the match
- Standalone extension, no Tampermonkey needed

## Install

1. Go to the [Releases](../../releases) page and download the zip from the Assets section.
2. Unpack it into a folder. Don't delete the folder afterwards, Chrome needs it.
3. Open chrome://extensions and turn on Developer mode (top right).
4. Click Load unpacked and select the folder.
5. Pin the extension icon (puzzle icon, then pin) and refresh faceit.com.

## Setup

1. Click the extension icon.
2. Paste your link, set the volume and the max length.
3. Open a faceit.com tab and press Test sound to check it.

Next time a match is found, your sound plays instead of the default one.

## Settings

| Option | Description |
| --- | --- |
| Sound link | mp3 / ogg / wav, YouTube or TikTok link |
| Volume | 0 to 100 |
| Max length | How many seconds the sound plays (1 to 120) |
| Mute all FACEIT sounds | Silences the site's own sounds. If off, only the accept window sound is muted |

## Known issues

- It may occasionally say the link doesn't work. Just press Test sound again.
- TikTok sounds are fetched through a third-party service (tikwm.com). If it stops working, use a direct mp3 link instead.
- YouTube volume is applied one or two seconds after the video starts.

## Update

Download the new zip from Releases, replace the files in your folder, then press the refresh button on the extension card in chrome://extensions.

## Support

Donation addresses are inside the extension popup if you want to support the project.

## Disclaimer

Unofficial project, not affiliated with or endorsed by FACEIT. It only plays audio and does not automate or change anything in the game.

## License

MIT
