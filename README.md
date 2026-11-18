# Ying Yang

## Local testing

From this directory, run the following command and open http://localhost:8000 in a browser.

```sh
python3 -m http.server 8000 --bind 127.0.0.1 --directory dist
```

Use the same browser and address to resume a collection. Open Nostr in the header to connect with Amber on mobile or a NIP-07 browser extension on desktop. Amber needs an internet connection. The signer approves a fresh challenge for the local Ying Yang profile. Use Parents and the device PIN to reset progress. Word pronunciation uses voices available on the device.

## Publish to yy.teamtoxic.xyz

Push this project to the main branch of its own GitHub repository. In Settings → Pages, choose GitHub Actions as the publishing source. Run the Deploy Ying Yang workflow from Actions, or push a change to main.

In Settings → Pages, enter yy.teamtoxic.xyz as the custom domain. For a repository owned by 0xRivers, set the yy CNAME in the teamtoxic.xyz DNS zone to 0xrivers.github.io. Once GitHub completes its DNS check and issues the certificate, enable Enforce HTTPS.

The workflow publishes the contents of dist. Changes to those files are reflected when you refresh the local test page and deploy on the next push to main.
