# Applications Model:

* String appCmd 	=> Name of the executable app
* String appName 	=> Name of the application to show
* String subText 	=> Comment subText for the application to show
* String data 		=> Miscellanious extra info (URL on web apps, ie)
* String icon 		=> Application's Icon path
* String type 		=> Application type (ie: system, web_app, internal ...)
* Regex regex0 		=> Public, inmutable Regex to match against when in search for applications
* Regex regex1 		=> Public, user-redefinable Regex to match against when in search for applications (Used by the own app)
