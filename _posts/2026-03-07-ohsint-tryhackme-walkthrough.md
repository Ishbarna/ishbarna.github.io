---
title: "OhSINT : TryHackMe Walkthrough"
date: 2026-03-07 00:00:00 +0545
categories: [TryHackMe, OSINT]
tags: [ohsint, tryhackme, osint, ctf]
media_subpath: /assets/posts/ohsint/
---
---

## Introduction

Open Source Intelligence (OSINT) is the process of **collecting and analyzing publicly available information** from sources such as websites, social media, public records, and online platforms. In cybersecurity, OSINT is commonly used during the reconnaissance phase to gather information about a target before deeper security testing.

Platforms like TryHackMe provide practical challenges such as **OhSINT** to help learners understand how publicly available data can reveal valuable intelligence.

## Challenge Description

> What information can you possibly get with just one image file?

**Note:** This challenge was updated. If you are following any older walkthroughs, expect a small change. Additionally, the file is also available on the AttackBox, under the `/Rooms/OhSINT` directory.

## Understanding the Challenge

Before diving into the challenge, we need to grab the Task Files. Just hit the bright blue button at the top of Task 1 labeled **Download Task Files**, and let's get rolling!

The room presents a single image file as the starting point called:

`WindowsXP_1551719014755.jpeg`

Challenge Image:

![OhSINT Challenge Image](WindowsXP_1551719014755.jpg)

At first, the image looks normal and nothing unusual appears. But in OSINT, important information is often hidden. So our first step is to check the **image metadata** to see if it contains any useful clues that can lead us to the next step.

## Checking Image Metadata

To analyze the image, I used the online tool **Metadata2Go**. This tool allows users to upload a file and view its hidden metadata directly in the browser without installing any software. It can reveal information such as the author, creation date, camera details, GPS coordinates, and other embedded data inside the file.

Using the **Metadata Viewer** page, I uploaded the image and examined its metadata to look for useful clues that could help continue the OSINT investigation.

Alternatively, we can use `exiftool` from the command line as well:

```bash
exiftool WindowsXP_1551719014755.jpeg
```

This revealed two important pieces of information:

> **GPS Coordinates:** 54°17'41.27" N, 2°15'1.33" W

> **Copyright Information:** OWoodflint

The name **OWoodflint** looked like a username, so the next step was to search for it on Google to find more clues.

## Searching for OWoodflint

First, I took the name and searched for it on Google. It led me to three online accounts, including **GitHub** and **X (formerly Twitter)**.

I checked the X profile and saw a user profile with a cat avatar. Next, I checked their GitHub page and found two key pieces of information.

Their README confirmed that they are from **London**, answering the second question.

On top of that, I also discovered their personal email address:

**[OWoodflint@gmail.com](mailto:OWoodflint@gmail.com)**

in the same README file.

### Task Answers

**Task 1: What is this user's avatar of?**

> Cat

**Task 2: What city is this person in?**

> London

**Task 4: What is his personal email address?**

> [OWoodflint@gmail.com](mailto:OWoodflint@gmail.com)

**Task 5: What site did you find his email address on?**

> GitHub

## Finding the Holiday Destination

On the GitHub README file, there was a WordPress website.

I saw that he mentioned:

> "I'm in Newyork right now"

This gave us the answer to the next question.

**Task 6: Where has he gone on holiday?**

> New York

## Finding the Wi-Fi SSID

After solving questions 1, 2, 4, 5, and 6, the next step was to answer the third question: finding the **SSID of the wireless access point** he was connected to.

While looking through his **X (formerly Twitter)** account, I found a tweet that included a **BSSID**:

```text
B4:5D:50:AA:86:41
```

A BSSID is a unique identifier for a wireless access point, similar to a fingerprint for Wi-Fi networks.

To discover the **SSID (the Wi-Fi network name)** linked to this BSSID, I used **Wigle.net**.

## What is Wigle.net?

Wigle (Wireless Geographic Logging Engine) is a database that maps Wi-Fi networks around the world. It stores information about **BSSIDs, SSIDs, and their locations**.

By searching for a **BSSID** on Wigle, we can find the **SSID (Wi-Fi network name)** and other related details.

**Note:** Wigle now requires an account to search the database. New accounts can only make **5 detailed searches per day**, so it's important to use them carefully.

After logging in, enter the **BSSID** in the search bar and apply the filter. When the results appear, zoom out on the map.

Since we already know the location is **London**, move the map to that area. You should see a **red circle showing the location of the Wi-Fi access point**.

Simply follow the ring, zooming in step by step, until you reach street level, where the SSID **UnileverWiFi** will be visible, uncovering the answer to the third question.

**Task 3: What is the SSID of the WAP he connected to?**

> UnileverWiFi

## Finding the Password

For the final question of this challenge, I first looked at their **X (formerly Twitter)** and **GitHub** accounts, but found no clues.

That meant my last option was to **inspect the source code** of the WordPress site.

After carefully going through the code, I noticed a **strange string of characters** hidden in plain sight. I had missed it at first, but once I found it, I realized the password was:

```text
pennYDr0pper.!
```

**Task 7: What is the person's password?**

> `pennYDr0pper.!`

## Conclusion

The **OhSINT challenge** was a fun way to learn **OSINT skills**. By looking at image metadata, social media, GitHub, and the WordPress site, I was able to uncover all the clues.

It shows that even small public details can reveal a lot when analyzed carefully.

**Happy Hacking!** 🔐
