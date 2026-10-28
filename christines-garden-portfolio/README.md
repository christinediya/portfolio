# Christine's Garden

The portfolio of **Christine Gomes**, a marketing coordinator and designer based in Silver Spring, MD.

It's an interactive, printmaking-style garden. Each tree holds a different part of my work:

| Tree | What's on it |
| --- | --- |
| Mango tree | Projects |
| Orange grove | Experience |
| Cherry vine | Skills |
| Lemon tree | About me |
| Fruit stand | Contact |

Short on time? Click **Get the TL;DR** for a one-minute summary.

## Case studies

- [Green Business Spotlights: Storefront Reels](projects/storefront-reels/)
- [UME Native Plants Redesign](projects/native-plants/)
- [MVA Website Redesign](projects/mva/)
- [Vera: AI Detection Tool](projects/vera/)
- [Wellness Street](projects/wellness-street/)

## How it's built

Plain HTML, CSS and JavaScript, with no build step and no frameworks. The garden art is drawn as inline SVG. Every page works on its own, so the site can be hosted on GitHub Pages (or any static host) by serving this folder as is.

```
index.html                 the garden (home page)
assets/dc-lite.js          tiny renderer for the Vera and Wellness Street walkthroughs
projects/<name>/index.html one folder per case study, with its images and videos
```

To preview locally, open `index.html` in a browser.
