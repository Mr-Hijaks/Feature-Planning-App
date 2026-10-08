# Haunted Zoo Studio

New public site: https://haunted-zoo-studio.onrender.com

## Editable source and deployment

- Hosting: Render static site **haunted-zoo-studio** (Render service ID srv-db42gb49v7es738sfd10).
- Repository: Mr-Hijaks/Feature-Planning-App, isolated branch **haunted-zoo-site**. Other project branches remain untouched.
- Render is configured for this branch and auto-deploy on commits.
- Core pages: /, /stickers, /coloring; collection filters use ?collection=ID; search uses ?q=term.

## Modular data

- data/catalog.json: 20 completed eldritch sticker RECORDS (original PNG and PDFs not on the public hosting yet).
- data/drafts.json: 119 filename-derived candidate items, all **unverified and unpublished**. 59 sticker candidates and 60 coloring-page candidates.
- A creature can belong to multiple collections; tags are additive.
- Black and white is the only art format, not a tag.
- Artwork URLs must only be marked public when the real asset is hosted and verified.

## Local artwork importer (temporary bridge)

The Import ZIP / PNG / PDF control loads art only into the visitor's browser IndexedDB. It never uploads files to the live site. The Haunted_Zoo_Collections_Fix_and_20_Eldritch_Stickers.zip from the existing project contains 20 PNGs and 20 4x2-inch PDFs; selecting that ZIP associates its /assets/eldritch-vol-2 paths with these 20 catalog records for that device. Other devices will continue seeing the honest placeholders until public image and PDF assets are deployed to Render.

## Next deployment enhancement

Move canonical media files into assets/eldritch-vol-2/ via GitHub source control (20 PNGs + 20 PDFs) or add an authorized managed cloud storage backend. Until then, do NOT claim that imagery is public. Keep candidate drafts separate from published art.

## User controls

As a GitHub repository owner, edit /data/catalog.json or /data/drafts.json on this branch, and Render will redeploy when configured Git integration delivers a commit event. For future assistant-driven updates, update these JSON manifests and image assets in the same branch; do not overwrite the original chatgpt.site.
