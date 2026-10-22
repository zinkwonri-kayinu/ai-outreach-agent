---
name: prospect-outreach
description: Research a prospect from a domain, website URL, or email address, pick the best-fit lead magnet/offer from a library of 15 GTM offers, and write a cold email (<80 words) and LinkedIn DM (<40 words) in the sender's voice. Use when the user gives a domain, company URL, or prospect email and wants outreach, a pitch, or "the best offer" for them.
---

# Prospect Outreach

Input: a domain (`acme.com`), a URL, or an email (`jane@acme.com`). There may be several; run the whole workflow for each one.

Output: a research brief, the chosen offer with a runner-up, and two angles (problem-first and offer-first). Each angle has one email and one LinkedIn DM.

## 1. Parse the input
- Email: the domain comes after `@`. Guess the person's name from the local part (`jane.doe` → Jane Doe) and confirm it during research. Generic inboxes (info@, hello@, sales@) mean there is no person, so treat the input as a domain.
- Domain/URL: the company is known. You have to find the contact (step 3).
- Lines that are blank, `undefined`, or not an email/domain: skip them and say so in the output.

## 2. Load context (always, before writing)
Read these files every run. They may have been updated.
- `context/profile.md`: who the sender is, their real results and their tools. Use only facts from this file for credibility claims.
- `context/style-guide.md`: the "avoid AI slop" style guide.
- `references/offers.md`: the 15 offers and the rubric for choosing between them.
- `references/voice.md`: message structures, templates, and the hard rules.

## 3. Research
Go deep enough to find **one or two specific, true hooks**. Stop when you have them plus enough signal to choose an offer. Most prospects need about 6-12 lookups.

**Website** (WebFetch): homepage, product/pricing, customers/case studies, about/team, careers.
Note what they sell, who they sell to (their ICP), deal size (sales-led or self-serve), team names, and any open roles.

**Web search** (WebSearch): `"<company>" funding`, `"<company>" hiring SDR OR BDR OR "RevOps" OR "GTM engineer"`, recent news and launches, their main competitors, and any tools they use (Clay, HubSpot, Salesforce, Apollo, Outreach, Smartlead, n8n, etc.). Job posts often name the tools.

**LinkedIn** (optional, Claude in Chrome with the user's logged-in session). Load the Chrome tools in one ToolSearch call first.
- Company page: headcount, recent growth, recent posts.
- The target person's profile and their last ~5 posts/activity.
- **Read only.** Never connect, follow, like, comment, message, or click anything that changes state. If Chrome isn't connected, keep going with web search results and mark LinkedIn as "not checked" in the brief.

**Pick the contact** (domain-only input):
- Under ~30 people: Founder/CEO.
- 30-200 people: Head of Growth / VP Sales / Head of RevOps / Head of Marketing, whoever owns pipeline.
- Over 200 people: Head of RevOps, Sales Ops, or GTM Ops leader, or a sales leader who is actively posting.
- Prefer someone who posts about pipeline, outbound, or hiring sales. Give their name, title and profile URL.

**Check the role fits.** If the contact turns out not to own pipeline (engineering, people, finance), adapt the offer to their world (a working build for engineers, recruiting automation for people leaders) and flag it in the output.

Never invent facts. If you can't find something, say "not found". Don't guess.

## 4. Choose the offer
Follow `references/offers.md`:
1. List the signals you found.
2. Map them to candidate lead magnets (1-10) with the rubric.
3. Choose **one lead magnet and one framing (11-15)**. The framing is the benefit the message leads with.
4. Name the runner-up and say in one line why it lost.

Prefer the offer that ties to a **specific thing you saw**, like a job post, a founder's post, a tool in their stack, or a funding round, over a generic one.

## 5. Write the messages
Follow `references/voice.md`. Write two angles:

- **Angle A, problem-first**: name the specific problem or opportunity you saw at *their* company, say what you'll build or give them, then make a soft ask.
- **Angle B, offer-first**: say what you'll build for them, add one credibility line from `context/profile.md`, then make a soft ask. Use the result that best matches their situation.

Each angle gets:
- **Email**: subject line of 2-5 lowercase-ish words, body **under 80 words** (the sign-off counts, the subject doesn't).
- **LinkedIn DM**: **under 40 words**, no subject, no formal sign-off (the first name alone is fine).

## 6. Self-check (fix before output, don't just report)
- Word counts are under the limits. Count them. Don't estimate. For batches, run `scripts/export-csv.js`, which fails on any limit breach.
- There are zero em dashes (—).
- None of the patterns or words from the style guide appear: myth flip, rule of three, movie trailer, reversal, upsell, throat-clear, or words like leverage, streamline, seamless, robust, delve.
- Each message has at least one detail that only fits this prospect.
- Every claim about the sender comes from `context/profile.md`. Every claim about the prospect comes from research.
- Sentence lengths vary. It doesn't read like a template.

## 7. Output format

Single prospect:

```
## <Company> - <domain>
**Contact:** <Name>, <Title> (<LinkedIn URL or "not found">)

### Research brief
- <5-8 bullets: what they sell, ICP, size/stage, GTM motion, stack, hiring, recent news/posts. Add a source link in brackets.>

### Offer
**Pick:** <#> <Lead magnet> + <framing>. <1-2 sentences on why, tied to signals>
**Runner-up:** <#> <Lead magnet>. <why it lost>

### Angle A: problem-first
**Email** (<n> words)
Subject: <subject>
<body>

**LinkedIn DM** (<n> words)
<body>

### Angle B: offer-first
(same shape)
```

Batch (several prospects, or the user asks for a CSV): write the rows to a JSON file and run `node scripts/export-csv.js <rows.json> <out.csv>`. Columns: `full_name, email, subject_1, message_1, subject_2, message_2, linkedin_dm`. Then list anything to verify before sending (unconfirmed names, roles that don't own pipeline, claims with no date).
