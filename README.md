# ATV for Apple TV

❤️ Regional television

❤️ Apple TV

This project brings regional Antwerp television (ATV) to Apple TV (ATV).

# Structure

`atv-backend` contains the API (which serves TVML), and is deployed to Amazon Lambda
`atv-app` contains an XCode app.

If you decide to make changes, don't forget to change the TVML URL in `AppDelegate.Swift`

# How it works

**Live TV**: it just serves a publicly available M3U8 file
**Items**: the RSS feed is parsed and served as TVML.

# Disclaimer

Please give credit (and a big bag of cash) if you are Mediahuis or any affiliated company and would like to release/use this
code. 
