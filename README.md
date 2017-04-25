# ConnectED

## Release Notes v1.0.0
### New Features
* Deleting a question in a question set is now fully functional
* Matchme and Braindump gametypes now have full functionality
* Displays an instructor tags next to courses for which the user is an instructor
* Lists date for which a game session was last held
* Timer in certain game types can be enabled

### Bug Fixes
* Dashboard no longer needs a refresh upon every access
* Now appropriately displays all user courses

### Features Not Implemented
* Additional game modes
* In-depth student analytics
* In-depth student analytics
* Offline access



## Install Guide

### Prerequisites and Dependencies
The technologies used to implement ConnectED are all web technologies so the only prerequisite software to be able to access ConnectED are a modern browser such as Chrome or Firefox. Being a web application the only other requirement needed is a server to host the web application. This can be done through Github pages, which is how we have done it. The only other external technology required is access to the site’s Firebase dynamic database which we will hand over to the client. 

### Download
The source code for ConnectED can be downloaded as-is or cloned from this repository. There is no need for any other external software. As previously stated, Firebase was used in this software implementation so in order to use this with another Firebase dynamic database of the downloader’s choosing they must change the appropriate Firebase references in the code if they do not have access to the original which will be handed over to the client.

### Install and Run
Being a web application traditional installation is not necessary. In order to get ConnectED working it must simply be hosted on a server and the index.html page must be accessed initially as it is the initial page where users are able to either log in or sign up. The web application will work with Firebase without any modifications, but as said before if desired to run on a different Firebase dynamic database the appropriate references must be changed.

### Troubleshooting
The most common reasons for problems with ConnectED are not having a modern browser that supports JavaScript. Other than this any browser will be able to appropriately display ConnectED even mobile browsers.
