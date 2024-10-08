# OATTS

Welcome to OATTS! If you're a student looking to install OATTS, please visit [The OATTS Website](https://af-oatts.github.io). If you're interested in how OATTS works, want to contribute, or build similar products, you're in the right place! Keep reading to see installation instructions 

# Getting Started

### Requirements

#### Install Rust

Download and install [Rust](https://www.rust-lang.org/tools/install). You may need to restart the system to enable the command `rustup` in vscode.

#### Install pnpm

```bash
npm install -g pnpm@latest
```

### Clone Content into Public Folder

This will load test modules into the public folder

```bash
git submodule update --init --recursive
```

## Development Environment

To start the development environment as a Tauri app, run the following:

```bash
pnpm tauri dev
```

# Core Concepts
This section outlines the core concepts of OATTS as a whole as well as the underlying concepts to the code.
## Purpose
OATTS is a downloadable learning app with the purpose of aiding AFOQT or TBAS test-takers in concept familiarization. Fundamentally, it's an **offline LMS**, in that it serves to display SCORM content and track learner progress. Being offline, it does not fetch any external data nor does it push any data to a remote server. To learn more, see the [security](#security) section.

OATTS also serves as a research study for the United States Air Force to aid in the development of better placement/qualifying tests, as well as for improvements to OATTS itself. No study data is sent to the Air Force without explicit consent, and the data must actually be manually sent by participants. OATTS is incapable of automatically sending any data to any server. 

## Important Definition: "Content"
The word content when referring to OATTS is slightly ambiguous. Content has two definitions:
* Lessons, quizzes, etc. Such as SCORM *content* or PDF *content*.
* Anything found in the [public/oatts](public/oatts/) folder. 
In general, when referring to content, it's anything in the [public/oatts](public/oatts/) folder. Only in contexts where it makes sense to differentiate low level vs. high level content does the word "content" refer to the lowest level, and the rest are referred to as modules and submodules. See [Other Definitions](#other-definitions)

## Other Definitions
* **Module**: Basically a course. A module is the highest level in the lesson heirarchy, and is what is shown at the OATTS homepage. For example, Math Knowledge is a module. These definitions were a little shaky throughout development, so in certain places in the code you may see something referred to as a module, when really it's a *Submodule*.
* **Submodule**: A submodule is a folder underneath a *Module*. It can hold [*Content*](#important-definition-content) or more *Submodules*.


# Technologies
These are the technologies employed by OATTS, and why we use them.
## SCORM
For a more generic definition see [SCORM.com's definition](https://scorm.com/scorm-explained/one-minute-scorm-overview/). For the technical purposes of OATTS, **SCORM** (Shareable Content Object Reference Model) is the **communication method** between an HTML/CSS/JS bundle (called a **SCORM package**), and its **host LMS**. IE: The way learning content housed within an iFrame can talk to the host LMS (page) about the grades, progress, etc. 

SCORM is over 25 years old, and thus is significantly different than modern cross-site communication channels (largely why xAPI was invented). It starts with the SCORM package creating a Javascript object called `API_1484_11` (or just `API` for older SCORM versions) as high up the DOM as it can (usually at the iFrame root). This object is shared between the package and the LMS. Both sides can interact with this shared object. The exact format in which data is exchanged through this object is defined by the SCORM standard. *In OATTS' case, only the SCORM 2004 Standard is fully supported.*

SCORM support is required for all LMS products within the DoD according to Executive Order 13111. Due to time constraints, xAPI was not implemented in OATTS. Future versions may recieve support for it however. OATTS still complies with DoDI 1322.26, in that the implementation of xAPI proved to be impractical, thus invoking the exception of Paragraph 3(a)2.

## Tauri
Since SCORM is HTML and Javascript, naturally the best way to display this is inside HTML. To provide a smooth desktop experience with an offline HTML frontend, OATTS uses [Tauri](tauri.dev). Tauri was chosen due to its security, minimal bundle size, and use of Rust, a memory safe language, which the White House has urged DoD components to utilize. 

## React
OATTS uses React for the frontend. This was chosen over other frameworks simply due to its prevalence in the industry and vast frameworks.

## i18n
I18Next (i18n) is a localeization library. Much of the text seen in OATTS (except for SCORM packages) is configured in i18n. **Currently only english is supported.** Since updates to the text are more conceptually attributable to *content*, the translations are kept in the [public/oatts/locales](public/oatts/locales/) folder. This way also they can be edited completely separately from any OATTS code.


# Codebase
## Routing
OATTS utilizes [Tanstack Router](https://github.com/TanStack/router) for routing. The main router is supplied via React Context, and the provider is found in [App.tsx](src/App.tsx). Each file under routes corresponds with its own unique route. Most routing takes place during onboarding. With the exception of a few styling tags, there is no UI code under routes, but instead the route displays pages found in the [components](src/components/) folder. Upon build, tanstack router generates [routeTree.gen.ts](src/routeTree.gen.ts) which holds info for OATTS to actually navigate at runtime.
## UI
OATTS utilizes MUI as well as custom CSS to style components. The UI is 99% in the [components](src/components/) folder. The other 1% is scattered among routes and is just styling modifiers. 

Except for the [common](src/components/common/) folder, folders under [components](src/components/) correspond to a "section" of the UI. So onboarding (user selection, user creation, Terms & Conditions, etc.) are in the onboarding folder. The sorting isn't super strict, it's just generally what makes sense. For example, the About page isn't technically part of the dashboard, but it's only accessible via the dashboard, so it generally makes sense to keep it in the dashboard folder. 

The [common](src/components/common/) folder holds common UI components. This includes buttons that are reused, indicators, etc. Sometimes the components aren't actually used in multiple spots, but are nonetheless built to be versatile enough such that they can be.

Styling is usually done directly on the components, but certain styles and theming code is found in the [theme](src/theme/) folder. This folder holds various style modifiers that are used throughout numerous components in OATTS.
## Core
The majority of the processing and "backend" of OATTS happens in the [core](src/core/) folder. This is where data models are housed, as well as the code to talk to SCORM, among many other various features. The names of the folders mostly correspond to a feature or a section of OATTS as described in the [UI](#ui) section. That is except for the [model](src/core/model/) folder which holds POJOs for use across the app, and no real logic happens there.

# Security
## Privacy
OATTS does not share any data without explicit permission. Additionally, user email addresses are NOT shared. Upon export, OATTS salts (see section on salting) the user's email address, and SHA256 hashes it. This way, the data is uniquely identifiable, but nevertheless anonymized. See [src-tauri/src/utils/exporter.rs](src-tauri/src/utils/exporter.rs) to see the exact process.

### Salting
The salt OATTS uses is consistent across installations and versions. This does undermine the efficacy of such salt, but nonetheless makes it more difficult to be attacked using a rainbow table generated from a different breach and its salt. That is, a new rainbow table would need to be generated for OATTS specifically. This is the maximum salting OATTS can do however whilst being able to consistently identify users across multiple computers. That is, if someone did OATTS on computer A, then moved to computer B, putting in the same email address, this person's data would be known to be from the same person. The consistent salt does **not** break the anonymization, but it is more susceptible to rainbow table deanonymization attacks than a fully randomized salt.
## Data Security
When OATTS stores data on a computer, that data is *unencrypted*. This may change in future versions with introduction of passwords for user accounts. 

However, **data in transit is encrypted**. When OATTS exports data per a user's request, it generates a unique AES-256-GCM key, and encrypts the data with it. Then the key is encrypted using an RSA [public key]() shipped with OATTS, which changes on every new version. The corresponding private key is held exclusively by our researchers. To see the exact encryption process, see [src-tauri/src/utils/exporter.rs](src-tauri/src/utils/exporter.rs), specifically the `export_data` function.