/**
 * ====================================================================
 * DIGITAL DETECTIVE - CASE DATA FILE (caseData.js)
 * ====================================================================
 * This file contains all the story data for our mystery case:
 * - Case overview & incident details
 * - 3 Suspects with background, motive, and alibi
 * - 6 Forensic clues (including chat transcripts & server logs)
 * - The official solution and detailed debriefing
 * 
 * Keeping data separate from logic makes the project easy to read,
 * extend, and modify for beginners!
 */

const CURRENT_CASE = {
  id: "CASE-204",
  title: "Operation Ghost Query",
  subtitle: "The Midnight Database Exfiltration",
  difficulty: "Beginner Sleuth",
  date: "October 14, 02:42 AM",
  location: "Apex Financial HQ (Cloud Data Center)",
  
  // High-level briefing for the detective
  briefing: {
    summary:
      "At 02:42 AM, an unauthorized root query dumped and erased the core financial customer database. " +
      "The perimeter alarm triggered immediately, but the intruder bypassed multi-factor authentication using an employee's emergency VPN credentials. " +
      "Three key employees had access or were active on the network tonight. Review the digital forensics, cross-examine the chat logs and system timestamps, and identify the rogue insider.",
    victim: "Apex Financial Data Vault",
    stolenAsset: "Encrypted User Database (`customers_prod_v2.sql.gz`)",
    investigatorNotes:
      "Carefully inspect all 6 clues. Pay special attention to MAC hardware addresses, chat timestamps, and terminal command flags."
  },

  // 3 Distinct Suspects
  suspects: [
    {
      id: "suspect-elena",
      name: "Elena Vance",
      role: "Lead Database Administrator",
      avatar: "👩‍💻",
      badgeClass: "badge-blue",
      motive: "Passed over for Chief Technology Officer promotion last week; submitted resignation 48 hours ago.",
      alibi: "Claims she was asleep at home from 11:00 PM with her company laptop turned off in her bag.",
      suspicionLevel: "High (Her credentials were used to initiate the breach)",
      quote: "\"Someone stole my credentials. I've given 5 years of loyalty to this firm—I would never burn it down.\""
    },
    {
      id: "suspect-marcus",
      name: "Marcus Chen",
      role: "Senior Security & Penetration Tester",
      avatar: "🕵️‍♂️",
      badgeClass: "badge-amber",
      motive: "Faces massive margin call debts on offshore crypto exchanges; was asking colleagues about encryption keys.",
      alibi: "Claims he was running scheduled automated penetration tests from home overnight.",
      suspicionLevel: "Medium (Has deep knowledge of log evasion and firewall loopholes)",
      quote: "\"My automated pen-test was scheduled weeks ago. You're looking at routine testing traffic, not a breach.\""
    },
    {
      id: "suspect-chloe",
      name: "Chloe Torres",
      role: "Principal Cloud & DevOps Architect",
      avatar: "👩‍🔬",
      badgeClass: "badge-purple",
      motive: "Quietly registered an LLC for a rival financial analytics startup launching next quarter.",
      alibi: "Claims she was at a public 24-hour hackathon across town, coding live on a community stream.",
      suspicionLevel: "Medium (Has root administrative keys to the AWS cloud storage buckets)",
      quote: "\"Check the livestream VOD and public git commits. I was writing code in front of 300 developers all night.\""
    }
  ],

  // 6 Interactive Clues
  clues: [
    {
      id: "clue-1",
      title: "VPN Access Log & Hardware Fingerprint",
      type: "log",
      typeLabel: "Network Log",
      badge: "🔍 Hardware Audit",
      shortDescription: "Security gateway login record at 02:41:18 AM.",
      detailContent: `
[GATEWAY-AUTH-AUDIT]
TIMESTAMP: 02:41:18 UTC
USER_ACCOUNT: elena.vance@apexfin.internal
AUTH_METHOD: Emergency_Bypass_Token_#4
STATUS: GRANTED
ORIGIN_IP: 192.168.1.104 (Encrypted Tunnel)
HARDWARE_MAC: 00:1A:2B:3C:4D:9E
REGISTERED_HARDWARE_OWNER: Marcus Chen (Dell XPS 15 - Security Lab Bench #3)

FORENSIC NOTE:
Although Elena Vance's user credentials were submitted, the physical MAC address bound to this connection belongs exclusively to Marcus Chen's secondary lab machine!
      `
    },
    {
      id: "clue-2",
      title: "Internal Slack Chat Log (01:15 AM)",
      type: "chat",
      typeLabel: "Chat Transcript #1",
      badge: "💬 Slack Internal",
      shortDescription: "Private message thread between Marcus and Elena 1 hour before the breach.",
      detailContent: `
=== SLACK DIRECT MESSAGE LOG (01:15 - 01:22 AM) ===
[01:15] Marcus Chen:
"Hey Elena, quick question. Did you push the emergency DB credentials to our shared staging vault or leave them in the local test repo?"

[01:18] Elena Vance:
"Marcus, why are you asking me that at 1 AM? No, they are locked in my hardware YubiKey. I am going to sleep, please don't ping me."

[01:19] Marcus Chen:
"No worries! Just auditing our disaster recovery paths for tonight's test. Rest up."

[01:22] Elena Vance:
"Goodnight."
[STATUS: Elena Vance went offline at 01:23 AM]
      `
    },
    {
      id: "clue-3",
      title: "Encrypted Messenger DM (02:50 AM)",
      type: "chat",
      typeLabel: "Chat Transcript #2",
      badge: "💬 Dark Web DM",
      shortDescription: "Interpreted encrypted message sent 8 minutes after data exfiltration.",
      detailContent: `
=== SHADOW-RELAY INTERCEPT (02:50 AM) ===
SENDER: [Anonymous_Node_77]
RECIPIENT: @shadow_broker_darknet

MESSAGE:
"Database dump payload secured (customers_prod_v2.sql.gz). 
50,000 USDT deposit address: 0x9F4b81cE2...
Sending verify hash: 8f9b3c4...
Elena's credentials worked flawlessly for the entry trace. Transfer the crypto immediately."

IP SUBNET TRACE:
Host machine matches residential ISP block assigned to:
Marcus Chen (72.14.201.88 - Oakwood Residences).
      `
    },
    {
      id: "clue-4",
      title: "Server Bash Command History (.bash_history)",
      type: "terminal",
      typeLabel: "Terminal History",
      badge: "💻 Console Log",
      shortDescription: "Commands executed on the main server during the breach window.",
      detailContent: `
=== SERVER PRODUCTION NODE 01 - BASH HISTORY ===
[02:40:02] cd /var/data/apex/
[02:40:35] mysqldump -u root -p apex_customers > customers_prod_v2.sql
[02:41:40] tar -czf customers_prod_v2.sql.gz customers_prod_v2.sql
[02:42:01] python3 /home/marcus/scripts/auto_pen_test.py --exfiltrate --dest 72.14.201.88
[02:42:25] rm customers_prod_v2.sql
[02:42:30] history -c && exit

FORENSIC NOTE:
Notice the script path executed: '/home/marcus/scripts/auto_pen_test.py' disguised with an '--exfiltrate' flag pointing straight to an external IP.
      `
    },
    {
      id: "clue-5",
      title: "Elena Vance's Laptop Power Diagnostics",
      type: "hardware",
      typeLabel: "Hardware Audit",
      badge: "⚡ Power Diagnostics",
      shortDescription: "Smart-docking station power and battery telemetry for Elena's machine.",
      detailContent: `
=== APEX SMART-DOCK TELEMETRY REPORT ===
DEVICE: Lenovo ThinkPad X1 (Elena Vance - Asset #EV-8842)
STATUS SUMMARY (00:00 AM - 06:00 AM):
- 01:23:44 AM -> System Shutdown initiated by User.
- 01:24:00 AM -> Power draw dropped to 0.0W (Lid closed, battery offline).
- 02:42:00 AM -> Power draw: 0.0W (Device completely dormant during breach).

CONCLUSION:
Elena Vance's physical machine was completely powered off at the exact time her user account credentials logged into the cloud gateway.
      `
    },
    {
      id: "clue-6",
      title: "Chloe Torres's Livestream & Git Activity",
      type: "alibi",
      typeLabel: "Alibi Verification",
      badge: "🎥 Live Public Feed",
      shortDescription: "Public GitHub commits and conference hackathon broadcast records.",
      detailContent: `
=== METROPOLIS HACKATHON LIVE STREAM LOG ===
EVENT: 24-Hour Web3 & Fintech Build Marathon (Hall B)
CONTESTANT: Chloe Torres (Team 'Decentral')

TIMELINE:
- 01:45 AM -> On stage for live code demo on Twitch stream #HACK-METRO.
- 02:40 AM - 02:45 AM -> Pushed 4 signed commits to GitHub repo 'metropolis/hackathon-v1'.
- 02:44 AM -> High-definition camera footage shows Chloe actively talking with event judges on stage.

CONCLUSION:
Chloe Torres has an ironclad, externally verified alibi with synchronized video footage and public commit timestamps.
      `
    }
  ],

  // Solution details
  solution: {
    culpritId: "suspect-marcus",
    culpritName: "Marcus Chen",
    title: "Case Solved! The Penetration Tester Went Rogue",
    summary:
      "Marcus Chen weaponized his security privileges and stole Elena Vance's credentials to frame her while stealing the database to pay his crypto trading debts.",
    breakdown: [
      {
        clue: "Clue #1 (MAC Address)",
        detail: "The VPN gateway captured the MAC address `00:1A:2B:3C:4D:9E`, which matches Marcus Chen's lab laptop, despite logging in as Elena."
      },
      {
        clue: "Clue #3 & #4 (Terminal & Dark Web DM)",
        detail: "The server bash history showed his script `/home/marcus/scripts/auto_pen_test.py` was passed the `--exfiltrate` flag. His intercepted DM confirmed he demanded 50k USDT and bragged about using Elena's credentials as a cover."
      },
      {
        clue: "Clues #5 & #6 (Eliminating Suspects)",
        detail: "Elena's laptop drew 0.0W power (shut down at 01:23 AM), and Chloe was live on stage in front of hundreds at the Metropolis Hackathon with synchronized camera logs."
      }
    ]
  }
};
