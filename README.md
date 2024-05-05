# Trading Server

Let's get you up and running with a server/web application that you’ll then be able to build off of..
But first, there are a few accounts you’ll need to set up and technologies you’ll need to install on your computer.

## Part One: Getting the code on your machine

#### 1. Install the tools:
- [ ] Create a <a href="https://signup.heroku.com/" target="_blank">Heroku account</a> (Make sure to set your primary language as "Node")
- [ ] Download and install <a href="https://devcenter.heroku.com/articles/heroku-cli" target="_blank">Heroku CLI</a>
- [ ] Create a <a href="https://github.com/join" target="_blank">GitHub account</a>
- [ ] Create a <a href="https://www.mongodb.com/cloud/atlas/register" target="_blank">MongoDB Atlas account</a>
- [ ] Download and install <a href="https://help.github.com/articles/set-up-git/#setting-up-git" target="_blank">git (GitHub's command line tool)</a>
- [ ] Download and install <a href="https://desktop.github.com/" target="_blank">Github Desktop (will facilitate your git usage by allowing you to work in a more interactive way)</a>
- [ ] Download and install <a href="https://nodejs.org/en/download/" target="_blank">Node.js</a>
- [ ] Download and install a text editor (we recommend <a href="https://code.visualstudio.com/" target="_blank">Visual Studio Code</a>)
- [ ] Create an account with a trusted broker (we recommend <a href="https://www.vantagemarkets.com/login/" target="_blank">Vantage</a> or <a href="https://www.puprime.com/" target="_blank">PU Prime</a>)
- [ ] Download MetaTrader 5 from either your App/Google store, or desktop, if via desktop use the software provided by the broker as it contains the pre-loaded server list.
- [ ] Create an account with <a href="https://metaapi.cloud/" target="_blank">MetaApiCloud</a> and use a computer to generate a Api token.(Save that token wisely, you'll need it later)

Use Google or ChatGPT to resolve for any error messages you receive when installing the tools. Both are a great resource to get through roadblocks like these.

#### 2. Make a copy of the existing project on GitHub by forking it at https://github.com/IllimitedandCompany/TradingServer.git
Simply download the whole project, check the project folder for hidden files, and delete ".git" folder inside project, then use git app by traveling through command line to the folder of the project, and enter "git init .", that will initialize a new repository from that folder on your machine, it will only work if no ".git" file is present on the project, or else it will reinitialize the repo not actually changing the information required to set a new repository to be pushed to Github.

#### 3. Find and open your terminal 
The terminal is a basic way of interacting with your computer through text commands. It'll be very useful in setting your application up. On Windows, it might be called Command Prompt, Git Shell, or Git BASH.

<img width="115" alt="screen shot 2017-04-21 at 11 43 48 am" src="https://cloud.githubusercontent.com/assets/17851174/25285319/ce48dafe-2687-11e7-9fba-3262f406235f.png">

#### 4. Use the command line to navigate to your desktop:
```
	cd ~/Desktop  
```
Then, use the `ls` (on Mac) or `dir` (on Windows) command to list all files in a directory. It will show you all the items on your desktop, like so:

![oct-12-2016 21-51-18](https://cloud.githubusercontent.com/assets/17851174/25285297/b97b3586-2687-11e7-8d0a-075baed899c4.gif)

#### 5. Initialize the app for Heroku
Use the command line to create an app on Heroku. Heroku is the server you'll be pushing your code to. This prepares Heroku to receive your source code (and creates a url for you):
_Once again, be sure to run these lines one at a time, pressing enter after each command_
```
	heroku login
	heroku create
```
(Or:

#### ??. Create your App and Link your GitHub repo on Heroku on the browser
Heroku will monitor your repository, and whenever it sees you push a change, it will automatically re-deploy your application so that your changes are incorporated in your live site. 

 - Go to https://dashboard.heroku.com/apps
 - Create a new App, choose your server location and give it a name
 - Click the tab ‘Deploy’ 
 - In ‘Deployment Method’, select ‘Connect to Github’
 - Search for your Repo — "Trading Server"
 - Click 'connect' and then 'Enable Automatic Deploys'
 - and "Deploy Branch"

you'll soon be able to see your App online.)

*Note: On Windows, the first command might 'hang' for quite some time (even up to 10-15 minutes) - do not cancel and restart it, usually after this first 'long' run, it works without issues later on.*

If you experience any issues with using Heroku on the command line, please refer to [this documentation] (https://devcenter.heroku.com/articles/heroku-cli#troubleshooting) and your error log file.

#### 6. Install the dependencies
Dependencies are all the outside pieces of code your app needs to run. Install the project’s dependencies using npm, a tool used to install any other packages your project needs. View the dependencies your app needs [here](https://github.com/IllimitedandCompany/TradingServer/blob/master/package.json). 
```
	npm install 
```
(By entering "npm install" or "npm i" not followed by a specific module, NPM will check your dependencies on Package.json and install them accordingly.)

#### 7. Run the project on your machine
(by traveling to the project using cd(change directory*))(shown in step 4)
```
	npm start	
```
*If your server is still running (it probably is), you can press control + c to halt it.

#### 8. View the project running locally
Open a browser and navigate to `localhost:5000`

#### 9. Make a change in the code and refresh the page running at `localhost:5000`
Open the project with Visual Studio Code, or whichever text editor you have installed. Make a change to your code. For example, in `html/home.ejs`, you could change the header text. Then, refresh your web browser, and you should see the change.

EJS is a templating language that stands for embedded JavaScript. It's like HTML but with some useful tools added. It lets you add JavaScript that gets compiled to HTML before it's sent to the browser. 

There is a pre-included module called Nodemon on your Trading Server, Nodemon acts a checker of the backbone code being used for your app to run, if you make any changes on the main file and save them, Nodemon will automatically restart the server allowing you to see the changes without having to manually halt and re-start the server.

For this App to work properly you'll need to change the following variables in the project/js/trading/testtrader... file:
1. Get your URI line from MongoDB Atlas, and in your project file find the /js/database/mongodb.js file, and swap out the URIs.
2. Swap the ApiToken with the token you've generated on MetaApiCloud
3. Fill in MT user, password and broker server according to the Broker account information given, you can use DEMOS.
4. Fill in account name, service name, endpoint password and database/collection names, those will be required for webhooks and database connection. 

#### 10. Push that change to GitHub, which will automatically deploy to Heroku (Github Desktop)

 - Login to Github using Github Desktop
 - Access the repo on your Github account or create a new with the "git init ." (shown on step 2).
 - Give the 'head' a name(update info), and commit to master and/or push origin or publish repository.

Any updates on Visual Studio Code will need to be pushed to origin using Github Desktop, only once commited and pushed will they be active due to 'Automatic Deployment'

#### 11. Check the Cloud logs using CMD line
```
	heroku logs --tail --app APPNAME		
```

## Part 2 - Using Webhooks

Your webhooks are defined as your entryHook and exitHook variables.

You can test them locally by running your server on your machine and triggering POST calls via <a href="https://www.postman.com/" target="_blank">Postman</a>, by adding "localhost:5000/" before your entry hook, make sure you also change the account name & endpoint password according to whats on your Trading code file.

If deployed on Heroku you'll need to use the identifier given by Heroku to make a call to the cloud environment instead of 'localhost:5000/'

You can now create a strategy on <a href="https://www.tradingview.com/" target="_blank">Trading View</a> and ultimatelly an indicator and send your alerts to open/close trades on your MetaTrader account.

(How to create PineScript code coming later.)

Have Fun!
----------------------------------------------------------------------------------------------


### Other resources

Here are some external resources to help you with further development.

**Git and GitHub tutorials**
Version control is an important tool for every developer, and git is the most popular one. Learn more [useful git commands](https://try.github.io/levels/1/challenges/1), discover [the branching]( https://learngitbranching.js.org/) and then check [how to use GitHub](https://guides.github.com/activities/hello-world/) for your own project.

**Web App tutorials (HTML, CSS, JavaScript)**
There are plenty of different and more comprehensive tutorials and online resources to learn HTML, CSS and JavaScript. 

- <a href="https://www.freecodecamp.org/" target="_blank">FreeCode Camp interactive web development tutorial</a>
- <a href="https://khanacademy.org/computing/computer-programming/html-css" target="_blank">Khan Academy free html and css tutorial</a>
- <a href="https://developer.mozilla.org/en-US/docs/Learn/Getting_started_with_the_web" target="_blank">Comprehensive web development tutorial/documentation by Mozilla</a>

- <a href="https://cssreference.io/" target="_blank">CSS visual guide</a>
- <a href="http://flexboxfroggy.com/" target="_blank">Flexbox tutorial</a>
- <a href="http://www.hostingreviewbox.com/html5-cheat-sheet/" target="_blank">HTML cheatsheet</a>
- <a href="https://github.com/IllimitedandCompany/InformationDepot" target="_blank">Information Depot (Web Development Assistance)</a>

**Inspiration and problem solving**
To practice your problem solving skills and find some inspiration, please check the following pages: 
- [StackOverflow](https://stackoverflow.com/) is a great place to ask any question (or search for it first, because it’s very likely that someone has already asked the same question and got an answer :))
- [Code Pen](https://codepen.io/) is a great source of inspiration with a lot of projects based on HTML, CSS and JavaScript
- [Dev.to](https://dev.to/) is a blog platform where you can find plenty of useful posts from other developers.

