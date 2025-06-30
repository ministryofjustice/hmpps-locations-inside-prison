# Signing commits with IntelliJ IDEA

1. Download GPGTools from https://gpgtools.org/
2. Follow the GPGTools setup and create a key pair.
3. Install your GPG key in IntelliJ IDEA:
   1. Start IntelliJ IDEA (or restart it to make sure it loads the changes you've made to your environment).
   2. In the Settings dialog (⌘Сmd0,) , go to Version Control | Git, and click the Configure GPG Key button.
   3. In the dialog that opens, click Sign commits with GPG key and select the key you want to use from the list.
4. Add the GPG key to your Github account:
   1. In the upper-right corner of any page on GitHub, click your profile photo, then click Settings.
   2. In the "Access" section of the sidebar, click SSH and GPG keys.
   3. Next to the "GPG keys" header, click New GPG key.
   4. In the "Title" field, type a name for your GPG key.
   5. In the GPG Keychain app (GPGTools), right click on your GPG key and click copy.
   6. In the "Key" field, paste the GPG key.
   7. Click Add GPG key.
   8. If prompted, authenticate to your GitHub account to confirm the action.
5. Ensure that your git email matches your GPG key email
   * `git config --global user.email EMAIL_ADDRESS`
6. Ensure that your email is added to your Github account and verified (https://github.com/settings/emails)
