# Internal Linking Strategy for EasyTarget

## Purpose
Internal linking helps:
- Google understand site structure and content relationships
- Users discover related content
- Distribute page authority across the site
- Establish topical clusters

## Site Structure

```
Home
├── Blog (topical authority)
│   ├── Start with self-hosted N8N (guide)
│   ├── Security Best Practices (security)
│   └── ROI Calculation (business case)
│
└── Portfolio (case studies/social proof)
    ├── Banking Data Integration
    ├── Marketing Budget Automation
    ├── E-commerce Inventory Sync
    ├── E-commerce Order Recovery
    ├── AI Task Management
    ├── Service Account Management
    ├── Automated Financial Reports
    └── File-Based Data Sync
```

## Linking Rules

### 1. Blog-to-Blog Links (Topical Clusters)
Each blog post should link to 1-2 other blog posts:

- **Start with self-hosted N8N** → "Security Best Practices" (natural mention of securing N8N)
- **Security Best Practices** → "ROI Calculation" (mention: secure automation ROI)
- **ROI Calculation** → "Start with self-hosted N8N" (mention: cost of self-hosting)

### 2. Blog-to-Portfolio Links (Proof Points)
Each blog post links to 2-3 relevant portfolio items:

- **Security Best Practices** → Banking Data Integration (secure financial data)
- **ROI Calculation** → Marketing Budget Automation (measurable time savings)
- **ROI Calculation** → Automated Financial Reports (business impact)
- **Start with self-hosted N8N** → Any 3 portfolio items (show N8N use cases)

### 3. Portfolio-to-Blog Links (Authority)
Portfolio items link back to relevant blog posts:

- **Banking Data Integration** → Security Best Practices (compliance, security)
- **Marketing Budget Automation** → ROI Calculation (ROI mention)
- All portfolio items → Start with N8N (if N8N is platform used)

### 4. Home Page Links
Homepage should link to:
- Most important portfolio items (3-4 top ones)
- Blog landing page (increase blog authority)
- 1-2 key blog posts

### 5. Navigation
- Add "Blog" section to main navigation
- Blog index page should list all posts with brief descriptions
- Add "Related Posts" section at the end of each blog post

## Anchor Text Guidelines

**Good anchor text:**
- "Read our guide on securing N8N instances"
- "Learn how we calculated ROI for this project"
- "See similar case studies in banking"

**Bad anchor text:**
- "Click here"
- "Read more"
- "Link"

**Best practices:**
- Use 2-4 word anchor text
- Include target keyword when relevant
- Vary anchor text across links to same page
- Maximum 3-5 internal links per 1,000 words

## Frequency

### Phase 2 (Now)
- Add 2-3 internal links to each blog post
- Add 1-2 internal links to each portfolio item
- Update homepage with blog links

### Phase 3 (Later)
- Optimize anchor text across all pages
- Add "Related Posts/Projects" sections
- Create content clusters for topical authority

## Link Distribution Target

| Page Type | Outbound Links | Inbound Links |
|-----------|--|--|
| Homepage | 5-7 | N/A |
| Blog Post | 3-5 | 3+ (from other posts) |
| Portfolio Item | 2-3 | 2+ (from blog/home) |

## Monitoring

After implementation, track:
- Internal link clicks (in analytics)
- Click distribution (which linked pages get most traffic)
- Bounce rate on linked content
- Ranking improvements for linked pages

## Additional Notes

- All links should open in same tab (don't use target="_blank" for internal links)
- Use full URLs for cross-language links (to allow proper hreflang)
- No link sculpting with rel="nofollow" on internal links (let PageRank flow)
