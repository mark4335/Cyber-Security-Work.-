# Autopsy Analysis of the Dell Latitude CPi Image

A digital forensics:

1. **Build a forensic workstation**: a Windows 10 VM with WSL/Ubuntu, Volatility 3, Plaso (log2timeline), oletools and a set of Windows forensic tools.  
2. **Investigate a suspect laptop image**: analyse the *4Dell Latitude CPi* disk image in Autopsy 4.14 and answer 15 investigative questions about the system, its users and its network configuration.

The full write-up, with a screenshot for every step, is in [**REPORT.md**](http://REPORT.md).

## About the evidence

The disk image (`4Dell+Latitude+CPi.E01` / `.E02`) is the public **NIST CFReDS "Hacking Case"** training dataset. Names such as *Greg Schardt* and *Mr. Evil*, the computer name and the IP/MAC addresses all belong to that fictional scenario, not to real people or systems.

The image files are not included here because they are about 1 GB and GitHub rejects files over 100 MB. You can download them from the NIST CFReDS site.

## Tools used

| Area | Tools |
| :---- | :---- |
| Virtualisation | VMware Workstation Pro, Windows 10 Enterprise (90-day evaluation) |
| Linux tooling (WSL) | Ubuntu 22.04, Python 3.10, Volatility 3 (2.28.2), Plaso / log2timeline, oletools |
| Disk analysis | Autopsy 4.14.0, AccessData FTK Imager, RegRipper |
| Other Windows tools | Eric Zimmerman tools, Sysinternals Suite, CyberChef, Wireshark, Nmap/Zenmap, exiftool, pestudio, DumpIt, KAPE, Arsenal Image Mounter, 7-Zip, Notepad++, VS Code |

## Key findings

| \# | Question | Finding |
| :---- | :---- | :---- |
| 1 | Image hash: does acquisition match verification? | Yes, the computed MD5 matches the stored verification hash |
| 2 | Operating system | Microsoft Windows XP (Windows\_NT) |
| 3 | Install date | 2004-08-19 22:48:27 |
| 4 | Time zone | Eastern Daylight Time (EDT) |
| 5 | Registered owner | Greg Schardt |
| 6 | Computer account name | N-1A9ODN6ZXK4LQ |
| 7 | Primary domain name | N-1A9ODN6ZXK4LQ |
| 8 | Last recorded shutdown | 2004-08-27 11:31:44 EDT |
| 9 | Number of accounts | 5 (Administrator, Guest, HelpAssistant, Mr. Evil, SUPPORT\_388945a0) |
| 10 | Main user | Mr. Evil (login count 15\) |
| 11 | Last user to log on | Mr. Evil, 2004-08-27 11:08:23 EDT |
| 12 | File linking Greg Schardt to Mr. Evil | AppEvent.Evt (User Name: Mr. Evil, Registered Owner: Greg Schardt) |
| 13 | Network cards | Compaq WL110 Wireless LAN PC Card; Xircom CardBus Ethernet 100 \+ Modem 56 |
| 14 | IP / MAC in the registry | Not recorded (IPAddress 0.0.0.0, DHCP enabled) |
| 15 | NIC used for Look@LAN | Xircom card: IP 192.168.1.111, MAC 0010a4933e09 (from `irunin.ini`) |

## Repository layout

```
.
├── README.md                  Project overview (this file)
├── REPORT.md                  Full forensic investigation report
└── images/
    ├── part1-workstation/     Workstation build screenshots
    └── part2-analysis/        Autopsy analysis screenshots, named by question
```

## Privacy note

Personal details have been removed from this public copy: the author's name and student ID, the instructor's name, school account and login details, and links to private documents. Black boxes in the screenshots mark the redacted areas.