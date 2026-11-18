# Ying Yang

## Local testing

From this directory, run the following command and open http://localhost:8000 in a browser.

```sh
python3 -m http.server 8000 --bind 127.0.0.1 --directory dist
```

Use the same browser and address to resume a collection. Click Connect on the landscape screen. Phones and tablets open Amber (NIP-46). Laptops and desktops request the NIP-07 extension, even in a narrow window. For local extension testing, use the localhost address above in the browser profile where your signer is installed and has site access. Amber needs an internet connection. The signer approves a fresh challenge for the local Ying Yang profile. After sign-in, open Players to select a child. The selected name becomes the menu button. Open Parents and enter the PIN for the signed-in parent on this browser to add children, set the language for menus and instructions, choose each child’s practice languages, or reset progress. Each parent sets a PIN on first use. The previous shared PIN applies only during signed-out play. Disconnect is the last signed-in menu option. Pronunciation uses a matching device voice when available. If the browser has no suitable voice or speech fails, the game plays a bundled offline MP3 synthesized with meSpeak / eSpeak for that language.

## Install the game

Open the HTTPS site (or localhost during development). In Brave or Chrome, use the browser’s install option. On iPhone or iPad, open the site in Safari and choose Share → Add to Home Screen. Once the first online visit finishes caching, the game and its word audio are available offline. A new session that requires Amber sign-in needs an internet connection.

## Publish to yy.teamtoxic.xyz

Push this project to the main branch of its own GitHub repository. In Settings → Pages, choose GitHub Actions as the publishing source. Run the Deploy Ying Yang workflow from Actions, or push a change to main.

In Settings → Pages, enter yy.teamtoxic.xyz as the custom domain. For a repository owned by 0xRivers, set the yy CNAME in the teamtoxic.xyz DNS zone to 0xrivers.github.io. Once GitHub completes its DNS check and issues the certificate, enable Enforce HTTPS.

The workflow publishes the contents of dist. Changes to those files are reflected when you refresh the local test page and deploy on the next push to main.
