# Strutted HTB (Medium)

# User flag

Navigating to strutted.htb we can download a zipped file, which is a docker folder. We find in the **pom.xml** file. 

I find Apache Struts MVC framework is used. Version 6.3.0.1 is used. This leads me to find the vulnerabilities CVE-2024-53677 relevant for this version.

