# genre.guide
The code that powers [genre.guide](https://genre.guide) (currently in a "hidden" alpha -- please do not expect a pleasant or stable experience using the website for now)

[![](https://img.shields.io/discord/272098238511841280.svg?label=Discord&style=for-the-badge)](https://discord.gg/z5W6Cpd)


How to use:
1. Configure
    * Update the files in `config-and-secrets` (read their comments), which goes as follows:
    * Update `redis.env` with whatever Redis password you want to use, and the host name (leave it the way it is to use the included container -- if using an external service, make sure the password and host match up with that)
    * Create a project in the Google API console and make a service account that has access to the Drive API. Download its `client_secret.json` file and place it in the `sheet-to-db` directory. A decent overview of how to do that can be found [here](https://www.youtube.com/watch?v=vISRn5qFrkM)
    * Update `caddy.env` with your domain name and email address
    * Be confident that your domain is pointing at whatever instance (DigitalOcean droplet, AWS EC2 instance, etc.) you are running this project on, and that its firewall is set to allow HTTP and HTTPS traffic on ports 80 and 443, **before** running `./run` in step 3. You will reach Let's Encrypt's validation limit basically immediately and be locked out for at least an hour.
2. Run the `./install` script to fetch all the necessary data and build images (you may need to make it executable first with `chmod +x ./install`) -- run it as root (even if your docker commands are set up to be used without sudo)
3. Run the `./run` script to run the containers that need to be up (you may need to make it executable first with `chmod +x ./install`) -- only run as root if docker needs that

Contributing:
Open an issue (whether or not you know how to program the fix/feature, or have any idea why there's a problem, or are confused about something) or pull request. It can be about anything. I am intending to be welcoming to all kinds of contribution.
