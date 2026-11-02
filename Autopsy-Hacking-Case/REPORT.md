# Forensic Investigation Report

**Mr Evil | Digital Forensics Project**

| | |
|---|---|
| **Case Reference Number** | Fall-2026-Project001 |
| **Investigation Title** | Autopsy Analysis of the Dell Latitude CPi Image |
| **Prepared By** | *[redacted]* |
| **Prepared For** | *[redacted]* (course instructor) |
| **Date of Investigation** | 17 October 2026 |
| **Date of Report** | 29 October 2026 |
| **Report Version** | 3.0 |

> Personal identifiers (name, student ID, school account, private document links) have been redacted from this public copy. Black boxes in the screenshots mark the redacted areas.

## Contents

- [Part 1: Forensic Workstation](#part-1-forensic-workstation)
- [Part 2: Hacking Case: Autopsy Analysis of the Dell Latitude CPi Image](#part-2-hacking-case-autopsy-analysis-of-the-dell-latitude-cpi-image)

---

## Part 1: Forensic Workstation

### Download an x64 Windows 10 Enterprise ISO (90 day evaluation)

![Windows 10 Enterprise ISO download](images/part1-workstation/01-download-windows-iso.png)

VMware Workstation Pro is open on the Home screen beside the Blue Cape Security Basic Lab guide, and the Downloads panel shows the Windows 10 Enterprise evaluation ISO (build 19044). This ISO is the installation media used to build the forensic workstation VM.

### Create a new machine

![New Virtual Machine Wizard summary](images/part1-workstation/02-new-vm-summary.png)

The New Virtual Machine Wizard summary shows the VM will be created as Windows 10 x64 with a 40 GB hard disk, 4096 MB of memory, 2 CPU cores and a NAT network adapter. These settings follow the lab guide's recommended hardware for the forensic workstation.

### Attach the Windows 10 ISO

![Browse for ISO Image dialog](images/part1-workstation/03-attach-iso.png)

Click on the "Empty" disk. On the right, click on the disk symbol next to the Optical Drive selection field and attach the previously downloaded Windows 10 ISO.

The Browse for ISO Image dialog is open from the VM's CD/DVD settings and lists the de-de and en-us Windows 10 Enterprise evaluation ISOs in the download folder. Selecting one attaches it to the virtual optical drive so the VM can boot the Windows installer.

### Install Windows 10

![Windows Setup license terms](images/part1-workstation/04-windows-setup.png)

Windows Setup is running inside the VM at the Applicable notices and license terms page, with I accept the license terms checked. The progress bar shows step 1, Collecting information, so the Windows 10 installation is under way.

### Disable privacy features

![Windows privacy settings turned off](images/part1-workstation/05-privacy-settings.png)

The Windows 10 Settings app shows Privacy, General with all four options turned Off, including the advertising ID and app launch tracking. This completes the guide's step to disable privacy features and reduce background load on the VM.

### Install WSL and Ubuntu

![Downloading the Ubuntu package for WSL](images/part1-workstation/06-wsl-ubuntu-download.png)

Add-AppxPackage fails because Ubuntu_2004.4.2.0_x64.appx does not exist in C:\Windows\system32, so Invoke-WebRequest is run to download the Ubuntu package from aka.ms/wslubuntu2004, with over 113 MB written so far. This screenshot records a troubleshooting step while following Microsoft's manual WSL installation guide.

![WSL configuration](images/part1-workstation/07-wsl-configuration.png)

The Downloads folder lists the 4Dell+Latitude+CPi.E01 and .E02 evidence files and two Ubuntu AppxBundle packages, and `wsl --set-default-version 1` completes successfully. The `wsl --status` output warns that the Virtual Machine Platform needed for WSL 2 is not enabled, and `wsl --list --verbose` shows no distribution installed yet.

![Ubuntu UNIX user created](images/part1-workstation/08-ubuntu-user-created.png)

The Ubuntu installer rejects root as the new username because that account already exists, so a UNIX user named kali is created instead. The welcome banner confirms Ubuntu 22.04.1 LTS is running under WSL on the DESKTOP-DRIVM5O workstation.

### Update Ubuntu and install prerequisites, then pip3 (Python package manager)

![Ubuntu prerequisites installed](images/part1-workstation/09-ubuntu-prerequisites.png)

The Ubuntu terminal finishes installing packages and reports Python 3.10.12 and pip 22.0.2. The history output shows the apt update, apt upgrade and prerequisite install commands (python3-pip, python3-venv, python3-dev, build-essential, git and software-properties-common) that prepared the system.

### Install Volatility 3

![Volatility 3 installed](images/part1-workstation/10-volatility3.png)

A Python virtual environment named forensics-venv is created and activated, pip is upgraded to 26.2.2, and volatility3 and capstone are installed. Running `vol -h` prints Volatility 3 Framework 2.28.2, confirming the memory forensics tool works.

### Install Plaso (log2timeline)

![Plaso installed](images/part1-workstation/11-plaso.png)

Running `sudo apt install plaso-tools` reports that plaso-tools 20240308 from the GIFT PPA is already the newest version. The `log2timeline.py -h` command prints its usage help, confirming Plaso is installed and ready to build timelines.

### Install oletools

![oletools installed](images/part1-workstation/12-oletools.png)

The `dpkg -l | grep plaso` check lists plaso-data, plaso-tools and python3-plaso as installed, and pip installs oletools 0.60.2 with dependencies such as olefile and msoffcrypto-tool. oletools is used to analyze Microsoft Office files for malicious macros.

### Final verification

![Final verification of installed tools](images/part1-workstation/13-final-verification.png)

The history output lists all 29 commands used to build the workstation, and the `which` checks show python3, pip3, vol and oleid in /home/kali/forensics-venv/bin with log2timeline.py in /usr/bin. This confirms every tool is installed and the forensics virtual environment is active.

### Windows tools

![Windows forensic tools on the desktop](images/part1-workstation/14-windows-tools.png)

---

## Part 2: Hacking Case: Autopsy Analysis of the Dell Latitude CPi Image

### 1. What is the image hash? Does the acquisition and verification match?

![Hashes for the E01 segment](images/part2-analysis/q01-hash-e01.png)

![Hashes for the E02 segment](images/part2-analysis/q01-hash-e02.png)

The Drive/Image Verify Results window shows the computed MD5 hash matching the stored verification hash. The result reads Match with no bad blocks found, so the acquisition is verified.

### 2. What operating system was used on the computer?

![Operating system information](images/part2-analysis/q02-operating-system.png)

The operating system table lists the system hive with version Windows_NT and the software hive with program name Microsoft Windows XP. This identifies the computer as running Windows XP.

**Answer:** Windows_NT, Windows XP

### 3. When was the install date?

![Install date](images/part2-analysis/q03-install-date.png)

The install information table shows Microsoft Windows XP with a date/time of 2004-08-19 22:48:27 PDT. This is the date and time the operating system was installed.

**Answer:** 2004-08-19 22:48:27

### 4. What are the time zone settings?

![Time zone](images/part2-analysis/q04-time-zone.png)

The install date/time entry is displayed with the EDT suffix in the same table. This indicates the computer's time zone is set to Eastern Daylight Time.

**Answer:** Eastern Daylight Time (EDT)

### 5. Who is the registered owner?

![Registered owner](images/part2-analysis/q05-registered-owner.png)

The operating system table lists Greg Schardt in the Owner column for Microsoft Windows XP. This identifies him as the registered owner of the installation.

**Answer:** Greg Schardt

### 6. What is the computer account name?

![Computer name in drwtsn32.log](images/part2-analysis/q06-computer-name-drwtsn32.png)

The log text contains a System Information block with the Computer Name highlighted as N-1A9ODN6ZXK4LQ. This gives the computer account name.

**Answer:** N-1A9ODN6ZXK4LQ

![Computer name in irunin.ini](images/part2-analysis/q06-computer-name-irunin.png)

The irunin.ini file shows the LANHOST and LANDOMAIN values both highlighted as N-1A9ODN6ZXK4LQ. This matches the computer name found in the event log. After [computer name] search. Could use [LANUSER]

### 7. What is the primary domain name?

**Answer:** N-1A9ODN6ZXK4LQ

### 8. When was the last recorded computer shutdown date/time?

![SysEvent.Evt metadata](images/part2-analysis/q08-last-shutdown.png)

The file metadata for SysEvent.Evt shows a modified and accessed time of 2004-08-27 11:31:44. This is the last recorded shutdown date and time of the computer.

**Answer:** 2004-08-27 11:31:44 (EDT)

### 9. How many accounts are recorded (total number)?

![SAM user names](images/part2-analysis/q09-sam-accounts.png)

The SAM registry hive lists five account names under the Users key. These are Administrator, Guest, HelpAssistant, Mr. Evil and SUPPORT_388945a0.

**Answer:** 5 accounts

### 10. What is the account name of the user who mostly uses the computer?

![Operating system user accounts](images/part2-analysis/q10-q11-user-accounts.png)

The account details for Mr. Evil show a Login Count of 15 and a Default Admin User account type. This is more logons than any other account, so he is the main user of the computer.

**Answer:** Mr Evil (Login Count: 15, more than the others)

### 11. Who was the last user to logon to the computer?

![Operating system user accounts](images/part2-analysis/q10-q11-user-accounts.png)

The user account table shows the Mr. Evil account (listed as Mr) with a count of 15 and a last access time of 2004-08-27 11:08:23 EDT. All other accounts have a count of 0, so this is the last user to log on.

**Answer:** Mr Evil on 2004-08-27 11:08:23

### 12. A search for the name of "G=r=e=g S=c=h=a=r=d=t" reveals multiple hits. One of these proves that G=r=e=g S=c=h=a=r=d=t is Mr. Evil and is also the administrator of this computer. What file is it? What software program does this file relate to?

![AppEvent.Evt System Information](images/part2-analysis/q12-appevent-registered-owner.png)

The same AppEvent.Evt entry lists the User Name as Mr. Evil and the Registered Owner as Greg Schardt. This links Greg Schardt to the Mr. Evil user account on this computer.

**Answer:**
- User Name: Mr. Evil
- Registered Owner: Greg Schardt

### 13. List the network cards used by this computer

![NetworkCards registry key](images/part2-analysis/q13-network-cards.png)

The NetworkCards registry key lists two adapters: the Compaq WL110 Wireless LAN PC Card and the Xircom CardBus Ethernet 100 + Modem 56. Each entry has its own ServiceName GUID that can be used to look up its interface settings.

**Answer:** Under `Microsoft\Windows NT\CurrentVersion\NetworkCards\`

1. Compaq WL110 Wireless LAN PC Card
2. Xircom CardBus Ethernet 100 + Modem 56 (Ethernet Interface)

### 14. This same file reports the IP address and MAC address of the computer. What are they?

![Tcpip interface for the Xircom card](images/part2-analysis/q14-tcpip-xircom.png)

The Tcpip Interfaces key for the Xircom card's GUID shows an IPAddress value of 0.0.0.0. This means no usable IP address was stored in the registry for this adapter.

![Tcpip interface for the Compaq card](images/part2-analysis/q14-tcpip-compaq.png)

The Tcpip Interfaces key for the Compaq WL110 card's GUID also shows an IPAddress of 0.0.0.0 with DHCP enabled. As a result, the registry does not reveal the IP or MAC address for either card.

**Answer:** Both associated IPs and MACs could not be found.

### 15. An internet search for vendor name/model of NIC cards by MAC address can be used to find out which network interface was used. In the above answer, the first 3 hex characters of the MAC address report the vendor of the card. Which NIC card was used during the installation and set-up for LOOK@LAN?

The irunin.ini file is selected in a Program Files folder, and its text shows a LANNIC value of 0010a4933e09. The first part of that MAC address (0010a4) belongs to the Xircom NIC vendor, which identifies the card used during setup.

![irunin.ini LAN settings](images/part2-analysis/q15-irunin-lan-settings.png)

The irunin.ini variables list LANHOST N-1A9ODN6ZXK4LQ, LANUSER Mr. Evil, LANIP 192.168.1.111 and LANNIC 0010a4933e09. These are the IP address and MAC address recorded for the computer.

**Answer:**
- IP address: 192.168.1.111
- MAC address: 0010a4933e09
