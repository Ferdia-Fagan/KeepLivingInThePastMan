# Ferdias_FYP

./BrowserPlugin -> contains browser plugin component
./NativeApplication -> contains native application component

./KeepLivingInThePast_Application -> contains the folder containing fully built application (i.e. contains built JAR and 
web extension).

REMINDER: highlighting experimenting was containing within ./Browserplugin/extras/highlighting.js
Probably not worth looking at as it didnt work, so i didnt organize it at the time, and didnt have energy to write about it. basically you just serialize the starting point path and end point path of a text selection, andthen store these. That didnt work.
Then I used Rangy.js (library), but that didnt work eiter. 

<h3>Ubuntu installation:</h3>

    1. Make sure you have Java 11 installed.

    2. Unzip the application.

    3. Then (with sudo) run the installation script located at:
    KeepLivingInThePast_Application/linux_installer/install_on_linux.sh

    4. Then open Firefox browser and take the .xpi file located at:
    KeepLivingInThePast_Application/browser plugin/keep_living_in_the_past_man-2.0-fx.xpi
    and drag that file onto your Firefox browser window. Agree to the install and the plugin will install into your browser

    5. Wait like 30 seconds (there appears to be a bug if you jump right in). Il be fixing this when I get time.
    
    6. Use the application!

<h3>Windows installation:</h3>

    1. Make sure you have Java 11 installed.

    2. Unzip the application.

    3. Then run this script as ADMINISTRATOR, located at:
    KeepLivingInThePast_Application/windows_installer/install_on_windows.bat

    4. RESTART COMPUTER

    5. Then open Firefox browser and take the .xpi file located at:
    KeepLivingInThePast_Application/browser plugin/keep_living_in_the_past_man-2.0-fx.xpi
    and drag that file onto your Firefox browser window. Agree to the install and the plugin will install into your browser

    6. Wait like 30 seconds (there appears to be a bug if you jump right in). Il be fixing this when I get time.

    7. Use the application! 


<h3>How to handle installation failure</h3>

There seems to be a problem if you jump straight in to using the application. So, here are a few steps to fix. Should take maximum of 5 minutes to reset.


    1. In firefox go to "Open menu -> add ons -> " and remove the plugin.

    2. Go to bookmarks -> look at bottom of your "other bookmarks" folder and delete bookmark folder called "KeepLivingInThePast_OrganisationFolder". (if it exists)

    3. then exit firefox.

    4. Then go to folder "KeepLivingInThePast_Application/application/", and delete all the files in every folder within this folder (so do not delete the folders themself. Just their content within db folder, index folder, etc.)

    5. open up Firefox back up

    6. drag the .xpi file like before onto your firefox window. Agree to all the settings.

    7. Wait 30 seconds

    8. Then try and use the application.

