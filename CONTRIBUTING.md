# Contributing to HairStack

Thank you for your interest in improving HairStack! This project is community-maintained and welcomes contributions.

## How to Contribute

### 🌍 Add Products for Your Country

The easiest way to contribute. Create an `app/data/products-{country}.json` file following the format of [products-india.json](app/data/products-india.json).

1. Fork the repo
2. Copy `app/data/products-india.json` as a template
3. Replace with products available in your country
4. Submit a PR

### 📊 Submit New Treatment Evidence

If you know of a clinical study we haven't included:

1. Open an Issue with the study link (must be PubMed, NIH, or peer-reviewed journal)
2. Include: study title, year, sample size, key finding, DOI/URL
3. We'll review and add it to our evidence database

### 🐛 Report Issues

- Use GitHub Issues
- Include: browser, device, steps to reproduce

### 🌐 Translations

We'd love to support more languages. If you can help translate:

1. Fork the repo
2. Create translated JSON files in `app/data/` directory
3. Submit a PR

## Evidence Standards

All treatment recommendations MUST be backed by:
- At least 1 published clinical study (PubMed/NIH preferred)
- Peer-reviewed or from a recognized medical institution
- Sample size ≥ 10 participants

We do not accept anecdotal evidence, blog posts, or marketing materials.

## Code of Conduct

Be respectful. This project helps people dealing with a sensitive topic. Keep discussions professional and evidence-focused.
