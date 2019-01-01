# genre.guide
The code that powers [genre.guide](https://genre.guide) (currently in a "hidden" alpha -- please do not expect a pleasant or stable experience using the website for now)


How to use:
1. Configure
    * Update `redis-password.env` with whatever Redis password you want to use
    * Create a project in the Google API console and make a service account that has access to the Sheets API. Download its `client_secret.json` file and rename it to `client.secret.json` and place it in the `sheet-to-db` directory. A decent overview of how to do that can be found [here](https://www.youtube.com/watch?v=vISRn5qFrkM)
    * Update `caddy.env` with your domain name and email address
    * Be confident that your domain is pointing at whatever instance (DigitalOcean droplet, AWS EC2 instance, etc.) you are running this project on BEFORE running `./run` in step 3. You will reach Let's Encrypt's validation limit basically immediately and be locked out for at least an hour.
2. Run the `./install` script to fetch all the necessary data and build images
3. Run the `./run` script to run the containers that need to be up

Contributing:
Open an issue (whether or not you know how to program the fix/feature, or have any idea why there's a problem, or are confused about something) or pull request (if you programmed the fix/feature yourself!). It can be about anything. I am intending to be welcoming to all kinds of contribution.
