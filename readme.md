# ScriptSafe
A Chrome extension that gives users control of the web and more secure browsing while emphasizing simplicity and intuitiveness.

## Features
* whitelisting/blacklisting functionality and granular control
* automatic auto-syncing of settings AND whitelist/blacklists across your devices (via Google Sync)
* actually speeds up browsing because it removes a lot of unwanted content
* remove &lt;SCRIPT&gt;, &lt;OBJECT&gt;, &lt;EMBED&gt;, &lt;IFRAME&gt;, &lt;FRAME&gt;, &lt;APPLET&gt;, &lt;AUDIO&gt;, &lt;VIDEO&gt;, &lt;NOSCRIPT&gt;, and &lt;IMG&gt; elements, as well as webbugs
* block unwanted content (MVPS HOSTS, hpHOSTS (ad / tracking servers only), Peter Lowe's HOSTS Project, and MalwareDomainList.com are integrated!)
* block click-through referrer data
* spoof referrer/user-agent data
* block unwanted cookies
* "intuitive" icon that changes based on whether or not a page is whitelisted/blacklisted/bypassed
* shows number of blocked/removed items in toolbar
* shows blocked/allowed items in tab details popup (along with item type)
* bulk import domains into whitelist and blacklist
* option to temporarily allow a page/temporarily allow all blocked items
* choose the default mode (Block All or Allow All)
* option to preserve same-domain elements
* option to disable automatic refresh of pages after whitelisting/blacklisting/temp. bypassing a page
* protect against WebRTC leaks
* support for IPv6 addresses

## Install
https://chrome.google.com/webstore/detail/scriptsafe/oiigbmnaadbkfbmpbfijlflahbdbdgdf?hl=en

## Disclaimer
Due to the nature of this extension, this will break most sites! It is designed to learn over time with sites that you allow.

## Info on Permissions Requested by ScriptSafe
* **"Read and change all your data on the websites you visit"** - this sounds scary, but ScriptSafe needs access to pages in order to block things (e.g. scripts, spoof headers, killing webbugs).
* **"Display notifications"** - this is required for update and sync notifications (if syncing is enabled)
* **"Change your privacy-related settings"** - this is required for the WebRTC Protection feature

You can view all the latest ScriptSafe code changes, line-by-line, here: https://github.com/andryou/scriptsafe/commits/master

More info here: https://developer.chrome.com/extensions/permission_warnings#warnings

## Supporting ScriptSafe
ScriptSafe does not contain any ads or sketchy analytics code. Every bit of code in ScriptSafe has one purpose: to give you control over the web. ScriptSafe is completely free (and as you can see, the source code is published for review).

Donations are welcome: you can donate to me by clicking on the green heart icon in the ScriptSafe options page (via PayPal). If you have reservations against donating via PayPal, I do not have Bitcoin currently; so in lieu of this, please help spread the word about ScriptSafe to your friends and family instead - give them the gift of privacy and security.

## About the Creator
Hi, I'm Andrew. ScriptSafe was created by one ordinary guy (me) as a simple weekend project in 2011 lovingly coded in my bedroom. It has evolved into what it is today with numerous development hours and the help of its over 212,013 users and feedback. I am the only developer and I use ScriptSafe myself every day on every device I use.

I've received offers from many individuals/organizations to sell them ScriptSafe (and its users); my answer has and always will be: **no**.

ScriptSafe has never and will never log or send your data to third-party entities.

If you like ScriptSafe, check out one of my other extensions, Decreased Productivity: https://chrome.google.com/webstore/detail/decreased-productivity/nlbpiflhmdcklcbihngeffpmoklbiooj

Feel free to follow me: https://twitter.com/andryou